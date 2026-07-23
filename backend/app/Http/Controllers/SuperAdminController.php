<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\Subscription;
use App\Models\School;
use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\PaymentTransaction;
use App\Models\ContactEnquiry;
use App\Repositories\SubscriptionPlanRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Exception;

class SuperAdminController extends Controller
{
    protected $planRepository;

    public function __construct(SubscriptionPlanRepository $planRepository)
    {
        $this->planRepository = $planRepository;
    }
    // ==================== DASHBOARD & ANALYTICS ====================

    /**
     * Get super admin dashboard statistics
     * GET /api/super-admin/dashboard/stats
     */
    public function getDashboardStats()
    {
        try {
            $stats = [
                'total_schools' => School::count(),
                'active_schools' => School::where('status', 'active')->count(),
                'total_users' => User::count(),
                'total_subscriptions' => Subscription::count(),
                'active_subscriptions' => Subscription::where('status', 'active')->count(),
                'trial_subscriptions' => Subscription::where('status', 'trial')->count(),
                'expired_subscriptions' => Subscription::where('status', 'expired')->count(),
                'total_revenue' => PaymentTransaction::where('status', 'completed')->sum('amount'),
                'monthly_revenue' => PaymentTransaction::where('status', 'completed')
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->sum('amount'),
                'pending_payments' => PaymentTransaction::where('status', 'pending')->count(),
            ];

            // Recent activities
            $recentSchools = School::with('user')->orderBy('created_at', 'desc')->limit(5)->get();
            $recentSubscriptions = Subscription::with(['school', 'plan'])->orderBy('created_at', 'desc')->limit(5)->get();
            $recentTransactions = PaymentTransaction::with(['school'])->orderBy('created_at', 'desc')->limit(10)->get();

            return response()->json([
                'status' => true,
                'data' => [
                    'stats' => $stats,
                    'recent_schools' => $recentSchools,
                    'recent_subscriptions' => $recentSubscriptions,
                    'recent_transactions' => $recentTransactions,
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get dashboard stats failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch dashboard stats.',
            ], 500);
        }
    }

    // ==================== SUBSCRIPTION PLAN MANAGEMENT ====================

    /**
     * Get all subscription plans with pagination
     * GET /api/super-admin/plans?page=1&per_page=5
     */
    public function getAllPlans(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 10);
            $page = $request->get('page', 1);

            Log::info('Getting plans with pagination', ['page' => $page, 'per_page' => $perPage]);

            // Get paginated plans using repository
            $result = $this->planRepository->getPaginatedPlans($perPage, $page);

            Log::info('Plans fetched successfully', ['total' => $result['total'], 'count' => count($result['data'])]);

            return response()->json([
                'status' => true,
                'data' => [
                    'plans' => $result['data'],
                    'pagination' => [
                        'current_page' => $result['current_page'],
                        'per_page' => $result['per_page'],
                        'total' => $result['total'],
                        'last_page' => $result['last_page'],
                        'from' => $result['from'],
                        'to' => $result['to'],
                    ]
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get plans failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch plans.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single plan
     * GET /api/super-admin/plans/{id}
     */
    public function getPlan($id)
    {
        try {
            $plan = SubscriptionPlan::with('subscriptions')->find($id);

            if (!$plan) {
                return response()->json([
                    'status' => false,
                    'message' => 'Plan not found.',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'data' => $plan,
            ]);

        } catch (Exception $e) {
            Log::error('Get plan failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch plan.',
            ], 500);
        }
    }

    /**
     * Create subscription plan
     * POST /api/super-admin/plans
     */
    public function createPlan(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100|unique:subscription_plans,name',
                'code' => 'sometimes|string|max:50|unique:subscription_plans,code',
                'description' => 'nullable|string',
                'price' => 'nullable|numeric|min:0',  // Legacy field - nullable
                'monthly_price' => 'required|numeric|min:1',  // Monthly subscription price
                'annual_price' => 'nullable|numeric|min:1',  // Annual subscription price
                'duration_days' => 'required|integer|min:1',
                'currency' => 'nullable|string',
                'features' => 'sometimes|array',
                'max_students' => 'nullable|integer|min:1',
                'max_teachers' => 'nullable|integer|min:1',
                'max_staff' => 'nullable|integer|min:1',
                'max_users' => 'nullable|integer|min:1',
                'max_classes' => 'nullable|integer|min:1',
                'max_trial_days' => 'nullable|integer|min:1',
                'trial_days' => 'nullable|integer|min:0|max:30',
                'is_active' => 'sometimes|boolean',
                'is_trial' => 'sometimes|boolean',
                'is_popular' => 'sometimes|boolean',
                'sort_order' => 'sometimes|integer|min:0',
            ]);

            $validated['is_active'] = $validated['is_active'] ?? true;
            $validated['is_trial'] = $validated['is_trial'] ?? false;
            $validated['is_popular'] = $validated['is_popular'] ?? false;
            $validated['currency'] = $validated['currency'] ?? 'INR';
            $validated['sort_order'] = $validated['sort_order'] ?? 0;

            // If price not provided, use monthly_price for price (legacy field)
            if (!isset($validated['price'])) {
                $validated['price'] = $validated['monthly_price'];
            }

            // Auto-generate code if not provided
            if (!isset($validated['code']) || empty($validated['code'])) {
                $baseCode = strtoupper(preg_replace('/[^A-Za-z0-9]+/', '_', $validated['name']));
                $code = $baseCode;
                $counter = 1;

                // Ensure code is unique
                while (SubscriptionPlan::where('code', $code)->exists()) {
                    $code = $baseCode . '_' . $counter;
                    $counter++;
                }

                $validated['code'] = $code;
            }

            // Encode features array to JSON for storage
            if (isset($validated['features']) && is_array($validated['features'])) {
                $validated['features'] = json_encode($validated['features']);
            }

            $plan = SubscriptionPlan::create($validated);

            return response()->json([
                'status' => true,
                'message' => 'Plan created successfully.',
                'data' => $plan,
            ], 201);

        } catch (ValidationException $e) {
            Log::warning('Plan creation validation failed', [
                'errors' => $e->errors(),
                'input' => $request->except(['password']),
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Validation error: ' . collect($e->errors())->flatten()->first(),
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Create plan failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to create plan: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update subscription plan
     * PUT /api/super-admin/plans/{id}
     */
    public function updatePlan(Request $request, $id)
    {
        try {
            $plan = SubscriptionPlan::find($id);

            if (!$plan) {
                return response()->json([
                    'status' => false,
                    'message' => 'Plan not found.',
                ], 404);
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:100|unique:subscription_plans,name,' . $id,
                'code' => 'sometimes|string|max:50|unique:subscription_plans,code,' . $id,
                'description' => 'nullable|string',
                'price' => 'nullable|numeric|min:0',  // Legacy field - nullable
                'monthly_price' => 'sometimes|numeric|min:1',  // Monthly subscription price
                'annual_price' => 'nullable|numeric|min:1',  // Annual subscription price
                'duration_days' => 'sometimes|integer|min:1',
                'currency' => 'nullable|string',
                'features' => 'sometimes|array',
                'max_students' => 'nullable|integer|min:1',
                'max_teachers' => 'nullable|integer|min:1',
                'max_staff' => 'nullable|integer|min:1',
                'max_users' => 'nullable|integer|min:1',
                'max_classes' => 'nullable|integer|min:1',
                'max_trial_days' => 'nullable|integer|min:1',
                'trial_days' => 'nullable|integer|min:0|max:30',
                'is_active' => 'sometimes|boolean',
                'is_trial' => 'sometimes|boolean',
                'is_popular' => 'sometimes|boolean',
                'sort_order' => 'sometimes|integer|min:0',
            ]);

            // Encode features array to JSON for storage
            if (isset($validated['features']) && is_array($validated['features'])) {
                $validated['features'] = json_encode($validated['features']);
            }

            $plan->update($validated);

            return response()->json([
                'status' => true,
                'message' => 'Plan updated successfully.',
                'data' => $plan->fresh(),
            ]);

        } catch (ValidationException $e) {
            Log::warning('Plan update validation failed', [
                'plan_id' => $id,
                'errors' => $e->errors(),
                'input' => $request->except(['password']),
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Validation error: ' . collect($e->errors())->flatten()->first(),
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Update plan failed', [
                'plan_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to update plan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete subscription plan
     * DELETE /api/super-admin/plans/{id}
     */
    public function deletePlan($id)
    {
        try {
            $plan = SubscriptionPlan::find($id);

            if (!$plan) {
                return response()->json([
                    'status' => false,
                    'message' => 'Plan not found.',
                ], 404);
            }

            // Check if plan has active subscriptions
            $activeSubscriptions = Subscription::where('plan_id', $id)
                ->whereIn('status', ['active', 'trial'])
                ->count();

            if ($activeSubscriptions > 0) {
                return response()->json([
                    'status' => false,
                    'message' => "Cannot delete plan. {$activeSubscriptions} active subscriptions are using this plan.",
                ], 400);
            }

            $plan->delete();

            return response()->json([
                'status' => true,
                'message' => 'Plan deleted successfully.',
            ]);

        } catch (Exception $e) {
            Log::error('Delete plan failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete plan.',
            ], 500);
        }
    }

    /**
     * Toggle plan status
     * PATCH /api/super-admin/plans/{id}/toggle-status
     */
    public function togglePlanStatus($id)
    {
        try {
            $plan = SubscriptionPlan::find($id);

            if (!$plan) {
                return response()->json([
                    'status' => false,
                    'message' => 'Plan not found.',
                ], 404);
            }

            $plan->update([
                'is_active' => !$plan->is_active,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Plan status updated successfully.',
                'data' => $plan->fresh(),
            ]);

        } catch (Exception $e) {
            Log::error('Toggle plan status failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update plan status.',
            ], 500);
        }
    }

    // ==================== SCHOOL MANAGEMENT ====================

    /**
     * Get all schools with filters
     * GET /api/super-admin/schools
     */
    public function getAllSchools(Request $request)
    {
        try {
            $perPage = $request->query('per_page', 1000); // Get all by default
            $status = $request->query('status');
            $search = $request->query('search');

            $query = School::with(['user', 'subscriptions' => function ($q) {
                $q->where('status', 'active')->orWhere('status', 'trial')->orderBy('created_at', 'desc')->limit(1);
            }]);

            if ($status) {
                $query->where('status', $status);
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('school_code', 'like', "%{$search}%");
                });
            }

            $schools = $query->orderBy('created_at', 'desc')->get();

            // Add subscription status and end date to each school
            $schools = $schools->map(function ($school) {
                $activeSubscription = $school->subscriptions->first();

                return [
                    'id' => $school->id,
                    'name' => $school->name,
                    'email' => $school->email,
                    'phone' => $school->phone,
                    'address' => $school->address,
                    'city' => $school->city,
                    'state' => $school->state,
                    'pincode' => $school->pincode,
                    'school_code' => $school->school_code,
                    'board' => $school->board,
                    'affiliation_number' => $school->affiliation_number,
                    'established_year' => $school->established_year,
                    'total_students' => $school->total_students ?? 0,
                    'total_teachers' => $school->total_teachers ?? 0,
                    'status' => $school->status,
                    'subscription_status' => $activeSubscription ? $activeSubscription->status : 'none',
                    'subscription_end_date' => $activeSubscription ? $activeSubscription->end_date : null,
                    'created_at' => $school->created_at,
                ];
            });

            return response()->json([
                'status' => true,
                'data' => [
                    'schools' => $schools
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get schools failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch schools.',
            ], 500);
        }
    }

    /**
     * Toggle school status
     * PATCH /api/super-admin/schools/{id}/toggle-status
     */
    public function toggleSchoolStatus($id)
    {
        try {
            $school = School::find($id);

            if (!$school) {
                return response()->json([
                    'status' => false,
                    'message' => 'School not found.',
                ], 404);
            }

            $newStatus = $school->status === 'active' ? 'inactive' : 'active';
            $school->update(['status' => $newStatus]);

            return response()->json([
                'status' => true,
                'message' => 'School status updated successfully.',
                'data' => $school->fresh(),
            ]);

        } catch (Exception $e) {
            Log::error('Toggle school status failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update school status.',
            ], 500);
        }
    }

    // ==================== REVENUE & REPORTS ====================

    /**
     * Get revenue report
     * GET /api/super-admin/reports/revenue
     */
    public function getRevenueReport(Request $request)
    {
        try {
            $startDate = $request->query('start_date', now()->subDays(30));
            $endDate = $request->query('end_date', now());

            $revenue = PaymentTransaction::where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            $totalRevenue = PaymentTransaction::where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount');

            return response()->json([
                'status' => true,
                'data' => [
                    'daily_revenue' => $revenue,
                    'total_revenue' => $totalRevenue,
                    'period' => [
                        'start' => $startDate,
                        'end' => $endDate,
                    ],
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get revenue report failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch revenue report.',
            ], 500);
        }
    }

    // ==================== ALL USERS MANAGEMENT ====================

    /**
     * Get all users across all schools with advanced filtering
     * GET /api/super-admin/users?page=1&per_page=15&role=student&school_id=1&status=active&search=john
     */
    public function getAllUsers(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $page = $request->get('page', 1);
            $role = $request->get('role'); // Filter by role: student, teacher, principal, administrator, parent, etc.
            $schoolId = $request->get('school_id');
            $status = $request->get('status'); // Filter by status: active, inactive, suspended
            $registrationStatus = $request->get('registration_status'); // Filter by registration_status
            $search = $request->get('search'); // Search by name, email, phone, username

            $allUsers = collect();

            // ========== Get Users from users table (principals, administrators, parents, accountants, librarians) ==========
            $userRoles = ['principal', 'administrator', 'parent', 'accountant', 'librarian'];
            
            // If role filter is set and it's NOT student or teacher, only query users table
            // If role filter is NOT set or is student/teacher, include all users
            if (!$role || (!in_array($role, ['student', 'teacher']) && in_array($role, $userRoles))) {
                $usersQuery = User::with(['school:id,name'])
                    ->select([
                        'users.id',
                        'users.username',
                        'users.email',
                        'users.phone',
                        'users.full_name',
                        'users.role',
                        'users.status',
                        'users.registration_status',
                        'users.assignment_status',
                        'users.email_verified',
                        'users.school_setup_completed',
                        'users.subscription_active',
                        'users.school_id',
                        'users.created_at',
                        'users.updated_at',
                    ]);

                // Filter by role (only for user roles)
                if ($role && in_array($role, $userRoles)) {
                    $usersQuery->where('users.role', $role);
                } elseif (!$role) {
                    $usersQuery->whereIn('users.role', $userRoles);
                }

                // Filter by school_id
                if ($schoolId) {
                    $usersQuery->where('users.school_id', $schoolId);
                }

                // Filter by status
                if ($status) {
                    $usersQuery->where('users.status', $status);
                }

                // Filter by registration_status
                if ($registrationStatus) {
                    $usersQuery->where('users.registration_status', $registrationStatus);
                }

                // Search
                if ($search) {
                    $usersQuery->where(function ($q) use ($search) {
                        $q->where('users.full_name', 'like', "%{$search}%")
                          ->orWhere('users.username', 'like', "%{$search}%")
                          ->orWhere('users.email', 'like', "%{$search}%")
                          ->orWhere('users.phone', 'like', "%{$search}%");
                    });
                }

                $usersFromUsersTable = $usersQuery->get();
                
                foreach ($usersFromUsersTable as $user) {
                    $allUsers->push([
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'full_name' => $user->full_name,
                        'role' => $user->role,
                        'status' => $user->status,
                        'registration_status' => $user->registration_status,
                        'assignment_status' => $user->assignment_status,
                        'email_verified' => $user->email_verified,
                        'school_setup_completed' => $user->school_setup_completed,
                        'subscription_active' => $user->subscription_active,
                        'school_id' => $user->school_id,
                        'school_name' => $user->school ? $user->school->name : null,
                        'created_at' => $user->created_at,
                        'updated_at' => $user->updated_at,
                    ]);
                }
            }

            // ========== Get Students from students table ==========
            if (!$role || $role === 'student') {
                $studentsQuery = Student::with(['school:id,name', 'detail'])
                    ->select([
                        'students.id',
                        'students.username',
                        'students.email',
                        'students.school_id',
                        'students.class',
                        'students.status',
                        'students.created_at',
                        'students.updated_at',
                    ]);

                // Filter by school_id
                if ($schoolId) {
                    $studentsQuery->where('students.school_id', $schoolId);
                }

                // Filter by status
                if ($status) {
                    $studentsQuery->where('students.status', $status);
                }

                // Search
                if ($search) {
                    $studentsQuery->where(function ($q) use ($search) {
                        $q->where('students.username', 'like', "%{$search}%")
                          ->orWhere('students.email', 'like', "%{$search}%")
                          ->orWhereHas('detail', function ($query) use ($search) {
                              $query->where('candidate_name', 'like', "%{$search}%")
                                    ->orWhere('phone', 'like', "%{$search}%")
                                    ->orWhere('roll_no', 'like', "%{$search}%");
                          });
                    });
                }

                $students = $studentsQuery->get();

                foreach ($students as $student) {
                    $studentDetails = $student->detail;
                    $studentData = [
                        'id' => $student->id,
                        'username' => $student->username,
                        'email' => $student->email,
                        'phone' => $studentDetails ? $studentDetails->phone : null,
                        'full_name' => $studentDetails ? $studentDetails->candidate_name : $student->username,
                        'role' => 'student',
                        'status' => $student->status ?? 'active',
                        'registration_status' => 'active',
                        'assignment_status' => null,
                        'email_verified' => true,
                        'school_setup_completed' => true,
                        'subscription_active' => true,
                        'school_id' => $student->school_id,
                        'school_name' => $student->school ? $student->school->name : null,
                        'student_details' => $studentDetails ? [
                            'class' => $studentDetails->class,
                            'roll_no' => $studentDetails->roll_no,
                            'section' => $studentDetails->section,
                            'admission_date' => $studentDetails->admission_date,
                        ] : null,
                        'created_at' => $student->created_at,
                        'updated_at' => $student->updated_at,
                    ];

                    // Apply registration_status filter if set
                    if (!$registrationStatus || $studentData['registration_status'] === $registrationStatus) {
                        $allUsers->push($studentData);
                    }
                }
            }

            // ========== Get Teachers from teachers table ==========
            if (!$role || $role === 'teacher') {
                $teachersQuery = Teacher::with(['school:id,name', 'user'])
                    ->select([
                        'teachers.id',
                        'teachers.name',
                        'teachers.email',
                        'teachers.phone',
                        'teachers.user_id',
                        'teachers.school_id',
                        'teachers.qualification',
                        'teachers.employee_code',
                        'teachers.status',
                        'teachers.created_at',
                        'teachers.updated_at',
                    ]);

                // Filter by school_id
                if ($schoolId) {
                    $teachersQuery->where('teachers.school_id', $schoolId);
                }

                // Filter by status
                if ($status) {
                    $teachersQuery->where('teachers.status', $status);
                }

                // Search
                if ($search) {
                    $teachersQuery->where(function ($q) use ($search) {
                        $q->where('teachers.name', 'like', "%{$search}%")
                          ->orWhere('teachers.email', 'like', "%{$search}%")
                          ->orWhere('teachers.phone', 'like', "%{$search}%")
                          ->orWhere('teachers.employee_code', 'like', "%{$search}%");
                    });
                }

                $teachers = $teachersQuery->get();

                foreach ($teachers as $teacher) {
                    $user = $teacher->user; // Get user record if exists
                    $teacherData = [
                        'id' => $teacher->user_id ?: $teacher->id, // Use user_id if exists, else teacher id
                        'username' => $user ? $user->username : $teacher->name,
                        'email' => $teacher->email,
                        'phone' => $teacher->phone,
                        'full_name' => $teacher->name,
                        'role' => 'teacher',
                        'status' => $teacher->status ?? ($user ? $user->status : 'active'),
                        'registration_status' => $user ? $user->registration_status : 'active',
                        'assignment_status' => $user ? $user->assignment_status : null,
                        'email_verified' => $user ? $user->email_verified : true,
                        'school_setup_completed' => $user ? $user->school_setup_completed : true,
                        'subscription_active' => $user ? $user->subscription_active : true,
                        'school_id' => $teacher->school_id,
                        'school_name' => $teacher->school ? $teacher->school->name : null,
                        'teacher_details' => [
                            'qualification' => $teacher->qualification,
                            'employee_code' => $teacher->employee_code,
                        ],
                        'created_at' => $teacher->created_at,
                        'updated_at' => $teacher->updated_at,
                    ];

                    // Apply registration_status filter if set
                    if (!$registrationStatus || $teacherData['registration_status'] === $registrationStatus) {
                        $allUsers->push($teacherData);
                    }
                }
            }

            // Sort by created_at descending
            $allUsers = $allUsers->sortByDesc('created_at')->values();

            // Manual pagination
            $total = $allUsers->count();
            $totalPages = ceil($total / $perPage);
            $from = (($page - 1) * $perPage) + 1;
            $to = min($page * $perPage, $total);
            $paginatedUsers = $allUsers->slice(($page - 1) * $perPage, $perPage)->values()->all();

            return response()->json([
                'status' => true,
                'data' => [
                    'users' => $paginatedUsers,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $perPage,
                        'total' => $total,
                        'last_page' => $totalPages,
                        'from' => $from,
                        'to' => $to,
                    ],
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get all users failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch users.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ==================== CONTACT ENQUIRIES MANAGEMENT ====================

    /**
     * Get all contact enquiries with pagination and filters
     * GET /api/super-admin/enquiries?page=1&per_page=10&status=pending&search=email
     */
    public function getAllEnquiries(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $page = $request->get('page', 1);
            $status = $request->get('status');
            $search = $request->get('search');

            $query = ContactEnquiry::query();

            // Filter by status
            if ($status && in_array($status, ['pending', 'replied', 'resolved'])) {
                $query->where('status', $status);
            }

            // Search by name, email, subject
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('subject', 'like', "%{$search}%");
                });
            }

            $enquiries = $query->orderBy('created_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'status' => true,
                'data' => [
                    'enquiries' => $enquiries->items(),
                    'pagination' => [
                        'current_page' => $enquiries->currentPage(),
                        'per_page' => $enquiries->perPage(),
                        'total' => $enquiries->total(),
                        'last_page' => $enquiries->lastPage(),
                        'from' => $enquiries->firstItem(),
                        'to' => $enquiries->lastItem(),
                    ],
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get enquiries failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch enquiries.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single enquiry details
     * GET /api/super-admin/enquiries/{id}
     */
    public function getEnquiry($id)
    {
        try {
            $enquiry = ContactEnquiry::find($id);

            if (!$enquiry) {
                return response()->json([
                    'status' => false,
                    'message' => 'Enquiry not found.',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'data' => $enquiry,
            ]);

        } catch (Exception $e) {
            Log::error('Get enquiry failed', [
                'enquiry_id' => $id,
                'message' => $e->getMessage(),
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch enquiry.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update enquiry status
     * PATCH /api/super-admin/enquiries/{id}/status
     */
    public function updateEnquiryStatus(Request $request, $id)
    {
        try {
            $enquiry = ContactEnquiry::find($id);

            if (!$enquiry) {
                return response()->json([
                    'status' => false,
                    'message' => 'Enquiry not found.',
                ], 404);
            }

            $validated = $request->validate([
                'status' => 'required|in:pending,replied,resolved',
            ]);

            $enquiry->update([
                'status' => $validated['status'],
            ]);

            Log::info('Enquiry status updated', [
                'enquiry_id' => $enquiry->id,
                'new_status' => $validated['status'],
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Enquiry status updated successfully.',
                'data' => $enquiry->fresh(),
            ]);

        } catch (ValidationException $e) {
            Log::warning('Enquiry status update validation failed', [
                'enquiry_id' => $id,
                'errors' => $e->errors(),
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Validation error: ' . collect($e->errors())->flatten()->first(),
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Update enquiry status failed', [
                'enquiry_id' => $id,
                'message' => $e->getMessage(),
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to update enquiry status.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

