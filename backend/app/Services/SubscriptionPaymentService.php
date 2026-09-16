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
        $logContext = [
            'stage' => 'PAYMENT_INITIATED',
            'user_id' => $data['administrator_id'] ?? null,
            'school_id' => $data['school_id'] ?? null,
            'subscription_plan_id' => $data['subscription_plan_id'] ?? null,
            'billing_cycle' => $data['billing_cycle'] ?? 'monthly',
        ];

        try {
            Log::info("[PAYMENT_INITIATED] Starting Razorpay subscription order creation", $logContext);

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

            $amountInPaise = (int)round($amount * 100);

            $key = config('services.razorpay.key');
            $secret = config('services.razorpay.secret');

            if (!$key || !$secret) {
                Log::error("[PAYMENT_FAILED] Razorpay API credentials missing in backend configuration", array_merge($logContext, [
                    'error_code' => 'INVALID_CREDENTIALS',
                    'error_description' => 'Razorpay API Key or Secret is not configured'
                ]));

                return [
                    'status' => false,
                    'error_code' => 'INVALID_CREDENTIALS',
                    'message' => 'Invalid Razorpay credentials. Please contact system administrator.',
                    'data' => null
                ];
            }

            // Initialize Razorpay API
            $api = new Api($key, $secret);
            $receipt = 'sub_rcpt_' . uniqid();

            // Create Razorpay order
            try {
                $razorpayOrder = $api->order->create([
                    'receipt' => $receipt,
                    'amount' => $amountInPaise,
                    'currency' => 'INR',
                    'payment_capture' => 1
                ]);
            } catch (Exception $rzpEx) {
                $errMsg = $rzpEx->getMessage();
                $errorCode = str_contains(strtolower($errMsg), 'auth') ? 'INVALID_CREDENTIALS' : 'ORDER_CREATION_FAILED';

                Log::error("[PAYMENT_FAILED] Razorpay order API call failed: {$errMsg}", array_merge($logContext, [
                    'error_code' => $errorCode,
                    'error_description' => $errMsg,
                    'amount' => $amount,
                    'currency' => 'INR'
                ]));

                return [
                    'status' => false,
                    'error_code' => $errorCode,
                    'message' => str_contains(strtolower($errMsg), 'auth')
                        ? 'Invalid Razorpay API credentials. Please check system key and secret.'
                        : 'Failed to create Razorpay order: ' . $errMsg,
                    'data' => null
                ];
            }

            Log::info("[RAZORPAY_ORDER_CREATED] Razorpay order created successfully", array_merge($logContext, [
                'razorpay_order_id' => $razorpayOrder['id'],
                'amount' => $amount,
                'currency' => $razorpayOrder['currency'],
                'receipt' => $receipt
            ]));

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
                'api_response' => json_encode([
                    'id' => $razorpayOrder['id'],
                    'entity' => $razorpayOrder['entity'],
                    'amount' => $razorpayOrder['amount'],
                    'currency' => $razorpayOrder['currency'],
                    'status' => $razorpayOrder['status'],
                ]),
            ];

            $transaction = SubscriptionTransaction::create($transactionData);

            Log::info("[PAYMENT_DATABASE_UPDATED] Transaction record created as pending", array_merge($logContext, [
                'transaction_id' => $transaction->id,
                'razorpay_order_id' => $transaction->razorpay_order_id,
                'status' => 'pending'
            ]));

            return [
                'status' => true,
                'message' => 'Order created successfully',
                'data' => $transaction
            ];
        } catch (Exception $e) {
            Log::error("[PAYMENT_FAILED] Order creation exception: " . $e->getMessage(), array_merge($logContext, [
                'error_code' => 'ORDER_CREATION_FAILED',
                'error_description' => $e->getMessage(),
            ]));

            return [
                'status' => false,
                'error_code' => 'ORDER_CREATION_FAILED',
                'message' => 'Failed to create payment order: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Verify Razorpay payment signature and update transaction.
     */
    public function verifyAndUpdatePayment(array $validated): array
    {
        $logContext = [
            'stage' => 'PAYMENT_VERIFICATION_STARTED',
            'transaction_id' => $validated['transaction_id'],
            'razorpay_order_id' => $validated['razorpay_order_id'],
            'razorpay_payment_id' => $validated['razorpay_payment_id'],
        ];

        try {
            Log::info("[PAYMENT_VERIFICATION_STARTED] Verifying payment signature", $logContext);

            // Find the transaction
            $transaction = SubscriptionTransaction::findOrFail($validated['transaction_id']);

            // Check for idempotency: if transaction is already marked success
            if ($transaction->status === 'success') {
                Log::info("[PAYMENT_VERIFIED] Transaction already verified previously (Idempotent)", $logContext);
                return [
                    'status' => true,
                    'message' => 'Payment already verified and active',
                    'data' => $transaction->load(['school', 'subscriptionPlan', 'administrator'])
                ];
            }

            // Razorpay Signature Verification
            try {
                $key = config('services.razorpay.key');
                $secret = config('services.razorpay.secret');

                $api = new Api($key, $secret);

                $api->utility->verifyPaymentSignature([
                    'razorpay_order_id' => $validated['razorpay_order_id'],
                    'razorpay_payment_id' => $validated['razorpay_payment_id'],
                    'razorpay_signature' => $validated['razorpay_signature'],
                ]);
            } catch (SignatureVerificationError $e) {
                $transaction->status = 'failed';
                $transaction->remarks = 'Signature verification failed: ' . $e->getMessage();
                $transaction->save();

                Log::error("[PAYMENT_FAILED] Signature verification failed", array_merge($logContext, [
                    'error_code' => 'SIGNATURE_VERIFICATION_FAILED',
                    'error_description' => $e->getMessage()
                ]));

                return [
                    'status' => false,
                    'error_code' => 'SIGNATURE_VERIFICATION_FAILED',
                    'message' => 'Payment signature verification failed. Transaction flagged.',
                    'data' => null
                ];
            }

            // Update the transaction
            $transaction->razorpay_payment_id = $validated['razorpay_payment_id'];
            $transaction->razorpay_signature = $validated['razorpay_signature'];
            $transaction->payment_date = now();
            $transaction->status = 'success';
            $transaction->remarks = 'Payment verified successfully';
            $transaction->save();

            Log::info("[PAYMENT_VERIFIED] Razorpay signature verified successfully", array_merge($logContext, [
                'user_id' => $transaction->administrator_id,
                'school_id' => $transaction->school_id,
                'amount' => $transaction->order_amount,
                'currency' => $transaction->order_currency,
                'status' => 'success'
            ]));

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

            Log::info("[PAYMENT_DATABASE_UPDATED] Subscription activated and school status updated", array_merge($logContext, [
                'school_id' => $transaction->school_id,
                'subscription_start' => $transaction->subscription_start_date,
                'subscription_end' => $transaction->subscription_end_date
            ]));

            return [
                'status' => true,
                'message' => 'Payment verified and subscription activated',
                'data' => $transaction->load(['school', 'subscriptionPlan', 'administrator'])
            ];
        } catch (Exception $e) {
            Log::error("[PAYMENT_FAILED] Verification process exception: " . $e->getMessage(), array_merge($logContext, [
                'error_code' => 'VERIFICATION_PROCESS_ERROR',
                'error_description' => $e->getMessage()
            ]));

            return [
                'status' => false,
                'error_code' => 'VERIFICATION_PROCESS_ERROR',
                'message' => 'Payment verification failed: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Handle Razorpay Webhook Event with signature verification and idempotency.
     */
    public function handleWebhook(string $payload, string $signature): array
    {
        $webhookSecret = config('services.razorpay.webhook_secret');

        Log::info("[WEBHOOK_RECEIVED] Webhook payload received from Razorpay");

        if (!empty($webhookSecret)) {
            try {
                $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));
                $api->utility->verifyWebhookSignature($payload, $signature, $webhookSecret);
                Log::info("[WEBHOOK_VERIFIED] Webhook signature verified successfully");
            } catch (Exception $e) {
                Log::error("[PAYMENT_FAILED] Webhook signature verification failed: " . $e->getMessage(), [
                    'error_code' => 'WEBHOOK_VERIFICATION_FAILED'
                ]);

                return [
                    'status' => false,
                    'error_code' => 'WEBHOOK_VERIFICATION_FAILED',
                    'message' => 'Invalid webhook signature'
                ];
            }
        }

        $event = json_decode($payload, true);
        $eventType = $event['event'] ?? 'unknown';

        Log::info("[WEBHOOK_RECEIVED] Processing Razorpay webhook event: {$eventType}");

        if ($eventType === 'payment.captured' || $eventType === 'order.paid') {
            $paymentEntity = $event['payload']['payment']['entity'] ?? [];
            $razorpayOrderId = $paymentEntity['order_id'] ?? null;
            $razorpayPaymentId = $paymentEntity['id'] ?? null;

            if ($razorpayOrderId) {
                $transaction = SubscriptionTransaction::where('razorpay_order_id', $razorpayOrderId)->first();

                if ($transaction && $transaction->status !== 'success') {
                    $transaction->razorpay_payment_id = $razorpayPaymentId;
                    $transaction->payment_date = now();
                    $transaction->status = 'success';
                    $transaction->remarks = 'Paid via Razorpay Webhook (' . $eventType . ')';
                    $transaction->save();

                    $this->createOrUpdateSubscription($transaction);

                    if ($transaction->administrator_id) {
                        $user = \App\Models\User::find($transaction->administrator_id);
                        if ($user) {
                            $user->update(['subscription_active' => true, 'registration_status' => 'active']);
                        }
                    }

                    $school = School::find($transaction->school_id);
                    if ($school) {
                        $school->subscription_status = 'active';
                        $school->subscription_start_date = $transaction->subscription_start_date;
                        $school->subscription_end_date = $transaction->subscription_end_date;
                        $school->save();
                    }

                    Log::info("[PAYMENT_DATABASE_UPDATED] Webhook updated transaction to success", [
                        'transaction_id' => $transaction->id,
                        'razorpay_order_id' => $razorpayOrderId,
                        'event' => $eventType
                    ]);
                }
            }
        } elseif ($eventType === 'payment.failed') {
            $paymentEntity = $event['payload']['payment']['entity'] ?? [];
            $razorpayOrderId = $paymentEntity['order_id'] ?? null;

            if ($razorpayOrderId) {
                $transaction = SubscriptionTransaction::where('razorpay_order_id', $razorpayOrderId)->first();
                if ($transaction && $transaction->status === 'pending') {
                    $transaction->status = 'failed';
                    $transaction->remarks = 'Failed via Razorpay Webhook: ' . ($paymentEntity['error_description'] ?? 'Payment failed');
                    $transaction->save();

                    Log::info("[PAYMENT_FAILED] Webhook marked transaction as failed", [
                        'transaction_id' => $transaction->id,
                        'razorpay_order_id' => $razorpayOrderId,
                        'error' => $paymentEntity['error_description'] ?? 'Payment failed'
                    ]);
                }
            }
        }

        return [
            'status' => true,
            'message' => 'Webhook processed successfully'
        ];
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
