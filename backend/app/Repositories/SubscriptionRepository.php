<?php

namespace App\Repositories;

use App\Models\Subscription;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;

class SubscriptionRepository
{
    public function createSubscription(array $data): ?Subscription
    {
        try {
            return Subscription::create($data);
        } catch (QueryException $e) {
            Log::error('Error creating subscription: ' . $e->getMessage());
            return null;
        }
    }

    public function getActiveSubscriptionBySchool(int $schoolId): ?Subscription
    {
        try {
            return Subscription::where('school_id', $schoolId)
                ->whereIn('status', ['active', 'trial'])
                ->where('end_date', '>=', now())
                ->with('plan')
                ->first();
        } catch (QueryException $e) {
            Log::error('Error getting active subscription: ' . $e->getMessage());
            return null;
        }
    }

    public function findById(int $id): ?Subscription
    {
        try {
            return Subscription::with(['plan', 'school'])->find($id);
        } catch (QueryException $e) {
            Log::error('Error finding subscription: ' . $e->getMessage());
            return null;
        }
    }

    public function updateStatus(int $subscriptionId, string $status): ?Subscription
    {
        try {
            $subscription = Subscription::findOrFail($subscriptionId);
            $subscription->update(['status' => $status]);
            return $subscription->fresh();
        } catch (QueryException $e) {
            Log::error('Error updating subscription status: ' . $e->getMessage());
            return null;
        }
    }

    public function update(int $id, array $data): ?Subscription
    {
        try {
            $subscription = Subscription::findOrFail($id);
            $subscription->update($data);
            return $subscription->fresh();
        } catch (QueryException $e) {
            Log::error('Error updating subscription: ' . $e->getMessage());
            return null;
        }
    }

    public function cancelSubscription(int $subscriptionId, string $reason = null): ?Subscription
    {
        try {
            $subscription = Subscription::findOrFail($subscriptionId);
            $subscription->update([
                'status' => 'canceled',
                'canceled_at' => now(),
                'cancellation_reason' => $reason,
                'auto_renew' => false,
            ]);
            return $subscription->fresh();
        } catch (QueryException $e) {
            Log::error('Error canceling subscription: ' . $e->getMessage());
            return null;
        }
    }

    public function getExpiringSubscriptions(int $days = 7)
    {
        try {
            return Subscription::where('status', 'active')
                ->where('end_date', '<=', now()->addDays($days))
                ->where('end_date', '>=', now())
                ->with(['school', 'plan'])
                ->get();
        } catch (QueryException $e) {
            Log::error('Error fetching expiring subscriptions: ' . $e->getMessage());
            return collect();
        }
    }
}

