<?php

namespace App\Services;

use App\Models\User;
use App\Models\School;
use App\Models\FeeStructure;
use App\Models\MonthlyPayment;
use App\Models\AnnualPayment;
use App\Models\StudentService;
use App\Models\ExtraService;
use App\Models\StudentDetails;
use App\Repositories\FeeStructureRepository;
use App\Repositories\MonthlyPaymentRepository;
use App\Repositories\StudentServiceRepository;
use App\Repositories\ExtraServiceRepository;
use App\Repositories\StudentDetailsRepository;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Exception;

class AccountantService
{
    protected $feeStructureRepository;
    protected $monthlyPaymentRepository;
    protected $studentServiceRepository;
    protected $extraServiceRepository;
    protected $studentDetailsRepository;

    public function __construct(
        FeeStructureRepository $feeStructureRepository,
        MonthlyPaymentRepository $monthlyPaymentRepository,
        StudentServiceRepository $studentServiceRepository,
        ExtraServiceRepository $extraServiceRepository,
        StudentDetailsRepository $studentDetailsRepository
    ) {
        $this->feeStructureRepository = $feeStructureRepository;
        $this->monthlyPaymentRepository = $monthlyPaymentRepository;
        $this->studentServiceRepository = $studentServiceRepository;
        $this->extraServiceRepository = $extraServiceRepository;
        $this->studentDetailsRepository = $studentDetailsRepository;
    }

    /**
     * Get list of schools accountant can access
     * Multi-level access: administrator-level (all schools) or principal-level (single school)
     */
    public function getAccessibleSchools($accountantId): array
    {
        try {
            $accountant = User::find($accountantId);
            
            if (!$accountant || $accountant->role !== 'accountant') {
                return [
                    'status' => false,
                    'message' => 'Accountant not found.',
                    'data' => [],
                    'error' => null,
                ];
            }

            $schools = collect();

            // Administrator-level: Has administrator_id, can access all schools under that administrator
            if ($accountant->administrator_id) {
                $administrator = User::find($accountant->administrator_id);
                if ($administrator && $administrator->role === 'administrator') {
                    $schools = School::where('administrator_id', $administrator->id)
                        ->where('status', 'active')
                        ->get();
                }
            }
            // Principal-level: Has school_id, can access only that school
            elseif ($accountant->school_id) {
                $school = School::where('id', $accountant->school_id)
                    ->where('status', 'active')
                    ->first();
                if ($school) {
                    $schools = collect([$school]);
                }
            }

            return [
                'status' => true,
                'message' => 'Accessible schools fetched successfully.',
                'data' => $schools,
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error fetching accessible schools: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch accessible schools.',
                'data' => [],
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check if accountant can access a specific school
     */
    public function canAccessSchool($accountantId, $schoolId): bool
    {
        try {
            $accountant = User::find($accountantId);
            
            if (!$accountant || $accountant->role !== 'accountant') {
                return false;
            }

            // Administrator-level: Check if school belongs to administrator
            if ($accountant->administrator_id) {
                $administrator = User::find($accountant->administrator_id);
                if ($administrator && $administrator->role === 'administrator') {
                    return School::where('id', $schoolId)
                        ->where('administrator_id', $administrator->id)
                        ->exists();
                }
            }
            // Principal-level: Check if school matches accountant's school_id
            elseif ($accountant->school_id) {
                return $accountant->school_id == $schoolId;
            }

            return false;

        } catch (Exception $e) {
            Log::error("Error checking school access: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get accessible school IDs for query filtering
     */
    public function getAccessibleSchoolIds($accountantId): array
    {
        $result = $this->getAccessibleSchools($accountantId);
        if ($result['status'] && $result['data']) {
            return $result['data']->pluck('id')->toArray();
        }
        return [];
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats($accountantId, $schoolId = null): array
    {
        try {
            $accessibleSchoolIds = $this->getAccessibleSchoolIds($accountantId);
            
            if (empty($accessibleSchoolIds)) {
                return [
                    'status' => false,
                    'message' => 'No accessible schools found.',
                    'data' => null,
                    'error' => null,
                ];
            }

            // Filter by school if provided
            if ($schoolId && $this->canAccessSchool($accountantId, $schoolId)) {
                $accessibleSchoolIds = [$schoolId];
            } elseif ($schoolId && !$this->canAccessSchool($accountantId, $schoolId)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            // Total Revenue (all paid monthly and annual payments)
            $totalRevenue = MonthlyPayment::whereIn('school_id', $accessibleSchoolIds)
                ->where('status', 'paid')
                ->sum('total_amount');
            
            $totalRevenue += AnnualPayment::whereIn('school_id', $accessibleSchoolIds)
                ->where('status', 'paid')
                ->sum('total_amount');

            // Pending Dues
            $pendingDues = MonthlyPayment::whereIn('school_id', $accessibleSchoolIds)
                ->where('status', 'due')
                ->sum('total_amount');
            
            $pendingDues += AnnualPayment::whereIn('school_id', $accessibleSchoolIds)
                ->where('status', 'due')
                ->sum('total_amount');

            // This Month Revenue
            $thisMonthRevenue = MonthlyPayment::whereIn('school_id', $accessibleSchoolIds)
                ->where('status', 'paid')
                ->whereYear('payment_date', now()->year)
                ->whereMonth('payment_date', now()->month)
                ->sum('total_amount');

            // Total Students with Fees
            $totalStudentsWithFees = MonthlyPayment::whereIn('school_id', $accessibleSchoolIds)
                ->distinct('student_details_id')
                ->count('student_details_id');

            // Recent Transactions (last 10)
            $recentTransactions = MonthlyPayment::whereIn('school_id', $accessibleSchoolIds)
                ->with(['student:id,candidate_name,class', 'school:id,name'])
                ->where('status', 'paid')
                ->orderBy('payment_date', 'desc')
                ->limit(10)
                ->get();

            return [
                'status' => true,
                'message' => 'Dashboard statistics fetched successfully.',
                'data' => [
                    'total_revenue' => $totalRevenue,
                    'pending_dues' => $pendingDues,
                    'this_month_revenue' => $thisMonthRevenue,
                    'total_students_with_fees' => $totalStudentsWithFees,
                    'recent_transactions' => $recentTransactions,
                ],
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error fetching dashboard stats: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch dashboard statistics.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    // ==================== FEE STRUCTURE MANAGEMENT ====================

    /**
     * Get all fee structures for accessible schools
     */
    public function getAllFeeStructures($accountantId, $schoolId = null): array
    {
        try {
            $accessibleSchoolIds = $this->getAccessibleSchoolIds($accountantId);
            
            if (empty($accessibleSchoolIds)) {
                return [
                    'status' => false,
                    'message' => 'No accessible schools found.',
                    'data' => [],
                    'error' => null,
                ];
            }

            if ($schoolId && !$this->canAccessSchool($accountantId, $schoolId)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => [],
                    'error' => null,
                ];
            }

            $query = FeeStructure::with(['school:id,name'])
                ->whereIn('school_id', $schoolId ? [$schoolId] : $accessibleSchoolIds);

            $feeStructures = $query->orderBy('school_id')->orderBy('class')->get();

            return [
                'status' => true,
                'message' => 'Fee structures fetched successfully.',
                'data' => $feeStructures,
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error fetching fee structures: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch fee structures.',
                'data' => [],
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create fee structure
     */
    public function createFeeStructure($accountantId, array $data): array
    {
        try {
            if (!$this->canAccessSchool($accountantId, $data['school_id'])) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            // Use existing UserService method
            $userService = app(UserService::class);
            return $userService->createFeeStructure($data);

        } catch (Exception $e) {
            Log::error("Error creating fee structure: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to create fee structure.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update fee structure
     */
    public function updateFeeStructure($accountantId, $feeStructureId, array $data): array
    {
        try {
            $feeStructure = FeeStructure::find($feeStructureId);
            
            if (!$feeStructure) {
                return [
                    'status' => false,
                    'message' => 'Fee structure not found.',
                    'data' => null,
                    'error' => null,
                ];
            }

            if (!$this->canAccessSchool($accountantId, $feeStructure->school_id)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            // Use existing UserService method
            $userService = app(UserService::class);
            return $userService->updateFeeStructure($feeStructureId, $data, $feeStructure->school_id);

        } catch (Exception $e) {
            Log::error("Error updating fee structure: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update fee structure.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete fee structure
     */
    public function deleteFeeStructure($accountantId, $feeStructureId): array
    {
        try {
            $feeStructure = FeeStructure::find($feeStructureId);
            
            if (!$feeStructure) {
                return [
                    'status' => false,
                    'message' => 'Fee structure not found.',
                    'data' => null,
                    'error' => null,
                ];
            }

            if (!$this->canAccessSchool($accountantId, $feeStructure->school_id)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            // Use existing UserService method
            $userService = app(UserService::class);
            return $userService->deleteFeeStructure($feeStructureId);

        } catch (Exception $e) {
            Log::error("Error deleting fee structure: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to delete fee structure.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    // ==================== MONTHLY PAYMENT MANAGEMENT ====================

    /**
     * Get all monthly payments with filtering
     */
    public function getAllMonthlyPayments($accountantId, array $filters = []): array
    {
        try {
            $accessibleSchoolIds = $this->getAccessibleSchoolIds($accountantId);
            
            if (empty($accessibleSchoolIds)) {
                return [
                    'status' => false,
                    'message' => 'No accessible schools found.',
                    'data' => [],
                    'error' => null,
                ];
            }

            $schoolId = $filters['school_id'] ?? null;
            $studentId = $filters['student_details_id'] ?? null;
            $month = $filters['month'] ?? null;
            $status = $filters['status'] ?? null;

            // Validate school access
            if ($schoolId && !$this->canAccessSchool($accountantId, $schoolId)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => [],
                    'error' => null,
                ];
            }

            $query = MonthlyPayment::with([
                'student:id,candidate_name,class,section,roll_no',
                'school:id,name'
            ])
                ->whereIn('school_id', $schoolId ? [$schoolId] : $accessibleSchoolIds);

            if ($studentId) {
                $query->where('student_details_id', $studentId);
            }

            if ($month) {
                $query->where('month', $month);
            }

            if ($status) {
                $query->where('status', $status);
            }

            $payments = $query->orderBy('created_at', 'desc')
                ->paginate($filters['per_page'] ?? 15);

            return [
                'status' => true,
                'message' => 'Monthly payments fetched successfully.',
                'data' => $payments,
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error fetching monthly payments: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch monthly payments.',
                'data' => [],
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create monthly payment
     */
    public function createMonthlyPayment($accountantId, array $data): array
    {
        try {
            if (!$this->canAccessSchool($accountantId, $data['school_id'])) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            // Validate student belongs to school
            $student = StudentDetails::where('id', $data['student_details_id'])
                ->where('school_id', $data['school_id'])
                ->first();

            if (!$student) {
                return [
                    'status' => false,
                    'message' => 'Student not found in the specified school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            $payment = MonthlyPayment::create([
                'school_id' => $data['school_id'],
                'student_details_id' => $data['student_details_id'],
                'month' => $data['month'],
                'total_amount' => $data['total_amount'] ?? 0,
                'status' => $data['status'] ?? 'due',
                'payment_date' => $data['payment_date'] ?? null,
                'mode' => $data['mode'] ?? null,
                'remarks' => $data['remarks'] ?? null,
            ]);

            return [
                'status' => true,
                'message' => 'Monthly payment created successfully.',
                'data' => $payment,
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error creating monthly payment: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to create monthly payment.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update monthly payment
     */
    public function updateMonthlyPayment($accountantId, $paymentId, array $data): array
    {
        try {
            $payment = MonthlyPayment::find($paymentId);
            
            if (!$payment) {
                return [
                    'status' => false,
                    'message' => 'Monthly payment not found.',
                    'data' => null,
                    'error' => null,
                ];
            }

            if (!$this->canAccessSchool($accountantId, $payment->school_id)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            // Use existing UserService method
            $userService = app(UserService::class);
            return $userService->updateMonthlyPaymentManually(
                $payment->student_details_id,
                array_merge($data, ['id' => $paymentId]),
                $payment->school_id
            );

        } catch (Exception $e) {
            Log::error("Error updating monthly payment: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update monthly payment.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate monthly dues
     */
    public function generateMonthlyDues($accountantId, $schoolId): array
    {
        try {
            if (!$this->canAccessSchool($accountantId, $schoolId)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            // Note: The generate:monthly-dues command generates for all students
            // We'll run it and it will generate for all accessible schools
            // Filtering by school should be handled in the command or via filtering students
            $exitCode = \Artisan::call('generate:monthly-dues');

            return [
                'status' => $exitCode === 0,
                'message' => $exitCode === 0 
                    ? 'Monthly dues generated successfully.' 
                    : 'Failed to generate monthly dues.',
                'data' => null,
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error generating monthly dues: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to generate monthly dues.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    // ==================== ANNUAL PAYMENT MANAGEMENT ====================

    /**
     * Get all annual payments
     */
    public function getAllAnnualPayments($accountantId, array $filters = []): array
    {
        try {
            $accessibleSchoolIds = $this->getAccessibleSchoolIds($accountantId);
            
            if (empty($accessibleSchoolIds)) {
                return [
                    'status' => false,
                    'message' => 'No accessible schools found.',
                    'data' => [],
                    'error' => null,
                ];
            }

            $schoolId = $filters['school_id'] ?? null;
            $studentId = $filters['student_details_id'] ?? null;
            $status = $filters['status'] ?? null;

            if ($schoolId && !$this->canAccessSchool($accountantId, $schoolId)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => [],
                    'error' => null,
                ];
            }

            $query = AnnualPayment::with([
                'studentDetail:id,candidate_name,class',
                'school:id,name'
            ])
                ->whereIn('school_id', $schoolId ? [$schoolId] : $accessibleSchoolIds);

            if ($studentId) {
                $query->where('student_details_id', $studentId);
            }

            if ($status) {
                $query->where('status', $status);
            }

            $payments = $query->orderBy('created_at', 'desc')
                ->paginate($filters['per_page'] ?? 15);

            return [
                'status' => true,
                'message' => 'Annual payments fetched successfully.',
                'data' => $payments,
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error fetching annual payments: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch annual payments.',
                'data' => [],
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create annual payment
     */
    public function createAnnualPayment($accountantId, array $data): array
    {
        try {
            if (!$this->canAccessSchool($accountantId, $data['school_id'])) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            // Validate student belongs to school
            $student = StudentDetails::where('id', $data['student_details_id'])
                ->where('school_id', $data['school_id'])
                ->first();

            if (!$student) {
                return [
                    'status' => false,
                    'message' => 'Student not found in the specified school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            $totalAmount = ($data['admission_fee'] ?? 0) + 
                          ($data['registration_fee'] ?? 0) + 
                          ($data['other_fee'] ?? 0);

            $payment = AnnualPayment::create([
                'school_id' => $data['school_id'],
                'student_details_id' => $data['student_details_id'],
                'admission_fee' => $data['admission_fee'] ?? 0,
                'registration_fee' => $data['registration_fee'] ?? 0,
                'other_fee' => $data['other_fee'] ?? 0,
                'total_amount' => $totalAmount,
                'status' => $data['status'] ?? 'due',
                'payment_date' => $data['payment_date'] ?? null,
                'mode' => $data['mode'] ?? null,
                'remarks' => $data['remarks'] ?? null,
            ]);

            return [
                'status' => true,
                'message' => 'Annual payment created successfully.',
                'data' => $payment,
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error creating annual payment: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to create annual payment.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update annual payment
     */
    public function updateAnnualPayment($accountantId, $paymentId, array $data): array
    {
        try {
            $payment = AnnualPayment::find($paymentId);
            
            if (!$payment) {
                return [
                    'status' => false,
                    'message' => 'Annual payment not found.',
                    'data' => null,
                    'error' => null,
                ];
            }

            if (!$this->canAccessSchool($accountantId, $payment->school_id)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            $totalAmount = ($data['admission_fee'] ?? $payment->admission_fee) + 
                          ($data['registration_fee'] ?? $payment->registration_fee) + 
                          ($data['other_fee'] ?? $payment->other_fee);

            $payment->update([
                'admission_fee' => $data['admission_fee'] ?? $payment->admission_fee,
                'registration_fee' => $data['registration_fee'] ?? $payment->registration_fee,
                'other_fee' => $data['other_fee'] ?? $payment->other_fee,
                'total_amount' => $totalAmount,
                'status' => $data['status'] ?? $payment->status,
                'payment_date' => $data['payment_date'] ?? $payment->payment_date,
                'mode' => $data['mode'] ?? $payment->mode,
                'remarks' => $data['remarks'] ?? $payment->remarks,
            ]);

            return [
                'status' => true,
                'message' => 'Annual payment updated successfully.',
                'data' => $payment->fresh(),
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error updating annual payment: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update annual payment.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete annual payment
     */
    public function deleteAnnualPayment($accountantId, $paymentId): array
    {
        try {
            $payment = AnnualPayment::find($paymentId);
            
            if (!$payment) {
                return [
                    'status' => false,
                    'message' => 'Annual payment not found.',
                    'data' => null,
                    'error' => null,
                ];
            }

            if (!$this->canAccessSchool($accountantId, $payment->school_id)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            $payment->delete();

            return [
                'status' => true,
                'message' => 'Annual payment deleted successfully.',
                'data' => null,
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error deleting annual payment: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to delete annual payment.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    // ==================== SERVICE CHARGE MANAGEMENT ====================

    /**
     * Get all service charges
     */
    public function getAllServiceCharges($accountantId, $schoolId = null): array
    {
        try {
            $accessibleSchoolIds = $this->getAccessibleSchoolIds($accountantId);
            
            if (empty($accessibleSchoolIds)) {
                return [
                    'status' => false,
                    'message' => 'No accessible schools found.',
                    'data' => [],
                    'error' => null,
                ];
            }

            if ($schoolId && !$this->canAccessSchool($accountantId, $schoolId)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => [],
                    'error' => null,
                ];
            }

            $query = StudentService::with(['school:id,name'])
                ->whereIn('school_id', $schoolId ? [$schoolId] : $accessibleSchoolIds);

            $services = $query->orderBy('school_id')->orderBy('service_name')->get();

            return [
                'status' => true,
                'message' => 'Service charges fetched successfully.',
                'data' => $services,
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error fetching service charges: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch service charges.',
                'data' => [],
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create service charge
     */
    public function createServiceCharge($accountantId, array $data): array
    {
        try {
            if (!$this->canAccessSchool($accountantId, $data['school_id'])) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            // Use existing UserService method
            $userService = app(UserService::class);
            return $userService->createServiceCharge($data, $data['school_id']);

        } catch (Exception $e) {
            Log::error("Error creating service charge: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to create service charge.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update service charge
     */
    public function updateServiceCharge($accountantId, $serviceId, array $data): array
    {
        try {
            $service = StudentService::find($serviceId);
            
            if (!$service) {
                return [
                    'status' => false,
                    'message' => 'Service charge not found.',
                    'data' => null,
                    'error' => null,
                ];
            }

            if (!$this->canAccessSchool($accountantId, $service->school_id)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            // Use existing UserService method
            $userService = app(UserService::class);
            return $userService->updateServiceCharges($serviceId, $data);

        } catch (Exception $e) {
            Log::error("Error updating service charge: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update service charge.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete service charge
     */
    public function deleteServiceCharge($accountantId, $serviceId): array
    {
        try {
            $service = StudentService::find($serviceId);
            
            if (!$service) {
                return [
                    'status' => false,
                    'message' => 'Service charge not found.',
                    'data' => null,
                    'error' => null,
                ];
            }

            if (!$this->canAccessSchool($accountantId, $service->school_id)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            // Use existing UserService method
            $userService = app(UserService::class);
            return $userService->deleteServiceCharges($serviceId);

        } catch (Exception $e) {
            Log::error("Error deleting service charge: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to delete service charge.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    // ==================== EXTRA SERVICE MANAGEMENT ====================

    /**
     * Get student extra services
     */
    public function getStudentExtraServices($accountantId, $schoolId): array
    {
        try {
            if (!$this->canAccessSchool($accountantId, $schoolId)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => [],
                    'error' => null,
                ];
            }

            // Use existing UserService method
            $userService = app(UserService::class);
            return $userService->getStudentDetailsServices($schoolId);

        } catch (Exception $e) {
            Log::error("Error fetching student extra services: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch student extra services.',
                'data' => [],
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Assign extra service to student
     */
    public function assignExtraService($accountantId, array $data): array
    {
        try {
            $student = StudentDetails::find($data['student_details_id']);
            
            if (!$student) {
                return [
                    'status' => false,
                    'message' => 'Student not found.',
                    'data' => null,
                    'error' => null,
                ];
            }

            if (!$this->canAccessSchool($accountantId, $student->school_id)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            // Check if service exists and belongs to same school
            $service = StudentService::where('id', $data['service_id'])
                ->where('school_id', $student->school_id)
                ->first();

            if (!$service) {
                return [
                    'status' => false,
                    'message' => 'Service not found in the student\'s school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            // Check if already assigned
            $existing = ExtraService::where('student_details_id', $data['student_details_id'])
                ->where('service_id', $data['service_id'])
                ->first();

            if ($existing) {
                return [
                    'status' => false,
                    'message' => 'Service already assigned to this student.',
                    'data' => null,
                    'error' => null,
                ];
            }

            $extraService = ExtraService::create([
                'student_details_id' => $data['student_details_id'],
                'service_id' => $data['service_id'],
            ]);

            return [
                'status' => true,
                'message' => 'Extra service assigned successfully.',
                'data' => $extraService,
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error assigning extra service: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to assign extra service.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Remove extra service from student
     */
    public function removeExtraService($accountantId, $extraServiceId): array
    {
        try {
            $extraService = ExtraService::with('student')->find($extraServiceId);
            
            if (!$extraService) {
                return [
                    'status' => false,
                    'message' => 'Extra service assignment not found.',
                    'data' => null,
                    'error' => null,
                ];
            }

            $student = StudentDetails::find($extraService->student_details_id);
            
            if (!$student || !$this->canAccessSchool($accountantId, $student->school_id)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            $extraService->delete();

            return [
                'status' => true,
                'message' => 'Extra service removed successfully.',
                'data' => null,
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error removing extra service: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to remove extra service.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    // ==================== REPORTS ====================

    /**
     * Get fee collection report
     */
    public function getFeeCollectionReport($accountantId, array $filters = []): array
    {
        try {
            $accessibleSchoolIds = $this->getAccessibleSchoolIds($accountantId);
            
            if (empty($accessibleSchoolIds)) {
                return [
                    'status' => false,
                    'message' => 'No accessible schools found.',
                    'data' => null,
                    'error' => null,
                ];
            }

            $schoolId = $filters['school_id'] ?? null;
            $startDate = $filters['start_date'] ?? null;
            $endDate = $filters['end_date'] ?? null;

            if ($schoolId && !$this->canAccessSchool($accountantId, $schoolId)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => null,
                    'error' => null,
                ];
            }

            $query = MonthlyPayment::whereIn('school_id', $schoolId ? [$schoolId] : $accessibleSchoolIds)
                ->where('status', 'paid');

            if ($startDate) {
                $query->whereDate('payment_date', '>=', $startDate);
            }

            if ($endDate) {
                $query->whereDate('payment_date', '<=', $endDate);
            }

            $totalCollection = $query->sum('total_amount');
            $transactionCount = $query->count();

            // Group by school
            $collectionBySchool = MonthlyPayment::whereIn('school_id', $schoolId ? [$schoolId] : $accessibleSchoolIds)
                ->where('status', 'paid')
                ->when($startDate, fn($q) => $q->whereDate('payment_date', '>=', $startDate))
                ->when($endDate, fn($q) => $q->whereDate('payment_date', '<=', $endDate))
                ->selectRaw('school_id, SUM(total_amount) as total')
                ->groupBy('school_id')
                ->with('school:id,name')
                ->get();

            return [
                'status' => true,
                'message' => 'Fee collection report fetched successfully.',
                'data' => [
                    'total_collection' => $totalCollection,
                    'transaction_count' => $transactionCount,
                    'collection_by_school' => $collectionBySchool,
                    'period' => [
                        'start_date' => $startDate,
                        'end_date' => $endDate,
                    ],
                ],
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error fetching fee collection report: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch fee collection report.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get pending dues report
     */
    public function getPendingDuesReport($accountantId, array $filters = []): array
    {
        try {
            $accessibleSchoolIds = $this->getAccessibleSchoolIds($accountantId);
            
            if (empty($accessibleSchoolIds)) {
                return [
                    'status' => false,
                    'message' => 'No accessible schools found.',
                    'data' => [],
                    'error' => null,
                ];
            }

            $schoolId = $filters['school_id'] ?? null;

            if ($schoolId && !$this->canAccessSchool($accountantId, $schoolId)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => [],
                    'error' => null,
                ];
            }

            // Monthly pending dues
            $monthlyPending = MonthlyPayment::whereIn('school_id', $schoolId ? [$schoolId] : $accessibleSchoolIds)
                ->where('status', 'due')
                ->with(['student:id,candidate_name,class', 'school:id,name'])
                ->get();

            // Annual pending dues
            $annualPending = AnnualPayment::whereIn('school_id', $schoolId ? [$schoolId] : $accessibleSchoolIds)
                ->where('status', 'due')
                ->with(['studentDetail:id,candidate_name,class', 'school:id,name'])
                ->get();

            $totalPending = $monthlyPending->sum('total_amount') + $annualPending->sum('total_amount');

            return [
                'status' => true,
                'message' => 'Pending dues report fetched successfully.',
                'data' => [
                    'monthly_pending' => $monthlyPending,
                    'annual_pending' => $annualPending,
                    'total_pending_amount' => $totalPending,
                    'total_students_with_pending' => $monthlyPending->pluck('student_details_id')->merge($annualPending->pluck('student_details_id'))->unique()->count(),
                ],
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error fetching pending dues report: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch pending dues report.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get payment history
     */
    public function getPaymentHistory($accountantId, array $filters = []): array
    {
        try {
            $accessibleSchoolIds = $this->getAccessibleSchoolIds($accountantId);
            
            if (empty($accessibleSchoolIds)) {
                return [
                    'status' => false,
                    'message' => 'No accessible schools found.',
                    'data' => [],
                    'error' => null,
                ];
            }

            $schoolId = $filters['school_id'] ?? null;
            $startDate = $filters['start_date'] ?? null;
            $endDate = $filters['end_date'] ?? null;
            $status = $filters['status'] ?? null;

            if ($schoolId && !$this->canAccessSchool($accountantId, $schoolId)) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized access to school.',
                    'data' => [],
                    'error' => null,
                ];
            }

            // Monthly payments
            $monthlyQuery = MonthlyPayment::whereIn('school_id', $schoolId ? [$schoolId] : $accessibleSchoolIds)
                ->with(['student:id,candidate_name,class', 'school:id,name']);

            if ($startDate) {
                $monthlyQuery->whereDate('payment_date', '>=', $startDate);
            }

            if ($endDate) {
                $monthlyQuery->whereDate('payment_date', '<=', $endDate);
            }

            if ($status) {
                $monthlyQuery->where('status', $status);
            }

            $monthlyPayments = $monthlyQuery->orderBy('payment_date', 'desc')
                ->limit(100)
                ->get();

            // Annual payments
            $annualQuery = AnnualPayment::whereIn('school_id', $schoolId ? [$schoolId] : $accessibleSchoolIds)
                ->with(['studentDetail:id,candidate_name,class', 'school:id,name']);

            if ($startDate) {
                $annualQuery->whereDate('payment_date', '>=', $startDate);
            }

            if ($endDate) {
                $annualQuery->whereDate('payment_date', '<=', $endDate);
            }

            if ($status) {
                $annualQuery->where('status', $status);
            }

            $annualPayments = $annualQuery->orderBy('payment_date', 'desc')
                ->limit(100)
                ->get();

            // Combine and sort
            $allPayments = $monthlyPayments->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'type' => 'monthly',
                    'student_name' => $payment->student->candidate_name ?? 'N/A',
                    'school_name' => $payment->school->name ?? 'N/A',
                    'amount' => $payment->total_amount,
                    'status' => $payment->status,
                    'payment_date' => $payment->payment_date,
                    'mode' => $payment->mode,
                    'created_at' => $payment->created_at,
                ];
            })->merge($annualPayments->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'type' => 'annual',
                    'student_name' => $payment->studentDetail->candidate_name ?? 'N/A',
                    'school_name' => $payment->school->name ?? 'N/A',
                    'amount' => $payment->total_amount,
                    'status' => $payment->status,
                    'payment_date' => $payment->payment_date,
                    'mode' => $payment->mode,
                    'created_at' => $payment->created_at,
                ];
            }))->sortByDesc('payment_date')->values();

            return [
                'status' => true,
                'message' => 'Payment history fetched successfully.',
                'data' => $allPayments,
                'error' => null,
            ];

        } catch (Exception $e) {
            Log::error("Error fetching payment history: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch payment history.',
                'data' => [],
                'error' => $e->getMessage(),
            ];
        }
    }
}

