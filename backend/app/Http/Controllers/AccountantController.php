<?php

namespace App\Http\Controllers;

use App\Services\AccountantService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Exception;

class AccountantController extends Controller
{
    protected $accountantService;

    public function __construct(AccountantService $accountantService)
    {
        $this->accountantService = $accountantService;
    }

    /**
     * Get accountant ID from authenticated user
     */
    protected function getAccountantId(Request $request)
    {
        $authUser = $request->input('auth_user');
        if (!$authUser || $authUser['role'] !== 'accountant') {
            return null;
        }
        return $authUser['id'];
    }

    /**
     * Get accessible schools
     */
    public function getAccessibleSchools(Request $request)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $result = $this->accountantService->getAccessibleSchools($accountantId);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Get accessible schools failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch accessible schools.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats(Request $request)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $schoolId = $request->get('school_id');
            $result = $this->accountantService->getDashboardStats($accountantId, $schoolId);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Get dashboard stats failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch dashboard statistics.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ==================== FEE STRUCTURE MANAGEMENT ====================

    /**
     * Get all fee structures
     */
    public function getAllFeeStructures(Request $request)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $schoolId = $request->get('school_id');
            $result = $this->accountantService->getAllFeeStructures($accountantId, $schoolId);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Get fee structures failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch fee structures.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create fee structure
     */
    public function createFeeStructure(Request $request)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $validated = $request->validate([
                'school_id' => 'required|integer|exists:schools,id',
                'class' => 'required|string',
                'monthly_fee' => 'required|numeric|min:0',
                'other_fee' => 'required|numeric|min:0',
                'registration_fee' => 'required|numeric|min:0',
                'admission_fee' => 'required|numeric|min:0',
            ]);

            $result = $this->accountantService->createFeeStructure($accountantId, $validated);
            $code = $result['status'] ? 201 : 400;
            
            return response()->json($result, $code);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Create fee structure failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create fee structure.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update fee structure
     */
    public function updateFeeStructure(Request $request, $id)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $validated = $request->validate([
                'class' => 'sometimes|string',
                'monthly_fee' => 'sometimes|numeric|min:0',
                'other_fee' => 'sometimes|numeric|min:0',
                'registration_fee' => 'sometimes|numeric|min:0',
                'admission_fee' => 'sometimes|numeric|min:0',
            ]);

            $result = $this->accountantService->updateFeeStructure($accountantId, $id, $validated);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update fee structure failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update fee structure.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete fee structure
     */
    public function deleteFeeStructure(Request $request, $id)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $result = $this->accountantService->deleteFeeStructure($accountantId, $id);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Delete fee structure failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete fee structure.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ==================== MONTHLY PAYMENT MANAGEMENT ====================

    /**
     * Get all monthly payments
     */
    public function getAllMonthlyPayments(Request $request)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $filters = [
                'school_id' => $request->get('school_id'),
                'student_details_id' => $request->get('student_details_id'),
                'month' => $request->get('month'),
                'status' => $request->get('status'),
                'per_page' => $request->get('per_page', 15),
            ];

            $result = $this->accountantService->getAllMonthlyPayments($accountantId, $filters);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Get monthly payments failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch monthly payments.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create monthly payment
     */
    public function createMonthlyPayment(Request $request)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $validated = $request->validate([
                'school_id' => 'required|integer|exists:schools,id',
                'student_details_id' => 'required|integer|exists:student_details,id',
                'month' => 'required|string',
                'total_amount' => 'required|numeric|min:0',
                'status' => 'sometimes|in:due,paid,pending',
                'payment_date' => 'sometimes|date',
                'mode' => 'sometimes|in:cash,online,cheque',
                'remarks' => 'sometimes|string|max:255',
            ]);

            $result = $this->accountantService->createMonthlyPayment($accountantId, $validated);
            $code = $result['status'] ? 201 : 400;
            
            return response()->json($result, $code);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Create monthly payment failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create monthly payment.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update monthly payment
     */
    public function updateMonthlyPayment(Request $request, $id)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $validated = $request->validate([
                'status' => 'sometimes|in:due,paid,pending',
                'payment_date' => 'sometimes|date',
                'mode' => 'sometimes|in:cash,online,cheque',
                'remarks' => 'sometimes|string|max:255',
                'total_amount' => 'sometimes|numeric|min:0',
            ]);

            $result = $this->accountantService->updateMonthlyPayment($accountantId, $id, $validated);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update monthly payment failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update monthly payment.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate monthly dues
     */
    public function generateMonthlyDues(Request $request, $schoolId)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $result = $this->accountantService->generateMonthlyDues($accountantId, $schoolId);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Generate monthly dues failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to generate monthly dues.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ==================== ANNUAL PAYMENT MANAGEMENT ====================

    /**
     * Get all annual payments
     */
    public function getAllAnnualPayments(Request $request)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $filters = [
                'school_id' => $request->get('school_id'),
                'student_details_id' => $request->get('student_details_id'),
                'status' => $request->get('status'),
                'per_page' => $request->get('per_page', 15),
            ];

            $result = $this->accountantService->getAllAnnualPayments($accountantId, $filters);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Get annual payments failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch annual payments.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create annual payment
     */
    public function createAnnualPayment(Request $request)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $validated = $request->validate([
                'school_id' => 'required|integer|exists:schools,id',
                'student_details_id' => 'required|integer|exists:student_details,id',
                'admission_fee' => 'required|numeric|min:0',
                'registration_fee' => 'required|numeric|min:0',
                'other_fee' => 'sometimes|numeric|min:0',
                'status' => 'sometimes|in:due,paid',
                'payment_date' => 'sometimes|date',
                'mode' => 'sometimes|in:online,cash,card,upi',
                'remarks' => 'sometimes|string|max:255',
            ]);

            $result = $this->accountantService->createAnnualPayment($accountantId, $validated);
            $code = $result['status'] ? 201 : 400;
            
            return response()->json($result, $code);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Create annual payment failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create annual payment.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update annual payment
     */
    public function updateAnnualPayment(Request $request, $id)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $validated = $request->validate([
                'admission_fee' => 'sometimes|numeric|min:0',
                'registration_fee' => 'sometimes|numeric|min:0',
                'other_fee' => 'sometimes|numeric|min:0',
                'status' => 'sometimes|in:due,paid',
                'payment_date' => 'sometimes|date',
                'mode' => 'sometimes|in:online,cash,card,upi',
                'remarks' => 'sometimes|string|max:255',
            ]);

            $result = $this->accountantService->updateAnnualPayment($accountantId, $id, $validated);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update annual payment failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update annual payment.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete annual payment
     */
    public function deleteAnnualPayment(Request $request, $id)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $result = $this->accountantService->deleteAnnualPayment($accountantId, $id);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Delete annual payment failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete annual payment.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ==================== SERVICE CHARGE MANAGEMENT ====================

    /**
     * Get all service charges
     */
    public function getAllServiceCharges(Request $request)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $schoolId = $request->get('school_id');
            $result = $this->accountantService->getAllServiceCharges($accountantId, $schoolId);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Get service charges failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch service charges.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create service charge
     */
    public function createServiceCharge(Request $request)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $validated = $request->validate([
                'school_id' => 'required|integer|exists:schools,id',
                'service_type' => 'required|string',
                'service_name' => 'required|string|max:255',
                'charge' => 'required|numeric|min:0',
                'description' => 'sometimes|string',
                'stopage' => 'sometimes|string',
            ]);

            $result = $this->accountantService->createServiceCharge($accountantId, $validated);
            $code = $result['status'] ? 201 : 400;
            
            return response()->json($result, $code);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Create service charge failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create service charge.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update service charge
     */
    public function updateServiceCharge(Request $request, $id)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $validated = $request->validate([
                'service_type' => 'sometimes|string',
                'service_name' => 'sometimes|string|max:255',
                'charge' => 'sometimes|numeric|min:0',
                'description' => 'sometimes|string',
                'stopage' => 'sometimes|string',
            ]);

            $result = $this->accountantService->updateServiceCharge($accountantId, $id, $validated);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update service charge failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update service charge.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete service charge
     */
    public function deleteServiceCharge(Request $request, $id)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $result = $this->accountantService->deleteServiceCharge($accountantId, $id);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Delete service charge failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete service charge.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ==================== EXTRA SERVICE MANAGEMENT ====================

    /**
     * Get student extra services
     */
    public function getStudentExtraServices(Request $request, $schoolId)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $result = $this->accountantService->getStudentExtraServices($accountantId, $schoolId);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Get student extra services failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch student extra services.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign extra service to student
     */
    public function assignExtraService(Request $request)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $validated = $request->validate([
                'student_details_id' => 'required|integer|exists:student_details,id',
                'service_id' => 'required|integer|exists:student_services,id',
            ]);

            $result = $this->accountantService->assignExtraService($accountantId, $validated);
            $code = $result['status'] ? 201 : 400;
            
            return response()->json($result, $code);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Assign extra service failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to assign extra service.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove extra service from student
     */
    public function removeExtraService(Request $request, $id)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $result = $this->accountantService->removeExtraService($accountantId, $id);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Remove extra service failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to remove extra service.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ==================== REPORTS ====================

    /**
     * Get fee collection report
     */
    public function getFeeCollectionReport(Request $request)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $filters = [
                'school_id' => $request->get('school_id'),
                'start_date' => $request->get('start_date'),
                'end_date' => $request->get('end_date'),
            ];

            $result = $this->accountantService->getFeeCollectionReport($accountantId, $filters);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Get fee collection report failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch fee collection report.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get pending dues report
     */
    public function getPendingDuesReport(Request $request)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $filters = [
                'school_id' => $request->get('school_id'),
            ];

            $result = $this->accountantService->getPendingDuesReport($accountantId, $filters);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Get pending dues report failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch pending dues report.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get payment history
     */
    public function getPaymentHistory(Request $request)
    {
        try {
            $accountantId = $this->getAccountantId($request);
            
            if (!$accountantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Accountant access required.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $filters = [
                'school_id' => $request->get('school_id'),
                'start_date' => $request->get('start_date'),
                'end_date' => $request->get('end_date'),
                'status' => $request->get('status'),
            ];

            $result = $this->accountantService->getPaymentHistory($accountantId, $filters);
            $code = $result['status'] ? 200 : 400;
            
            return response()->json($result, $code);

        } catch (Exception $e) {
            Log::error("Get payment history failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch payment history.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

