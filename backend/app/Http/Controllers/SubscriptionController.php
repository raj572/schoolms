<?php

namespace App\Http\Controllers;

use App\Services\SubscriptionService;
use App\Services\PaymentService;
use App\Models\User;
use App\Helpers\JWTHelper;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Exception;

class SubscriptionController extends Controller
{
    protected $subscriptionService;
    protected $paymentService;

    public function __construct(
        SubscriptionService $subscriptionService,
        PaymentService $paymentService
    ) {
        $this->subscriptionService = $subscriptionService;
        $this->paymentService = $paymentService;
    }

    /**
     * Helper to get authenticated user from JWT token
     */
    protected function getAuthenticatedUser(Request $request): ?User
    {
        try {
            $authHeader = $request->header('Authorization');

            if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
                return null;
            }

            $token = substr($authHeader, 7);
            $verification = JWTHelper::verifyToken($token);

            if (!$verification['success']) {
                return null;
            }

            // $verification['data'] is an object (stdClass), not an array
            $userId = $verification['data']->user_id ?? null;
            if (!$userId) {
                return null;
            }

            return User::find($userId);
        } catch (Exception $e) {
            Log::error('Get authenticated user failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get principal's school subscription status
     * GET /api/principal/subscription/status
     */
    public function getPrincipalSubscriptionStatus(Request $request)
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);

            // Allow principal and librarian roles
            if (!$authUser || ($authUser->role !== 'principal' && $authUser->role !== 'librarian')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Principal or Librarian access required.',
                    'data' => null,
                ], 403);
            }

            if (!$authUser->school_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'No school assigned to this principal.',
                    'data' => [
                        'hasSubscription' => false,
                        'status' => 'no_school',
                    ],
                ], 200);
            }

            $result = $this->subscriptionService->getCurrentSubscription($authUser->school_id);

            if (!$result['status']) {
                return response()->json([
                    'status' => true,
                    'message' => 'No active subscription found.',
                    'data' => [
                        'hasSubscription' => false,
                        'status' => 'no_subscription',
                    ],
                ], 200);
            }

            $subscription = $result['data'];
            $isActive = in_array($subscription->status, ['active', 'trial']);

            return response()->json([
                'status' => true,
                'message' => 'Subscription status retrieved successfully.',
                'data' => [
                    'hasSubscription' => $isActive,
                    'status' => $subscription->status,
                    'planName' => $subscription->plan->name ?? null,
                    'expiryDate' => $subscription->end_date ?? null,
                    'billingCycle' => $subscription->billing_cycle ?? null,
                ],
            ], 200);

        } catch (Exception $e) {
            Log::error('Get principal subscription status failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch subscription status.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all available subscription plans
     * GET /api/subscriptions/plans
     */
    public function getPlans()
    {
        try {
            $result = $this->subscriptionService->getAvailablePlans();
            
            Log::info('Fetching subscription plans', [
                'status' => $result['status'],
                'plan_count' => isset($result['data']['plans']) ? count($result['data']['plans']) : 0,
            ]);
            
            return response()->json($result, $result['status'] ? 200 : 500);

        } catch (Exception $e) {
            Log::error('Get plans failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch plans.',
                'error' => $e->getMessage(),
                'data' => [
                    'plans' => [],
                ],
            ], 500);
        }
    }

    /**
     * Check if school has active subscription
     * GET /api/subscriptions/check-active/{schoolId}
     */
    public function checkActiveSubscription($schoolId)
    {
        try {
            $subscription = Subscription::where('school_id', $schoolId)
                ->whereIn('status', ['active', 'trial'])
                ->with('plan')
                ->first();

            if ($subscription) {
                return response()->json([
                    'status' => true,
                    'has_active_subscription' => true,
                    'data' => [
                        'subscription' => $subscription,
                        'end_date' => $subscription->end_date,
                    ],
                ]);
            }

            return response()->json([
                'status' => true,
                'has_active_subscription' => false,
                'data' => null,
            ]);

        } catch (Exception $e) {
            Log::error('Check active subscription failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to check subscription.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Initiate a new subscription
     * POST /api/subscriptions/initiate
     */
    public function initiateSubscription(Request $request)
    {
        try {
            $validated = $request->validate([
                'plan_code' => 'required|string',
                'billing_cycle' => 'required|in:monthly,annual',
                'school_id' => 'required|exists:schools,id',
                'user_id' => 'required|exists:users,id',
                'trial_days' => 'sometimes|integer|min:0|max:30',
            ]);

            $result = $this->subscriptionService->initiateSubscription($validated);

            return response()->json($result, $result['status'] ? 201 : 400);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Subscription initiation failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to initiate subscription.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Payment callback/webhook from Razorpay
     * POST /api/subscriptions/payment-callback
     */
    public function paymentCallback(Request $request)
    {
        try {
            // For Razorpay webhook, validate the signature
            $data = $request->all();

            // Verify payment
            $result = $this->paymentService->verifyPayment($data);

            if ($result['status']) {
                // Activate subscription
                $activationResult = $this->subscriptionService->activateSubscription(
                    $data['transaction_id']
                );

                return response()->json($activationResult, $activationResult['status'] ? 200 : 400);
            }

            return response()->json($result, 400);

        } catch (Exception $e) {
            Log::error('Payment callback failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Payment processing failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current active subscription for a school
     * GET /api/subscriptions/current/{schoolId}
     */
    public function getCurrentSubscription($schoolId)
    {
        try {
            $result = $this->subscriptionService->getCurrentSubscription($schoolId);

            // Return 200 even if no subscription found (status: false)
            // This prevents console errors when school has no subscription yet
            return response()->json($result, 200);

        } catch (Exception $e) {
            Log::error('Get current subscription failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch subscription.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel subscription
     * PUT /api/subscriptions/{id}/cancel
     */
    public function cancelSubscription(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'reason' => 'nullable|string|max:500',
                'user_id' => 'sometimes|exists:users,id',
            ]);

            $result = $this->subscriptionService->cancelSubscription(
                $id,
                $validated['reason'] ?? null,
                $validated['user_id'] ?? null
            );

            return response()->json($result, $result['status'] ? 200 : 400);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Cancel subscription failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to cancel subscription.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get subscription history for a school
     * GET /api/subscriptions/history/{schoolId}
     */
    public function getHistory($schoolId)
    {
        try {
            $result = $this->subscriptionService->getSubscriptionHistory($schoolId);

            return response()->json($result, $result['status'] ? 200 : 404);

        } catch (Exception $e) {
            Log::error('Get history failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch history.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get payment transactions for a school
     * GET /api/payments/transactions/{schoolId}
     */
    public function getTransactions($schoolId)
    {
        try {
            $result = $this->paymentService->getSchoolTransactions($schoolId);

            return response()->json($result, $result['status'] ? 200 : 404);

        } catch (Exception $e) {
            Log::error('Get transactions failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch transactions.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all payment transactions (Administrator only)
     * GET /api/administrator/payments/all
     */
    public function getAllTransactions()
    {
        try {
            $result = $this->paymentService->getAllTransactions();

            return response()->json($result, $result['status'] ? 200 : 500);

        } catch (Exception $e) {
            Log::error('Get all transactions failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch all transactions.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check if a feature is accessible
     * GET /api/subscriptions/check-feature/{schoolId}/{feature}
     */
    public function checkFeature($schoolId, $feature)
    {
        try {
            $canAccess = $this->subscriptionService->canAccessFeature($schoolId, $feature);

            return response()->json([
                'status' => true,
                'data' => [
                    'feature' => $feature,
                    'can_access' => $canAccess,
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Check feature failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to check feature access.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check resource limit
     * GET /api/subscriptions/check-limit/{schoolId}/{resource}?current={count}
     */
    public function checkLimit(Request $request, $schoolId, $resource)
    {
        try {
            $currentCount = $request->query('current', 0);

            $result = $this->subscriptionService->checkResourceLimit(
                $schoolId,
                $resource,
                $currentCount
            );

            return response()->json([
                'status' => true,
                'data' => $result,
            ]);

        } catch (Exception $e) {
            Log::error('Check limit failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to check resource limit.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all subscriptions (Administrator only)
     * GET /api/administrator/subscriptions/all
     */
    public function getAllSubscriptions(Request $request)
    {
        try {
            $perPage = $request->query('per_page', 15);
            $status = $request->query('status');

            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);

            $query = \App\Models\Subscription::with(['school', 'plan', 'subscribedBy'])
                ->orderBy('created_at', 'desc');

            // Filter by administrator if user is an administrator
            if ($authUser && $authUser->role === 'administrator') {
                $query->whereHas('school', function ($q) use ($authUser) {
                    $q->where('administrator_id', $authUser->id);
                });
            }

            if ($status) {
                $query->where('status', $status);
            }

            $subscriptions = $query->paginate($perPage);

            return response()->json([
                'status' => true,
                'data' => $subscriptions,
            ]);

        } catch (Exception $e) {
            Log::error('Get all subscriptions failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch subscriptions.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Initiate payment for subscription (Administrator action)
     * POST /api/administrator/payments/initiate
     */
    public function initiatePayment(Request $request)
    {
        try {
            $validated = $request->validate([
                'subscription_id' => 'nullable|exists:subscriptions,id',
                'school_id' => 'required|exists:schools,id',
                'user_id' => 'required|exists:users,id',
                'amount' => 'required|numeric|min:0',
                'currency' => 'sometimes|string',
            ]);

            $validated['currency'] = $validated['currency'] ?? 'INR';

            $result = $this->paymentService->initiatePayment($validated);

            return response()->json($result, $result['status'] ? 200 : 400);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Payment initiation failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to initiate payment.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

