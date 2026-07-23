<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'school_id', 'plan_id', 'subscribed_by', 'billing_cycle',
        'start_date', 'end_date', 'trial_end_date', 'amount', 'currency',
        'status', 'auto_renew', 'next_billing_date', 'canceled_at',
        'cancellation_reason'
    ];

    // Ensure plan_id and subscribed_by have no defaults - they must be provided
    protected $attributes = [
        'currency' => 'INR',
        'status' => 'trial',
        'auto_renew' => true
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'trial_end_date' => 'date',
        'next_billing_date' => 'date',
        'amount' => 'decimal:2',
        'auto_renew' => 'boolean',
        'canceled_at' => 'datetime',
    ];

    protected $appends = ['computed_next_billing_date'];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    public function subscribedBy()
    {
        return $this->belongsTo(User::class, 'subscribed_by');
    }

    public function transactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function history()
    {
        return $this->hasMany(SubscriptionHistory::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && $this->end_date->isFuture();
    }

    public function isInTrial(): bool
    {
        return $this->status === 'trial' &&
               $this->trial_end_date &&
               $this->trial_end_date->isFuture();
    }

    public function daysRemaining(): int
    {
        return max(0, now()->diffInDays($this->end_date, false));
    }

    public function canUpgrade(): bool
    {
        return $this->isActive();
    }

    public function canDowngrade(): bool
    {
        return $this->isActive() && $this->daysRemaining() > 7;
    }

    /**
     * Get the computed next billing date
     * This calculates the actual next billing date based on billing cycle
     */
    public function getComputedNextBillingDateAttribute(): ?string
    {
        // If auto_renew is false, return null
        if (!$this->auto_renew) {
            return null;
        }

        // Only calculate for active or trial subscriptions
        if (!in_array($this->status, ['active', 'trial'])) {
            return null;
        }

        // Return stored next_billing_date if it exists and is not the same as end_date
        if ($this->next_billing_date && $this->end_date &&
            $this->next_billing_date->format('Y-m-d') !== $this->end_date->format('Y-m-d')) {
            return $this->next_billing_date->format('Y-m-d');
        }

        // Calculate next billing date based on billing cycle
        try {
            $startDate = $this->start_date;
            $now = now();

            // Calculate how many billing cycles have passed
            if ($this->billing_cycle === 'monthly') {
                $monthsPassed = $startDate->diffInMonths($now);
                $nextBillingDate = $startDate->copy()->addMonths($monthsPassed + 1);
            } else if ($this->billing_cycle === 'annual') {
                $yearsPassed = $startDate->diffInYears($now);
                $nextBillingDate = $startDate->copy()->addYears($yearsPassed + 1);
            } else {
                // Default to monthly
                $nextBillingDate = $startDate->copy()->addMonth();
            }

            // Only return if the date is in the future
            if ($nextBillingDate->isFuture()) {
                return $nextBillingDate->format('Y-m-d');
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }
}

