<?php

namespace App\Repositories;

use App\Models\PaymentTransaction;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class PaymentTransactionRepository
{
    public function createTransaction(array $data): ?PaymentTransaction
    {
        try {
            return PaymentTransaction::create($data);
        } catch (QueryException $e) {
            Log::error('Error creating transaction: ' . $e->getMessage());
            return null;
        }
    }

    public function findByTransactionId(string $transactionId): ?PaymentTransaction
    {
        try {
            return PaymentTransaction::where('transaction_id', $transactionId)
                ->with('subscription')
                ->first();
        } catch (QueryException $e) {
            Log::error('Error finding transaction: ' . $e->getMessage());
            return null;
        }
    }

    public function updateStatus(string $transactionId, string $status, array $additionalData = []): ?PaymentTransaction
    {
        try {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)->firstOrFail();

            $updateData = array_merge(['status' => $status], $additionalData);

            if ($status === 'completed') {
                $updateData['completed_at'] = now();
            } elseif ($status === 'failed') {
                $updateData['failed_at'] = now();
            }

            $transaction->update($updateData);
            return $transaction->fresh();
        } catch (QueryException $e) {
            Log::error('Error updating transaction status: ' . $e->getMessage());
            return null;
        }
    }

    public function getTransactionsBySchool(int $schoolId): Collection
    {
        try {
            return PaymentTransaction::where('school_id', $schoolId)
                ->with('subscription.plan')
                ->orderBy('created_at', 'desc')
                ->get();
        } catch (QueryException $e) {
            Log::error('Error fetching school transactions: ' . $e->getMessage());
            return collect();
        }
    }

    public function getTransactionsBySubscription(int $subscriptionId): Collection
    {
        try {
            return PaymentTransaction::where('subscription_id', $subscriptionId)
                ->orderBy('created_at', 'desc')
                ->get();
        } catch (QueryException $e) {
            Log::error('Error fetching subscription transactions: ' . $e->getMessage());
            return collect();
        }
    }

    /**
     * Get all payment transactions with school and subscription details
     * For administrator panel
     */
    public function getAllTransactions(): Collection
    {
        try {
            return PaymentTransaction::with([
                'school:id,name,school_code',
                'subscription.plan:id,name,display_name',
                'user:id,full_name,email'
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'school_name' => $transaction->school->name ?? 'N/A',
                    'plan_name' => $transaction->subscription->plan->display_name ?? 'N/A',
                    'transaction_id' => $transaction->transaction_id,
                    'amount' => (int) ($transaction->amount * 100), // Convert to paise
                    'status' => $transaction->status,
                    'payment_method' => $transaction->payment_method ?? 'N/A',
                    'date' => $transaction->created_at->toISOString(),
                    'razorpay_order_id' => $this->extractRazorpayOrderId($transaction),
                    'razorpay_payment_id' => $this->extractRazorpayPaymentId($transaction),
                ];
            });
        } catch (QueryException $e) {
            Log::error('Error fetching all transactions: ' . $e->getMessage());
            return collect();
        }
    }

    /**
     * Extract Razorpay order ID from gateway response
     */
    private function extractRazorpayOrderId($transaction): ?string
    {
        if (!$transaction->gateway_response) {
            return null;
        }

        $response = is_array($transaction->gateway_response)
            ? $transaction->gateway_response
            : json_decode($transaction->gateway_response, true);

        return $response['razorpay_order_id'] ?? null;
    }

    /**
     * Extract Razorpay payment ID from gateway response
     */
    private function extractRazorpayPaymentId($transaction): ?string
    {
        if (!$transaction->gateway_response) {
            return null;
        }

        $response = is_array($transaction->gateway_response)
            ? $transaction->gateway_response
            : json_decode($transaction->gateway_response, true);

        return $response['razorpay_payment_id'] ?? null;
    }
}

