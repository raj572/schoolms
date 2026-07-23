<?php

namespace App\Repositories;

use App\Models\AnnualPayment;

class AnnualPaymentRepository
{
    public function getAll()
    {
        return AnnualPayment::all();
    }

    public function findById($id)
    {
        return AnnualPayment::findOrFail($id);
    }

    public function create(array $data)
    {
        return AnnualPayment::create($data);
    }

    public function update($id, array $data)
    {
        $payment = AnnualPayment::findOrFail($id);
        $payment->update($data);
        return $payment;
    }

    public function delete($id)
    {
        return AnnualPayment::destroy($id);
    }
}
