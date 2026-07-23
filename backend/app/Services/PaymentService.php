<?php

namespace App\Services;

use App\Repositories\PaymentTransactionRepository;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\Log;
use Exception;

class PaymentService
{
    protected $transactionRepository;
    protected $razorpayKey;
    protected $razorpaySecret;

    public function __construct(PaymentTransactionRepository $transactionRepository)
    {
        $this->transactionRepository = $transactionRepository;
        $this->razorpayKey = config('services.razorpay.key');
        $this->razorpaySecret = config('services.razorpay.secret');
    }

    /**
     * Initiate payment with Razorpay
     */
    public function initiatePayment(array $data): array
    {
        try {
            // Create transaction record
            $transactionId = 'TXN_' . time() . '_' . uniqid();

            $transactionData = [
                'subscription_id' => $data['subscription_id'] ?? null,
                'school_id' => $data['school_id'],
                'user_id' => $data['user_id'],
                'transaction_id' => $transactionId,
                'payment_gateway' => 'razorpay',
                'amount' => $data['amount'],
                'currency' => $data['currency'],
                'status' => 'pending',
                'initiated_at' => now(),
            ];

            $transaction = $this->transactionRepository->createTransaction($transactionData);

            if (!$transaction) {
                return [
                    'status' => false,
                    'message' => 'Failed to create transaction record.',
                ];
            }

            // Create Razorpay order
            try {
                // Check if Razorpay SDK is available
                if (!class_exists('\Razorpay\Api\Api')) {
                    // Return mock data for testing if SDK not installed
                    Log::warning('Razorpay SDK not installed. Using mock payment data.');

                    return [
                        'status' => true,
                        'data' => [
                            'transaction_id' => $transactionId,
                            'razorpay_order_id' => 'order_' . uniqid(),
                            'amount' => $data['amount'],
                            'currency' => $data['currency'],
                            'key' => $this->razorpayKey,
                            'mock' => true,
                        ],
                    ];
                }

                $api = new \Razorpay\Api\Api($this->razorpayKey, $this->razorpaySecret);

                $orderData = [
                    'receipt' => $transactionId,
                    'amount' => $data['amount'] * 100, // Amount in paise
                    'currency' => $data['currency'],
                    'payment_capture' => 1,
                ];

                $razorpayOrder = $api->order->create($orderData);

                // Update transaction with Razorpay order ID
                $transaction->update([
                    'gateway_response' => json_encode($razorpayOrder->toArray()),
                ]);

                return [
                    'status' => true,
                    'data' => [
                        'transaction_id' => $transactionId,
                        'razorpay_order_id' => $razorpayOrder->id,
                        'amount' => $data['amount'],
                        'currency' => $data['currency'],
                        'key' => $this->razorpayKey,
                    ],
                ];

            } catch (Exception $e) {
                Log::error('Razorpay order creation failed: ' . $e->getMessage());

                // Update transaction status
                $transaction->update([
                    'status' => 'failed',
                    'failed_at' => now(),
                    'gateway_response' => json_encode(['error' => $e->getMessage()]),
                ]);

                return [
                    'status' => false,
                    'message' => 'Payment initiation failed.',
                    'error' => $e->getMessage(),
                ];
            }

        } catch (Exception $e) {
            Log::error('Payment initiation failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to initiate payment.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify payment callback from Razorpay
     */
    public function verifyPayment(array $data): array
    {
        try {
            // Check if this is a mock payment (for testing)
            if (isset($data['mock']) && $data['mock'] === true) {
                Log::info('Mock payment verification');

                $transaction = $this->transactionRepository->findByTransactionId($data['transaction_id']);

                if (!$transaction) {
                    return [
                        'status' => false,
                        'message' => 'Transaction not found.',
                    ];
                }

                // Update transaction as completed (mock)
                $transaction = $this->transactionRepository->updateStatus(
                    $data['transaction_id'],
                    'completed',
                    [
                        'gateway_response' => json_encode(['mock' => true, 'status' => 'success']),
                        'receipt_number' => 'RCP_MOCK_' . time(),
                    ]
                );

                return [
                    'status' => true,
                    'message' => 'Mock payment verified successfully.',
                    'data' => $transaction,
                ];
            }

            // Real Razorpay verification
            if (!class_exists('\Razorpay\Api\Api')) {
                return [
                    'status' => false,
                    'message' => 'Razorpay SDK not installed.',
                ];
            }

            $api = new \Razorpay\Api\Api($this->razorpayKey, $this->razorpaySecret);

            // Verify signature
            $attributes = [
                'razorpay_order_id' => $data['razorpay_order_id'],
                'razorpay_payment_id' => $data['razorpay_payment_id'],
                'razorpay_signature' => $data['razorpay_signature'],
            ];

            try {
                $api->utility->verifyPaymentSignature($attributes);
            } catch (Exception $e) {
                // Signature verification failed
                $this->transactionRepository->updateStatus(
                    $data['transaction_id'],
                    'failed',
                    ['gateway_response' => json_encode(['error' => 'Signature verification failed'])]
                );

                return [
                    'status' => false,
                    'message' => 'Payment verification failed.',
                    'error' => $e->getMessage(),
                ];
            }

            // Payment verified - update transaction
            $transaction = $this->transactionRepository->updateStatus(
                $data['transaction_id'],
                'completed',
                [
                    'gateway_response' => json_encode($data),
                    'receipt_number' => 'RCP_' . time(),
                    'payment_method' => $data['payment_method'] ?? 'card',
                ]
            );

            return [
                'status' => true,
                'message' => 'Payment verified successfully.',
                'data' => $transaction,
            ];

        } catch (Exception $e) {
            // Payment failed
            if (isset($data['transaction_id'])) {
                $this->transactionRepository->updateStatus(
                    $data['transaction_id'],
                    'failed',
                    ['gateway_response' => json_encode(['error' => $e->getMessage()])]
                );
            }

            Log::error('Payment verification failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Payment verification failed.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get payment transactions for a school
     */
    public function getSchoolTransactions(int $schoolId): array
    {
        try {
            $transactions = $this->transactionRepository->getTransactionsBySchool($schoolId);

            return [
                'status' => true,
                'data' => $transactions,
            ];

        } catch (Exception $e) {
            Log::error('Get transactions failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch transactions.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get all payment transactions (Administrator only)
     */
    public function getAllTransactions(): array
    {
        try {
            $transactions = $this->transactionRepository->getAllTransactions();

            // Calculate stats
            $stats = [
                'totalRevenue' => 0,
                'successfulPayments' => 0,
                'failedPayments' => 0,
                'pendingPayments' => 0,
            ];

            foreach ($transactions as $transaction) {
                if ($transaction['status'] === 'completed') {
                    $stats['totalRevenue'] += $transaction['amount'];
                    $stats['successfulPayments']++;
                } elseif ($transaction['status'] === 'failed') {
                    $stats['failedPayments']++;
                } elseif ($transaction['status'] === 'pending') {
                    $stats['pendingPayments']++;
                }
            }

            return [
                'status' => true,
                'data' => [
                    'transactions' => $transactions,
                    'stats' => $stats,
                ],
            ];

        } catch (Exception $e) {
            Log::error('Get all transactions failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch all transactions.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Process refund (for future use)
     */
    public function processRefund(string $transactionId, float $amount, string $reason): array
    {
        try {
            $transaction = $this->transactionRepository->findByTransactionId($transactionId);

            if (!$transaction) {
                return [
                    'status' => false,
                    'message' => 'Transaction not found.',
                ];
            }

            if ($transaction->status !== 'completed') {
                return [
                    'status' => false,
                    'message' => 'Only completed transactions can be refunded.',
                ];
            }

            // TODO: Implement Razorpay refund API
            // For now, just log the refund request
            Log::info("Refund requested: Transaction {$transactionId}, Amount: {$amount}, Reason: {$reason}");

            return [
                'status' => true,
                'message' => 'Refund request initiated. Please process manually.',
                'data' => [
                    'transaction_id' => $transactionId,
                    'refund_amount' => $amount,
                    'reason' => $reason,
                ],
            ];

        } catch (Exception $e) {
            Log::error('Refund processing failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to process refund.',
                'error' => $e->getMessage(),
            ];
        }
    }
}

