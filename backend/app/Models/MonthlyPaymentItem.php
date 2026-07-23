<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonthlyPaymentItem extends Model
{
    protected $fillable = [
        'monthly_payment_id',
        'service_id',
        'label',
        'amount',
    ];

    // 🔗 Relations
    public function monthlyPayment()
    {
        return $this->belongsTo(MonthlyPayment::class);
    }

    public function studentService()
    {
        return $this->belongsTo(StudentService::class);
    }
}
