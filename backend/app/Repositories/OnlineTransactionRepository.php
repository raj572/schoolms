<?php

namespace App\Repositories;

use App\Models\OnlineTransaction;

class OnlineTransactionRepository
{
    public function all()
    {
        return OnlineTransaction::with('student')->latest()->get();
    }

    public function findById($id)
    {
        return OnlineTransaction::with('student')->findOrFail($id);
    }

    public function findByOrderId(string $razorpayOrderId)
    {
        return OnlineTransaction::where('razorpay_order_id', $razorpayOrderId)->first();
    }

    public function create(array $data): OnlineTransaction
    {
        return OnlineTransaction::create($data);
    }

    public function update(OnlineTransaction $transaction, array $data): OnlineTransaction
    {
        $transaction->update($data);
        return $transaction;
    }

    public function delete(OnlineTransaction $transaction): bool
    {
        return $transaction->delete();
    }
}
