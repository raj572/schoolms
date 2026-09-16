<?php

namespace App\Http\Controllers;

use App\Services\SubscriptionPaymentService;
use App\Helpers\JWTHelper;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Exception;

class SubscriptionPaymentController extends Controller
{
    protected SubscriptionPaymentService $subscriptionPaymentService;

    public function __construct(SubscriptionPaymentService $subscriptionPaymentService)
    {
        $this->subscriptionPaymentService = $subscriptionPaymentService;
    }

    /**
     * Get authenticated user from JWT token.
     */
    private function getAuthenticatedUser(Request $request): ?object
    {
        try {
            $authHeader = $request->header('Authorization');
            if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
                return null;
            }

            $token = substr($authHeader, 7);
            $result = JWTHelper::verifyToken($token);

            if (!$result['success']) {
                Log::warning("JWT verification failed: " . $result['message']);
                return null;
            }

            return $result['data'];
        } catch (Exception $e) {
            Log::error("Failed to verify JWT token: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create a new Razorpay order for subscription payment.
     * POST /api/administrator/subscription/payment/create-order
     */
    public function createPaymentOrder(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'school_id' => 'required|exists:schools,id',
                'subscription_plan_id' => 'required|exists:subscription_plans,id',
                'billing_cycle' => 'required|in:monthly,annual',
            ]);

            // Get authenticated administrator
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->user_id : null;

            // Add administrator_id to data
            $validated['administrator_id'] = $administratorId;

            // Verify school ownership
            if ($administratorId) {
                $school = \App\Models\School::find($validated['school_id']);
                if (!$school || $school->administrator_id != $administratorId) {
                    return response()->json([
                        'status' => false,
                        'message' => 'You can only purchase subscriptions for your own schools',
                        'data' => null
                    ], 403);
                }
            }

            $result = $this->subscriptionPaymentService->createSubscriptionOrder($validated);

            $code = $result['status'] ? 201 : 400;
            return response()->json($result, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'error_code' => 'VALIDATION_FAILED',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            Log::error("Order creation failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'error_code' => 'ORDER_CREATION_FAILED',
                'message' => 'Order creation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify Razorpay payment signature.
     * POST /api/administrator/payments/verifyPayment
     */
    public function verifyPayment(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'transaction_id' => 'required|exists:subscription_transactions,id',
                'razorpay_order_id' => 'required|string',
                'razorpay_payment_id' => 'required|string',
                'razorpay_signature' => 'required|string',
            ]);

            $result = $this->subscriptionPaymentService->verifyAndUpdatePayment($validated);

            $code = $result['status'] ? 200 : 400;
            return response()->json($result, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'error_code' => 'VALIDATION_FAILED',
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Payment verification failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'error_code' => 'VERIFICATION_PROCESS_ERROR',
                'message' => 'Payment verification failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Razorpay Webhook notification.
     * POST /api/payments/razorpay/webhook
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        try {
            $payload = $request->getContent();
            $signature = $request->header('X-Razorpay-Signature') ?? '';

            $result = $this->subscriptionPaymentService->handleWebhook($payload, $signature);

            $code = $result['status'] ? 200 : 400;
            return response()->json($result, $code);
        } catch (Exception $e) {
            Log::error("Webhook error: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'error_code' => 'WEBHOOK_FAILED',
                'message' => 'Webhook processing failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all transactions for authenticated administrator.
     * GET /api/administrator/subscription/payment/transactions
     */
    public function getAdministratorTransactions(Request $request): JsonResponse
    {
        try {
            // Get authenticated administrator
            $authUser = $this->getAuthenticatedUser($request);

            Log::info("=== getAdministratorTransactions DEBUG ===");
            Log::info("Auth User Object", ['authUser' => $authUser]);
            Log::info("Auth User role", ['role' => $authUser->role ?? 'NO ROLE']);
            Log::info("Auth User user_id", ['user_id' => $authUser->user_id ?? 'NO USER_ID']);

            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->user_id : null;

            Log::info("Extracted administrator_id", ['administrator_id' => $administratorId]);

            if (!$administratorId) {
                Log::warning("No administrator_id - returning unauthorized");
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - No administrator ID found',
                    'data' => []
                ], 401);
            }

            Log::info("Calling getTransactions with administrator_id: " . $administratorId);

            $result = $this->subscriptionPaymentService->getTransactions(null, $administratorId);

            Log::info("Service returned", [
                'status' => $result['status'],
                'count' => is_array($result['data']) ? count($result['data']) : (is_object($result['data']) ? $result['data']->count() : 'unknown')
            ]);

            return response()->json($result);
        } catch (Exception $e) {
            Log::error("Failed to retrieve transactions: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve transactions: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get transaction statistics for authenticated administrator.
     * GET /api/administrator/subscription/payment/stats
     */
    public function getAdministratorStats(Request $request): JsonResponse
    {
        try {
            // Get authenticated administrator
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->user_id : null;

            if (!$administratorId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                    'data' => null
                ], 401);
            }

            $result = $this->subscriptionPaymentService->getTransactionStats($administratorId);

            return response()->json($result);
        } catch (Exception $e) {
            Log::error("Failed to retrieve stats: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve statistics',
                'data' => null
            ], 500);
        }
    }

    /**
     * Get all transactions (Super Admin only).
     * GET /api/super-admin/subscription/payment/transactions
     */
    public function getAllTransactions(Request $request): JsonResponse
    {
        try {
            $result = $this->subscriptionPaymentService->getTransactions();

            return response()->json($result);
        } catch (Exception $e) {
            Log::error("Failed to retrieve transactions: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve transactions',
                'data' => []
            ], 500);
        }
    }

    /**
     * Get transaction statistics (Super Admin only).
     * GET /api/super-admin/subscription/payment/stats
     */
    public function getAllStats(Request $request): JsonResponse
    {
        try {
            $result = $this->subscriptionPaymentService->getTransactionStats();

            return response()->json($result);
        } catch (Exception $e) {
            Log::error("Failed to retrieve stats: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve statistics',
                'data' => null
            ], 500);
        }
    }

    /**
     * Get transaction by ID.
     * GET /api/administrator/subscription/payment/transactions/{id}
     */
    public function getTransaction(Request $request, $id): JsonResponse
    {
        try {
            // Get authenticated administrator
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->user_id : null;

            $result = $this->subscriptionPaymentService->getTransactionById($id, $administratorId);

            $code = $result['status'] ? 200 : 404;
            return response()->json($result, $code);
        } catch (Exception $e) {
            Log::error("Failed to retrieve transaction: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve transaction',
                'data' => null
            ], 500);
        }
    }
}
