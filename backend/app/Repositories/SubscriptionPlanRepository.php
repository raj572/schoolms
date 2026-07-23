<?php

namespace App\Repositories;

use App\Models\SubscriptionPlan;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class SubscriptionPlanRepository
{
    public function getAllActivePlans(): Collection
    {
        try {
            $plans = SubscriptionPlan::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('price')
                ->get();
            
            Log::info('Fetched active subscription plans', [
                'count' => $plans->count(),
                'plan_ids' => $plans->pluck('id')->toArray(),
            ]);
            
            return $plans;
        } catch (QueryException $e) {
            Log::error('Error fetching active plans: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return collect();
        }
    }

    public function getPaginatedPlans(int $perPage = 10, int $page = 1): array
    {
        try {
            $plans = SubscriptionPlan::orderBy('sort_order')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            return [
                'data' => $plans->items(),
                'current_page' => $plans->currentPage(),
                'per_page' => $plans->perPage(),
                'total' => $plans->total(),
                'last_page' => $plans->lastPage(),
                'from' => $plans->firstItem(),
                'to' => $plans->lastItem(),
            ];
        } catch (QueryException $e) {
            Log::error('Error fetching paginated plans: ' . $e->getMessage());
            return [
                'data' => [],
                'current_page' => 1,
                'per_page' => $perPage,
                'total' => 0,
                'last_page' => 1,
                'from' => null,
                'to' => null,
            ];
        }
    }

    public function findByCode(string $code): ?SubscriptionPlan
    {
        try {
            return SubscriptionPlan::where('code', $code)
                ->where('is_active', true)
                ->first();
        } catch (QueryException $e) {
            Log::error('Error finding plan by code: ' . $e->getMessage());
            return null;
        }
    }

    public function findById(int $id): ?SubscriptionPlan
    {
        try {
            return SubscriptionPlan::find($id);
        } catch (QueryException $e) {
            Log::error('Error finding plan by ID: ' . $e->getMessage());
            return null;
        }
    }

    public function create(array $data): ?SubscriptionPlan
    {
        try {
            return SubscriptionPlan::create($data);
        } catch (QueryException $e) {
            Log::error('Error creating plan: ' . $e->getMessage());
            return null;
        }
    }

    public function update(int $id, array $data): ?SubscriptionPlan
    {
        try {
            $plan = SubscriptionPlan::findOrFail($id);
            $plan->update($data);
            return $plan->fresh();
        } catch (QueryException $e) {
            Log::error('Error updating plan: ' . $e->getMessage());
            return null;
        }
    }
}

