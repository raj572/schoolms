<?php

namespace App\Services;

use App\Repositories\SubscriptionRepository;
use App\Repositories\SubscriptionPlanRepository;
use App\Models\Subscription;
use App\Models\SubscriptionHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class SubscriptionService
{
    protected $subscriptionRepository;
    protected $planRepository;
    protected $paymentService;

    public function __construct(
        SubscriptionRepository $subscriptionRepository,
        SubscriptionPlanRepository $planRepository,
        PaymentService $paymentService
    ) {
        $this->subscriptionRepository = $subscriptionRepository;
        $this->planRepository = $planRepository;
        $this->paymentService = $paymentService;
    }

    /**
     * Get all available plans
     */
    public function getAvailablePlans(): array
    {
        try {
            $plans = $this->planRepository->getAllActivePlans();

            return [
                'status' => true,
                'data' => [
                    'plans' => $plans,
                ],
            ];
        } catch (Exception $e) {
            Log::error('Error fetching plans: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch plans.',
                'data' => [
                    'plans' => [],
                ],
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Initiate subscription
     */
    public function initiateSubscription(array $data): array
    {
        try {
            DB::beginTransaction();

            $plan = $this->planRepository->findByCode($data['plan_code']);
            if (!$plan) {
                return [
                    'status' => false,
                    'message' => 'Invalid plan selected.',
                    'data' => null,
                ];
            }

            // Check if school already has an active subscription
            $existingSubscription = $this->subscriptionRepository->getCurrentSubscription($data['school_id']);
            
            $isRenewal = false;
            $extensionStartDate = null;
            
            if ($existingSubscription && in_array($existingSubscription->status, ['active', 'trial'])) {
                $isRenewal = true;
                // Start the new subscription from the existing end date
                $extensionStartDate = \Carbon\Carbon::parse($existingSubscription->end_date);
            }

            // Calculate dates
            $startDate = $extensionStartDate ?? now();
            $billingCycle = $data['billing_cycle'] ?? 'monthly';
            $trialDays = $data['trial_days'] ?? 0; // Default no trial
            $transactionId = $data['transaction_id'] ?? null; // If payment already completed

            // Handle both old plans (with annual_price) and new plans (with duration_days)
            if (isset($plan->duration_days) && $plan->duration_days > 0) {
                // New plan structure with duration_days
                $endDate = $startDate->copy()->addDays($plan->duration_days);
                $amount = $plan->monthly_price ?? $plan->price;
            } else {
                // Old plan structure with monthly/annual
                $endDate = $billingCycle === 'annual'
                    ? $startDate->copy()->addYear()
                    : $startDate->copy()->addMonth();

                $amount = $billingCycle === 'annual'
                    ? ($plan->annual_price ?? ($plan->monthly_price ?? $plan->price) * 12 * 0.9)
                    : ($plan->monthly_price ?? $plan->price);
            }

            // For renewals, don't use trial
            if ($isRenewal) {
                $trialDays = 0;
            }

            $isManual = (!empty($data['payment_method']) && in_array(strtolower($data['payment_method']), ['manual', 'cash', 'bank_transfer', 'cheque', 'admin_override', 'upi_offline'])) || !empty($data['is_manual']);

            // Determine status based on trial or payment completion
            $status = 'pending';
            if ($trialDays > 0) {
                $status = 'trial';
            } elseif ($transactionId || $isManual) {
                // If transaction_id or manual payment is provided, payment is completed
                $status = 'active';
            }

            // Ensure subscribed_by user exists in users table (foreign key safety)
            $userId = $data['user_id'] ?? null;
            $subscribedBy = null;
            if ($userId && User::where('id', $userId)->exists()) {
                $subscribedBy = $userId;
            } else {
                $subscribedBy = User::query()->value('id') ?? 1;
            }

            // Create subscription record
            $subscriptionData = [
                'school_id' => $data['school_id'],
                'plan_id' => $plan->id,
                'subscribed_by' => $subscribedBy,
                'billing_cycle' => $billingCycle,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'trial_end_date' => $trialDays > 0 ? $startDate->copy()->addDays($trialDays) : null,
                'amount' => $amount,
                'currency' => $plan->currency ?? 'INR',
                'status' => $status,
                'auto_renew' => true,
                'next_billing_date' => $endDate,
            ];

            $subscription = $this->subscriptionRepository->createSubscription($subscriptionData);

            if (!$subscription) {
                DB::rollBack();
                return [
                    'status' => false,
                    'message' => 'Failed to create subscription.',
                    'data' => null,
                ];
            }

            // Create manual transaction log if manual payment method selected
            if ($isManual) {
                try {
                    \App\Models\SubscriptionTransaction::create([
                        'school_id' => $data['school_id'],
                        'subscription_plan_id' => $plan->id,
                        'administrator_id' => $data['user_id'] ?? null,
                        'razorpay_order_id' => 'MANUAL_' . strtoupper(uniqid()),
                        'order_amount' => $amount,
                        'order_currency' => $plan->currency ?? 'INR',
                        'order_receipt' => 'manual_rcpt_' . uniqid(),
                        'order_status' => 'paid',
                        'status' => 'success',
                        'plan_name' => $plan->name,
                        'billing_cycle' => $billingCycle,
                        'duration_months' => $billingCycle === 'annual' ? 12 : 1,
                        'subscription_start_date' => $startDate,
                        'subscription_end_date' => $endDate,
                        'payment_method' => $data['payment_method'] ?? 'manual',
                        'notes' => $data['reference'] ?? 'Manual Payment Entry',
                    ]);
                } catch (Exception $e) {
                    Log::warning("Failed to create manual transaction record: " . $e->getMessage());
                }
            }

            // If trial or payment completed, activate immediately
            if ($trialDays > 0 || $transactionId || $isManual) {
                // Update user status
                User::where('id', $data['user_id'])->update([
                    'subscription_active' => true,
                    'registration_status' => 'active',
                ]);

                // Link payment transaction to subscription if transaction_id provided
                if ($transactionId) {
                    \App\Models\PaymentTransaction::where('transaction_id', $transactionId)
                        ->update(['subscription_id' => $subscription->id]);
                }

                // Log history
                SubscriptionHistory::create([
                    'subscription_id' => $subscription->id,
                    'school_id' => $data['school_id'],
                    'changed_by' => $data['user_id'],
                    'action' => ($transactionId || $isManual) ? 'subscription_activated' : 'trial_started',
                    'new_plan_id' => $plan->id,
                    'new_status' => ($transactionId || $isManual) ? 'active' : 'trial',
                    'notes' => $isManual
                        ? "Manual payment entered and subscription activated (" . ($data['reference'] ?? 'Manual Entry') . ")"
                        : ($transactionId
                            ? "Subscription activated after successful payment (Transaction: $transactionId)"
                            : "$trialDays day trial started"),
                ]);

                DB::commit();

                $message = ($transactionId || $isManual)
                    ? ($isRenewal ? 'Subscription renewed successfully! It will be activated after your current subscription ends.' : 'Subscription activated successfully.')
                    : ($isRenewal ? 'Subscription scheduled for renewal. It will be activated after your current subscription ends.' : 'Trial subscription activated successfully.');

                return [
                    'status' => true,
                    'message' => $message,
                    'data' => [
                        'subscription' => $subscription->fresh()->load('plan'),
                        'trial_days' => $trialDays,
                        'transaction_id' => $transactionId,
                        'is_renewal' => $isRenewal,
                        'current_subscription_end_date' => $isRenewal ? $existingSubscription->end_date : null,
                    ],
                ];
            }

            // Otherwise, initiate payment
            $paymentData = $this->paymentService->initiatePayment([
                'subscription_id' => $subscription->id,
                'school_id' => $data['school_id'],
                'user_id' => $data['user_id'],
                'amount' => $amount,
                'currency' => $plan->currency ?? 'INR',
            ]);

            if (!$paymentData['status']) {
                DB::rollBack();
                return $paymentData;
            }

            DB::commit();

            return [
                'status' => true,
                'message' => $isRenewal 
                    ? 'Subscription renewal initiated. It will be activated after your current subscription ends. Please complete payment.'
                    : 'Subscription initiated. Please complete payment.',
                'data' => [
                    'subscription' => $subscription->fresh()->load('plan'),
                    'payment' => $paymentData['data'],
                    'is_renewal' => $isRenewal,
                    'current_subscription_end_date' => $isRenewal ? $existingSubscription->end_date : null,
                ],
            ];

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Subscription initiation failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to create subscription: ' . $e->getMessage(),
                'data' => null,
            ];
        }
    }

    /**
     * Activate subscription after successful payment
     */
    public function activateSubscription(string $transactionId): array
    {
        try {
            DB::beginTransaction();

            $transaction = \App\Models\PaymentTransaction::where('transaction_id', $transactionId)
                ->with('subscription')
                ->first();

            if (!$transaction) {
                return [
                    'status' => false,
                    'message' => 'Transaction not found.',
                    'data' => null,
                ];
            }

            if ($transaction->status !== 'completed') {
                return [
                    'status' => false,
                    'message' => 'Payment not completed.',
                    'data' => null,
                ];
            }

            $subscription = $transaction->subscription;
            $subscription->update(['status' => 'active']);

            // Update user status
            User::where('school_id', $subscription->school_id)->update([
                'subscription_active' => true,
                'registration_status' => 'active',
            ]);

            // Log history
            SubscriptionHistory::create([
                'subscription_id' => $subscription->id,
                'school_id' => $subscription->school_id,
                'changed_by' => $transaction->user_id,
                'action' => 'activated',
                'new_plan_id' => $subscription->plan_id,
                'new_status' => 'active',
                'notes' => 'Subscription activated after payment',
            ]);

            DB::commit();

            return [
                'status' => true,
                'message' => 'Subscription activated successfully.',
                'data' => $subscription->fresh()->load('plan'),
            ];

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Subscription activation failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to activate subscription.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get current subscription for school
     */
    public function getCurrentSubscription(int $schoolId): array
    {
        try {
            $subscription = $this->subscriptionRepository->getActiveSubscriptionBySchool($schoolId);

            if (!$subscription) {
                return [
                    'status' => false,
                    'message' => 'No active subscription found.',
                    'data' => null,
                ];
            }

            return [
                'status' => true,
                'data' => $subscription,
            ];

        } catch (Exception $e) {
            Log::error('Get subscription failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch subscription.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check if school can access a specific feature
     */
    public function canAccessFeature(int $schoolId, string $feature): bool
    {
        $subscription = $this->subscriptionRepository->getActiveSubscriptionBySchool($schoolId);

        if (!$subscription || !$subscription->isActive()) {
            return false;
        }

        return $subscription->plan->hasFeature($feature);
    }

    /**
     * Check resource limits
     */
    public function checkResourceLimit(int $schoolId, string $resource, int $currentCount): array
    {
        $subscription = $this->subscriptionRepository->getActiveSubscriptionBySchool($schoolId);

        if (!$subscription) {
            return [
                'allowed' => false,
                'message' => 'No active subscription.',
                'current' => $currentCount,
                'limit' => 0,
            ];
        }

        $limitField = "max_$resource";
        $limit = $subscription->plan->$limitField;

        if ($limit === null) {
            return ['allowed' => true, 'unlimited' => true]; // Unlimited
        }

        if ($currentCount >= $limit) {
            return [
                'allowed' => false,
                'message' => "Limit reached. Your plan allows {$limit} {$resource}.",
                'current' => $currentCount,
                'limit' => $limit,
            ];
        }

        return [
            'allowed' => true,
            'current' => $currentCount,
            'limit' => $limit,
            'remaining' => $limit - $currentCount,
        ];
    }

    /**
     * Cancel subscription
     */
    public function cancelSubscription(int $subscriptionId, ?string $reason = null, ?int $userId = null): array
    {
        try {
            DB::beginTransaction();

            $subscription = $this->subscriptionRepository->findById($subscriptionId);

            if (!$subscription) {
                return [
                    'status' => false,
                    'message' => 'Subscription not found.',
                ];
            }

            $oldStatus = $subscription->status;

            $subscription = $this->subscriptionRepository->cancelSubscription($subscriptionId, $reason);

            // Log history
            SubscriptionHistory::create([
                'subscription_id' => $subscriptionId,
                'school_id' => $subscription->school_id,
                'changed_by' => $userId,
                'action' => 'canceled',
                'old_plan_id' => $subscription->plan_id,
                'old_status' => $oldStatus,
                'new_status' => 'canceled',
                'notes' => $reason,
            ]);

            DB::commit();

            return [
                'status' => true,
                'message' => 'Subscription canceled successfully.',
                'data' => $subscription,
            ];

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Cancel subscription failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to cancel subscription.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get subscription history
     */
    public function getSubscriptionHistory(int $schoolId): array
    {
        try {
            $history = SubscriptionHistory::where('school_id', $schoolId)
                ->with(['changedBy', 'oldPlan', 'newPlan'])
                ->orderBy('created_at', 'desc')
                ->get();

            return [
                'status' => true,
                'data' => $history,
            ];

        } catch (Exception $e) {
            Log::error('Get history failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch history.',
                'error' => $e->getMessage(),
            ];
        }
    }
}

