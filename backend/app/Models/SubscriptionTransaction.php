<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'subscription_plan_id',
        'administrator_id',
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
        'plan_name',
        'billing_cycle',
        'duration_months',
        'subscription_start_date',
        'subscription_end_date',
        'remarks',
        'api_response',
    ];

    protected $casts = [
        'order_amount' => 'decimal:2',
        'order_created_at' => 'datetime',
        'payment_date' => 'datetime',
        'subscription_start_date' => 'datetime',
        'subscription_end_date' => 'datetime',
        'api_response' => 'array',
        'duration_months' => 'integer',
    ];

    /**
     * Get the school associated with this transaction.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the subscription plan associated with this transaction.
     */
    public function subscriptionPlan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }

    /**
     * Get the administrator who initiated this transaction.
     */
    public function administrator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'administrator_id');
    }

    /**
     * Check if transaction is successful.
     */
    public function isSuccessful(): bool
    {
        return $this->status === 'success';
    }

    /**
     * Check if transaction is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if transaction failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }
}

