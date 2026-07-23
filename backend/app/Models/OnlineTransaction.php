<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OnlineTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_details_id',
        'razorpay_order_id',
        'order_amount',
        'order_currency',
        'order_receipt',
        'order_status',
        'order_created_at',
        'razorpay_payment_id',
        'razorpay_signature',
        'payment_date',
        'status',
        'remarks',
        'api_response',
    ];

    protected $casts = [
        'order_created_at' => 'datetime',
        'payment_date' => 'datetime',
        'api_response' => 'array',
    ];

    public function student()
    {
        return $this->belongsTo(StudentDetails::class, 'student_details_id');
    }


    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
