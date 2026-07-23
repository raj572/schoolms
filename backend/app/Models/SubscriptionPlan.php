<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name', 'code', 'description', 'price', 'monthly_price', 'annual_price',
        'currency', 'duration_days', 'max_students', 'max_teachers', 'max_staff',
        'max_users', 'max_classes', 'max_trial_days', 'trial_days', 'features', 
        'is_active', 'is_popular', 'is_trial', 'sort_order'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'monthly_price' => 'decimal:2',
        'annual_price' => 'decimal:2',
        'duration_days' => 'integer',
        'max_trial_days' => 'integer',
        'trial_days' => 'integer',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'is_trial' => 'boolean',
    ];

    protected $appends = ['features_array'];

    public function getFeaturesAttribute($value)
    {
        // Return decoded array from JSON string
        return $value ? json_decode($value, true) : [];
    }

    public function getFeaturesArrayAttribute()
    {
        return $this->features;
    }

    /**
     * Accessor to ensure code is always present
     */
    public function getCodeAttribute($value)
    {
        // If code is not set, generate one from id
        if (empty($value)) {
            return 'PLAN_' . $this->id;
        }
        return $value;
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }

    public function hasFeature(string $feature): bool
    {
        return isset($this->features[$feature]) && $this->features[$feature] === true;
    }

    public function getAnnualSavings(): float
    {
        if (!$this->annual_price || !$this->monthly_price) return 0;
        return ($this->monthly_price * 12) - $this->annual_price;
    }
}

