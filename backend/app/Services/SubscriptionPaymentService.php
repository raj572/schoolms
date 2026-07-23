<?php

namespace App\Services;

use App\Models\SubscriptionTransaction;
use App\Models\School;
use App\Models\SubscriptionPlan;
use App\Models\Subscription;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;
use Razorpay\Api\Api;
use Razorpay\Api\Errors\SignatureVerificationError;

class SubscriptionPaymentService
{
    /**
     * Create Razorpay order for subscription payment and store transaction.
     */
    public function createSubscriptionOrder(array $data): array
    {
        try {
            Log::info("Starting Razorpay subscription order creation", ['input' => $data]);

            // Get school and plan details
            $school = School::find($data['school_id']);
            if (!$school) {
                throw new Exception("School not found with id: {$data['school_id']}");
            }

            $plan = SubscriptionPlan::find($data['subscription_plan_id']);
            if (!$plan) {
                throw new Exception("Subscription plan not found with id: {$data['subscription_plan_id']}");
            }

            // Calculate amount based on billing cycle
            $billingCycle = $data['billing_cycle'] ?? 'monthly';
            $amount = $billingCycle === 'annual' ? floatval($plan->annual_price) : floatval($plan->monthly_price);

            // Validate minimum amount (Razorpay requires minimum ₹1)
            if ($amount < 1) {
                throw new Exception("Order amount (₹{$amount}) is less than minimum amount allowed (₹1). Please check subscription plan pricing.");
            }

            $amountInPaise = (int)($amount * 100);

            Log::info("Calculated amount", [
                'billing_cycle' => $billingCycle,
                'amount_in_rupees' => $amount,
                'amount_in_paise' => $amountInPaise,
                'plan_monthly_price' => $plan->monthly_price,
                'plan_annual_price' => $plan->annual_price
            ]);

            // Initialize Razorpay API
            $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));

            $receipt = 'sub_rcpt_' . uniqid();

            // Create Razorpay order
            $razorpayOrder = $api->order->create([
                'receipt' => $receipt,
                'amount' => $amountInPaise,
                'currency' => 'INR',
                'payment_capture' => 1
            ]);

            Log::info("Razorpay order created", ['response' => $razorpayOrder]);

            // Calculate subscription dates
            $durationMonths = $billingCycle === 'annual' ? 12 : 1;
            $startDate = now();
            $endDate = now()->addMonths($durationMonths);

            // Store transaction
            $transactionData = [
                'school_id' => $school->id,
                'subscription_plan_id' => $plan->id,
                'administrator_id' => $data['administrator_id'] ?? null,
                'razorpay_order_id' => $razorpayOrder['id'],
                'order_amount' => $amount,
                'order_currency' => $razorpayOrder['currency'],
                'order_receipt' => $razorpayOrder['receipt'],
                'order_status' => $razorpayOrder['status'],
                'order_created_at' => now()->setTimestamp($razorpayOrder['created_at']),
                'status' => 'pending',
                'plan_name' => $plan->name,
                'billing_cycle' => $billingCycle,
                'duration_months' => $durationMonths,
                'subscription_start_date' => $startDate,
                'subscription_end_date' => $endDate,
                'api_response' => json_encode($razorpayOrder),
            ];

            $transaction = SubscriptionTransaction::create($transactionData);

            return [
                'status' => true,
                'message' => 'Order created successfully',
                'data' => $transaction
            ];
        } catch (Exception $e) {
            Log::error("Failed to create Razorpay subscription order: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'status' => false,
                'message' => 'Failed to create order: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Verify Razorpay payment signature and update transaction.
     */
    public function verifyAndUpdatePayment(array $validated): array
    {
        try {
            // Find the transaction
            $transaction = SubscriptionTransaction::findOrFail($validated['transaction_id']);

            // Razorpay Signature Verification
            try {
                $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));

                $api->utility->verifyPaymentSignature([
                    'razorpay_order_id' => $validated['razorpay_order_id'],
                    'razorpay_payment_id' => $validated['razorpay_payment_id'],
                    'razorpay_signature' => $validated['razorpay_signature'],
                ]);
            } catch (SignatureVerificationError $e) {
                throw new Exception("Signature verification failed: " . $e->getMessage());
            }

            // Update the transaction
            $transaction->razorpay_payment_id = $validated['razorpay_payment_id'];
            $transaction->razorpay_signature = $validated['razorpay_signature'];
            $transaction->payment_date = now();
            $transaction->status = 'success';
            $transaction->remarks = 'Payment verified successfully';
            $transaction->save();

            // Create or update subscription record
            $this->createOrUpdateSubscription($transaction);

            // Update administrator's subscription status on user model
            if ($transaction->administrator_id) {
                $user = \App\Models\User::find($transaction->administrator_id);
                if ($user) {
                    $user->update([
                        'subscription_active' => true,
                        'registration_status' => 'active'
                    ]);
                    Log::info("Activated subscription on user model for administrator ID: {$user->id}");
                }
            }

            // Update school's subscription status
            $school = School::find($transaction->school_id);
            if ($school) {
                $school->subscription_status = 'active';
                $school->subscription_start_date = $transaction->subscription_start_date;
                $school->subscription_end_date = $transaction->subscription_end_date;
                $school->save();
            }

            return [
                'status' => true,
                'message' => 'Payment verified and subscription activated',
                'data' => $transaction->load(['school', 'subscriptionPlan', 'administrator'])
            ];
        } catch (Exception $e) {
            Log::error("Payment verification failed: " . $e->getMessage());

            return [
                'status' => false,
                'message' => 'Payment verification failed: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Create or update subscription record.
     */
    private function createOrUpdateSubscription(SubscriptionTransaction $transaction): void
    {
        try {
            // Check if active subscription exists
            $existingSubscription = Subscription::where('school_id', $transaction->school_id)
                ->where('status', 'active')
                ->first();

            if ($existingSubscription) {
                // Update existing subscription
                $existingSubscription->plan_id = $transaction->subscription_plan_id;
                $existingSubscription->billing_cycle = $transaction->billing_cycle;
                $existingSubscription->start_date = $transaction->subscription_start_date;
                $existingSubscription->end_date = $transaction->subscription_end_date;
                $existingSubscription->amount = $transaction->order_amount;
                $existingSubscription->save();
            } else {
                // Create new subscription
                Subscription::create([
                    'school_id' => $transaction->school_id,
                    'plan_id' => $transaction->subscription_plan_id,
                    'subscribed_by' => $transaction->administrator_id,
                    'billing_cycle' => $transaction->billing_cycle,
                    'start_date' => $transaction->subscription_start_date,
                    'end_date' => $transaction->subscription_end_date,
                    'status' => 'active',
                    'amount' => $transaction->order_amount,
                ]);
            }
        } catch (Exception $e) {
            Log::error("Failed to create/update subscription: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all transactions for a specific school or administrator.
     */
    public function getTransactions(?int $schoolId = null, ?int $administratorId = null): array
    {
        try {
            Log::info("=== SubscriptionPaymentService::getTransactions ===");
            Log::info("Parameters", [
                'schoolId' => $schoolId,
                'administratorId' => $administratorId
            ]);

            $query = SubscriptionTransaction::with(['school', 'subscriptionPlan', 'administrator'])
                ->orderBy('created_at', 'desc');

            if ($schoolId) {
                Log::info("Filtering by school_id: " . $schoolId);
                $query->where('school_id', $schoolId);
            }

            if ($administratorId) {
                Log::info("Filtering by administrator_id: " . $administratorId);
                $query->where('administrator_id', $administratorId);
            } else {
                Log::warning("NO ADMINISTRATOR_ID PROVIDED - FETCHING ALL TRANSACTIONS!");
            }

            // Log the SQL
            $sql = $query->toSql();
            $bindings = $query->getBindings();
            Log::info("SQL Query", ['sql' => $sql, 'bindings' => $bindings]);

            $transactions = $query->get();

            Log::info("Query executed - found " . $transactions->count() . " transactions");

            // Log first transaction if exists
            if ($transactions->count() > 0) {
                $first = $transactions->first();
                Log::info("First transaction", [
                    'id' => $first->id,
                    'school_id' => $first->school_id,
                    'administrator_id' => $first->administrator_id,
                    'status' => $first->status
                ]);
            }

            return [
                'status' => true,
                'message' => 'Transactions retrieved successfully',
                'data' => $transactions
            ];
        } catch (Exception $e) {
            Log::error("Failed to retrieve transactions: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());

            return [
                'status' => false,
                'message' => 'Failed to retrieve transactions: ' . $e->getMessage(),
                'data' => []
            ];
        }
    }

    /**
     * Get transaction by ID.
     */
    public function getTransactionById(int $id, ?int $administratorId = null): array
    {
        try {
            $query = SubscriptionTransaction::with(['school', 'subscriptionPlan', 'administrator']);

            if ($administratorId) {
                $query->where('administrator_id', $administratorId);
            }

            $transaction = $query->findOrFail($id);

            return [
                'status' => true,
                'message' => 'Transaction retrieved successfully',
                'data' => $transaction
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => 'Transaction not found',
                'data' => null
            ];
        }
    }

    /**
     * Get transaction statistics.
     */
    public function getTransactionStats(?int $administratorId = null): array
    {
        try {
            $query = SubscriptionTransaction::query();

            if ($administratorId) {
                $query->where('administrator_id', $administratorId);
            }

            $stats = [
                'total_transactions' => $query->count(),
                'successful_transactions' => (clone $query)->where('status', 'success')->count(),
                'pending_transactions' => (clone $query)->where('status', 'pending')->count(),
                'failed_transactions' => (clone $query)->where('status', 'failed')->count(),
                'total_revenue' => (clone $query)->where('status', 'success')->sum('order_amount'),
                'monthly_revenue' => (clone $query)
                    ->where('status', 'success')
                    ->whereMonth('payment_date', now()->month)
                    ->whereYear('payment_date', now()->year)
                    ->sum('order_amount'),
            ];

            return [
                'status' => true,
                'message' => 'Statistics retrieved successfully',
                'data' => $stats
            ];
        } catch (Exception $e) {
            Log::error("Failed to retrieve transaction stats: " . $e->getMessage());

            return [
                'status' => false,
                'message' => 'Failed to retrieve statistics',
                'data' => null
            ];
        }
    }
}
