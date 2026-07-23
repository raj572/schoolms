<?php

namespace App\Services;

use App\Models\OnlineTransaction;
use App\Models\StudentDetails;
use App\Repositories\MonthlyPaymentRepository;
use App\Repositories\OnlineTransactionRepository;
use App\Repositories\StudentDetailsRepository;
use App\Repositories\StudentRepository;
use Illuminate\Support\Facades\Log;
use Razorpay\Api\Api;
use Exception;
use Razorpay\Api\Errors\SignatureVerificationError;

class OnlineTransactionService
{
    protected OnlineTransactionRepository $onlineTransactionRepository;
    protected StudentDetailsRepository $studentDetailsRepository;
    protected StudentRepository $studentRepository;
    protected MonthlyPaymentRepository $monthlyPaymentRepository;

    public function __construct(
        OnlineTransactionRepository $onlineTransactionRepository,
        StudentDetailsRepository $studentDetailsRepository,
        StudentRepository $studentRepository,
        MonthlyPaymentRepository $monthlyPaymentRepository
    ) {
        $this->onlineTransactionRepository = $onlineTransactionRepository;
        $this->studentDetailsRepository = $studentDetailsRepository;
        $this->studentRepository = $studentRepository;
        $this->monthlyPaymentRepository = $monthlyPaymentRepository;
    }

    /**
     * Create Razorpay order and store transaction.
     */
    public function createOrder(array $data, $school_id): array
    {
        try {
            Log::info("Starting Razorpay order creation", ['input' => $data]);

            $studentId = $data['student_id'];
            $studentDetails = StudentDetails::where('school_id', $school_id)
                ->where('student_id', $studentId)
                ->first();

            if (!$studentDetails) {
                return [
                    'status' => false,
                    'message' => "Student details not found for student_id: {$studentId}"
                ];
            }

            $studentDetailsId = $studentDetails->id;
            $amountInRupees = $data['order_amount'];
            $amountInPaise = $amountInRupees * 100;

            $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));
            $receipt = 'rcpt_' . uniqid();

            $razorpayOrder = $api->order->create([
                'receipt' => $receipt,
                'amount' => $amountInPaise,
                'currency' => 'INR',
                'payment_capture' => 1
            ]);

            Log::info("Razorpay order created", ['response' => $razorpayOrder]);

            $transactionData = [
                'school_id' => $school_id,
                'student_details_id' => $studentDetailsId,
                'razorpay_order_id' => $razorpayOrder['id'],
                'order_amount' => $amountInRupees,
                'order_currency' => $razorpayOrder['currency'],
                'order_receipt' => $razorpayOrder['receipt'],
                'order_status' => $razorpayOrder['status'],
                'order_created_at' => now()->setTimestamp($razorpayOrder['created_at']),
                'status' => 'pending',
                'api_response' => json_encode($razorpayOrder),
            ];

            $transaction = $this->onlineTransactionRepository->create($transactionData);

            return [
                'status' => true,
                'message' => 'Order created successfully',
                'data' => $transaction
            ];
        } catch (Exception $e) {
            Log::error("Failed to create Razorpay order: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'status' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verify Razorpay payment and update transaction + monthly payment.
     */
    public function verifyAndUpdatePayment(array $validated, $school_id): array
    {
        try {
            $studentDetails = StudentDetails::where('school_id', $school_id)
                ->where('student_id', $validated['student_id'])
                ->first();

            if (!$studentDetails) {
                return [
                    'status' => false,
                    'message' => "Student details not found for student_id: {$validated['student_id']}"
                ];
            }

            $studentDetailsId = $studentDetails->id;

            $transaction = OnlineTransaction::find($validated['transaction_id']);
            if (!$transaction) {
                return [
                    'status' => false,
                    'message' => "Transaction not found for ID: {$validated['transaction_id']}"
                ];
            }

            // ✅ Verify Razorpay Signature
            try {
                $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));
                $api->utility->verifyPaymentSignature([
                    'razorpay_order_id' => $validated['razorpay_order_id'],
                    'razorpay_payment_id' => $validated['razorpay_payment_id'],
                    'razorpay_signature' => $validated['razorpay_signature'],
                ]);
            } catch (SignatureVerificationError $e) {
                return [
                    'status' => false,
                    'message' => "Signature verification failed",
                    'error' => $e->getMessage()
                ];
            }

            // ✅ Update transaction
            $transaction->update([
                'student_details_id' => $studentDetailsId,
                'razorpay_order_id' => $validated['razorpay_order_id'],
                'razorpay_payment_id' => $validated['razorpay_payment_id'],
                'razorpay_signature' => $validated['razorpay_signature'],
                'payment_date' => now(),
                'status' => 'paid',
                'remarks' => 'Verified payment'
            ]);

            // ✅ Update related monthly payment
            $monthlyPayment = $this->monthlyPaymentRepository->findById($validated['monthly_payment_id']);
            if ($monthlyPayment) {
                $monthlyPayment->update([
                    'status' => 'paid',
                    'payment_date' => now(),
                    'mode' => 'online',
                    'remarks' => 'Paid via Razorpay (Txn ID: ' . $transaction->id . ')'
                ]);
            }

            return [
                'status' => true,
                'message' => 'Payment verified and updated successfully',
                'data' => $transaction
            ];
        } catch (Exception $e) {
            Log::error("Payment verification failed: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'status' => false,
                'message' => 'Payment verification failed',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get all transactions.
     */
    public function getAll(): array
    {
        try {
            return [
                'status' => true,
                'data' => $this->onlineTransactionRepository->all()
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => 'Failed to fetch transactions',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get transaction by ID.
     */
    public function getById($id): array
    {
        try {
            $transaction = $this->onlineTransactionRepository->findById($id);
            if (!$transaction) {
                return [
                    'status' => false,
                    'message' => "Transaction not found with ID: $id"
                ];
            }

            return [
                'status' => true,
                'data' => $transaction
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => 'Failed to fetch transaction',
                'error' => $e->getMessage()
            ];
        }
    }
}
