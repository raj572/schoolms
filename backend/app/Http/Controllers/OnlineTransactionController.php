<?php

namespace App\Http\Controllers;

use App\Services\OnlineTransactionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Exception;

class OnlineTransactionController extends Controller
{
    protected OnlineTransactionService $onlineTransactionService;

    public function __construct(OnlineTransactionService $onlineTransactionService)
    {
        $this->onlineTransactionService = $onlineTransactionService;
    }

    /**
     * Create a new Razorpay order and store transaction.
     */
    public function createPaymentOrder(Request $request, $school_id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'student_id'    => 'required|exists:students,id',
                'id'            => 'required|exists:monthly_payments,id',
                'order_amount'  => 'required|numeric|min:1',
            ]);

            $result = $this->onlineTransactionService->createOrder($validated, $school_id);

            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Order creation failed',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify payment and update related records.
     */
    public function verifyPayment(Request $request, $school_id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'student_id'        => 'required|exists:students,id',
                'transaction_id'    => 'required|exists:online_transactions,id',
                'monthly_payment_id' => 'required|exists:monthly_payments,id',
                'razorpay_order_id' => 'required|string',
                'razorpay_payment_id' => 'required|string',
                'razorpay_signature' => 'required|string',
            ]);

            $result = $this->onlineTransactionService->verifyAndUpdatePayment($validated, $school_id);

            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Payment verification failed',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all transactions.
     */
    public function index(): JsonResponse
    {
        $result = $this->onlineTransactionService->getAll();
        return response()->json($result, $result['status'] ? 200 : 400);
    }

    /**
     * Get a specific transaction.
     */
    public function show($id): JsonResponse
    {
        $result = $this->onlineTransactionService->getById($id);
        return response()->json($result, $result['status'] ? 200 : 404);
    }
}
