<?php

use App\Http\Controllers\TeacherController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PrincipalController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\SuperAdminAuthController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\MessagingController;
use App\Http\Controllers\SyllabusCompletionController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AccountantController;
use App\Mail\AuthOtp;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Mail;

Route::get('/', function () {
  return response()->json(['message' => 'Welcome to erp  API']);
});

Route::get('/test', function () {
  Mail::to('prasasdashutosh048@gmail.com')->send(new AuthOtp());
  return response()->json(['message' => 'Mail Sent']);
});

// ==================== REGISTRATION & SUBSCRIPTION ROUTES ==================== //

// Public Subscription Plans (No authentication - for pricing page)
// This route must be defined BEFORE any subscription middleware groups to avoid conflicts
Route::get('subscriptions/plans', [SubscriptionController::class, 'getPlans']);

// Public Contact Form Submission (No authentication)
Route::post('contact/submit', [ContactController::class, 'submitEnquiry']);

// Public QR Check-in (for students)
Route::post('attendance/qr-checkin', [AttendanceController::class, 'qrCheckIn']);

// Registration Flow Routes (Require authentication but not subscription)
Route::middleware('jwt.auth')->group(function () {

  // Step 3: School Setup
  Route::prefix('registration')->group(function () {
    Route::post('school/{userId}', [RegistrationController::class, 'registerSchool']);
    Route::get('progress/{userId}', [RegistrationController::class, 'getProgress']);
    Route::delete('cancel/{userId}', [RegistrationController::class, 'cancelRegistration']);
  });

  // Subscription Management (No subscription middleware needed for initiation)
  Route::prefix('subscriptions')->group(function () {
    // Initiate subscription (before payment)
    Route::post('initiate', [SubscriptionController::class, 'initiateSubscription']);

    // Payment callback/webhook
    Route::post('payment-callback', [SubscriptionController::class, 'paymentCallback']);
  });

  // Razorpay Webhook Endpoint
  Route::post('payments/razorpay/webhook', [\App\Http\Controllers\SubscriptionPaymentController::class, 'handleWebhook']);
});

// Protected Routes (Require both authentication AND active subscription)
Route::middleware(['jwt.auth', 'subscription'])->group(function () {

  // Subscription Management (After subscription is active)
  Route::prefix('subscriptions')->group(function () {
    Route::get('current/{schoolId}', [SubscriptionController::class, 'getCurrentSubscription']);
    Route::put('{id}/cancel', [SubscriptionController::class, 'cancelSubscription']);
    Route::get('history/{schoolId}', [SubscriptionController::class, 'getHistory']);

    // Feature & Limit Checks
    Route::get('check-feature/{schoolId}/{feature}', [SubscriptionController::class, 'checkFeature']);
    Route::get('check-limit/{schoolId}/{resource}', [SubscriptionController::class, 'checkLimit']);
  });

  // Payment Transactions
  Route::prefix('payments')->group(function () {
    Route::get('transactions/{schoolId}', [SubscriptionController::class, 'getTransactions']);
  });
});

// -------------------- AUTH ROUTES -------------------- //
Route::prefix('auth')->group(function () {

  // ========== OTP-BASED REGISTRATION FLOW (NEW) ========== //
  // Step 1: Send OTP to email before registration
  Route::post('send-registration-otp', [RegistrationController::class, 'sendRegistrationOTP']);

  // Step 2: Verify OTP and complete registration
  Route::post('verify-otp-and-register', [RegistrationController::class, 'verifyOTPAndRegister']);

  // ========== OLD REGISTRATION & SUBSCRIPTION ROUTES ========== //
  // Step 1: User Registration (Old Flow)
  Route::post('register', [RegistrationController::class, 'register']);

  // ========== EXISTING AUTH ROUTES ========== //
  // Public route to get school list
  Route::get('schools', [AuthController::class, 'getSchoolList']);

  // NEW: Simple login (for newly registered administrators without school setup)
  Route::post('login', [AuthController::class, 'simpleLogin']);

  // OLD: Login with school_id (for existing users with schools)
  Route::post('login/{school_id}', [AuthController::class, 'login']);

  // Get Authenticated User
  Route::get('user', [AuthController::class, 'getUser'])->middleware('jwt.auth');

  // Verify for OTP
  Route::post('verify-otp', [AuthController::class, 'verifyForOtp']);

  // Change Password (role-based)
  Route::post('change-password', [AuthController::class, 'changePassword']);
});

// ================== SUPER ADMIN ROUTES ==================
// Super Admin routes (Software Provider Level)
Route::prefix('super-admin')->group(function () {
  // Test route to verify super-admin prefix is working
  Route::get('/test', function () {
    return response()->json([
      'status' => true,
      'message' => 'Super admin routes are working!',
      'timestamp' => now(),
    ]);
  });

  // Auth routes (no middleware)
  Route::prefix('auth')->group(function () {
    Route::post('/login', [SuperAdminAuthController::class, 'login']);

    // Forgot Password Flow (No authentication required)
    Route::post('/forgot-password', [SuperAdminAuthController::class, 'forgotPassword']);
    Route::post('/verify-reset-token', [SuperAdminAuthController::class, 'verifyResetToken']);
    Route::post('/reset-password', [SuperAdminAuthController::class, 'resetPassword']);

    // Protected auth routes
    Route::middleware(['jwt.auth'])->group(function () {
      Route::get('/me', [SuperAdminAuthController::class, 'me']);
      Route::post('/change-password', [SuperAdminAuthController::class, 'changePassword']);
      Route::post('/logout', [SuperAdminAuthController::class, 'logout']);
    });
  });

  // Protected Super Admin routes
  Route::middleware(['jwt.auth'])->group(function () {
    // Dashboard & Analytics
    Route::get('/dashboard/stats', [SuperAdminController::class, 'getDashboardStats']);
    Route::get('/reports/revenue', [SuperAdminController::class, 'getRevenueReport']);

    // All Users Management
    Route::prefix('users')->group(function () {
      Route::get('/', [SuperAdminController::class, 'getAllUsers']);
    });
    // Contact Enquiries Management
    Route::prefix('enquiries')->group(function () {
      Route::get('/', [SuperAdminController::class, 'getAllEnquiries']);
      Route::get('/{id}', [SuperAdminController::class, 'getEnquiry']);
      Route::patch('/{id}/status', [SuperAdminController::class, 'updateEnquiryStatus']);
    });

    // Subscription Plan Management
    Route::prefix('plans')->group(function () {
      Route::get('/', [SuperAdminController::class, 'getAllPlans']);
      Route::get('/{id}', [SuperAdminController::class, 'getPlan']);
      Route::post('/', [SuperAdminController::class, 'createPlan']);
      Route::put('/{id}', [SuperAdminController::class, 'updatePlan']);
      Route::delete('/{id}', [SuperAdminController::class, 'deletePlan']);
      Route::patch('/{id}/toggle-status', [SuperAdminController::class, 'togglePlanStatus']);
    });

    // School Management (Super Admin Level)
    Route::prefix('schools')->group(function () {
      Route::get('/', [SuperAdminController::class, 'getAllSchools']);
      Route::patch('/{id}/toggle-status', [SuperAdminController::class, 'toggleSchoolStatus']);
    });

    // Can access all subscription and payment routes that administrator has
    Route::prefix('subscriptions')->group(function () {
      Route::post('/assign', [SubscriptionController::class, 'initiateSubscription']);
      Route::get('/school/{school_id}', [SubscriptionController::class, 'getCurrentSubscription']);
      Route::get('/history/{school_id}', [SubscriptionController::class, 'getHistory']);
      Route::put('/{id}/cancel', [SubscriptionController::class, 'cancelSubscription']);
      Route::get('/all', [SubscriptionController::class, 'getAllSubscriptions']);
      Route::get('/transactions/{school_id}', [SubscriptionController::class, 'getTransactions']);
    });

    Route::prefix('payments')->group(function () {
      Route::post('/initiate', [SubscriptionController::class, 'initiatePayment']);
      Route::post('/callback', [SubscriptionController::class, 'paymentCallback']);
    });

    // Subscription Transaction Management (Razorpay)
    Route::prefix('subscription-transactions')->group(function () {
      Route::get('/', [\App\Http\Controllers\SubscriptionPaymentController::class, 'getAllTransactions']);
      Route::get('/stats', [\App\Http\Controllers\SubscriptionPaymentController::class, 'getAllStats']);
      Route::get('/{id}', [\App\Http\Controllers\SubscriptionPaymentController::class, 'getTransaction']);
    });

    // All Users Management
    Route::prefix('users')->group(function () {
      Route::get('/', [SuperAdminController::class, 'getAllUsers']);
    });

    // Contact Enquiries Management
    Route::prefix('enquiries')->group(function () {
      Route::get('/', [SuperAdminController::class, 'getAllEnquiries']);
      Route::get('/{id}', [SuperAdminController::class, 'getEnquiry']);
      Route::patch('/{id}/status', [SuperAdminController::class, 'updateEnquiryStatus']);
    });
  });
});

// ================== ADMINISTRATOR ROUTES ==================
// Administrator routes require ONLY authentication (no subscription check needed)
Route::prefix('administrator')->middleware(['jwt.auth'])->group(function () {
  // Dashboard & Analytics
  Route::get('/dashboard', [UserController::class, 'getAdministratorDashboard']);

  // School Management - Full CRUD for all schools
  Route::prefix('school')->group(function () {
    Route::post('/register', [UserController::class, 'registerSchool']);
    Route::put('/update/{id}', [UserController::class, 'updateSchool']);
    Route::get('/get/{id}', [UserController::class, 'getSchoolById']);
    Route::get('/get-by-code/{code}', [UserController::class, 'getSchoolByCode']);
    Route::get('/getall', [UserController::class, 'getAllSchools']);
    Route::get('/paginated', [UserController::class, 'getPaginatedSchools']);
    Route::get('/active', [UserController::class, 'getActiveSchools']);
    Route::delete('/delete/{id}', [UserController::class, 'deleteSchool']);
    Route::patch('/{id}/toggle-status', [UserController::class, 'toggleSchoolStatus']);
    Route::post('/update-logo/{id}', [UserController::class, 'updateSchoolLogo']);
    Route::post('/update-principal-signature/{id}', [UserController::class, 'updatePrincipalSignature']);
  });

  // Get stats for a specific school
  Route::get('/stats/{school_id}', [UserController::class, 'getStats']);

  // Get all subscription plans (for assigning to schools)
  Route::get('/plans', [SuperAdminController::class, 'getAllPlans']);

  // Subscription Management for Schools
  Route::prefix('subscriptions')->group(function () {
    // Assign/Update subscription for a school
    Route::post('/assign', [SubscriptionController::class, 'initiateSubscription']);

    // Get subscription for a specific school
    Route::get('/school/{school_id}', [SubscriptionController::class, 'getCurrentSubscription']);

    // Get subscription history
    Route::get('/history/{school_id}', [SubscriptionController::class, 'getHistory']);

    // Cancel subscription
    Route::put('/{id}/cancel', [SubscriptionController::class, 'cancelSubscription']);

    // Get all subscriptions (admin overview)
    Route::get('/all', [SubscriptionController::class, 'getAllSubscriptions']);

    // Payment transactions for a school
    Route::get('/transactions/{school_id}', [SubscriptionController::class, 'getTransactions']);
  });

  // Payment Management - Using Razorpay like backend1
  Route::prefix('payments')->group(function () {
    // Create Razorpay order for subscription payment
    Route::post('/createPaymentOrder', [\App\Http\Controllers\SubscriptionPaymentController::class, 'createPaymentOrder']);

    // Verify payment and activate subscription
    Route::post('/verifyPayment', [\App\Http\Controllers\SubscriptionPaymentController::class, 'verifyPayment']);

    // Get all payment transactions (Administrator only)
    Route::get('/all', [SubscriptionController::class, 'getAllTransactions']);

    // Get subscription transactions for administrator
    Route::get('/transactions', [\App\Http\Controllers\SubscriptionPaymentController::class, 'getAdministratorTransactions']);

    // Get subscription transaction statistics
    Route::get('/transaction-stats', [\App\Http\Controllers\SubscriptionPaymentController::class, 'getAdministratorStats']);
  });

  // Principal Management - Full CRUD for principals
  Route::prefix('principals')->group(function () {
    Route::get('/', [PrincipalController::class, 'index']);
    Route::get('/paginated', [PrincipalController::class, 'paginated']);
    Route::get('/unassigned', [PrincipalController::class, 'unassigned']);
    Route::get('/{id}', [PrincipalController::class, 'show']);
    Route::post('/create', [PrincipalController::class, 'store']);
    Route::put('/update/{id}', [PrincipalController::class, 'update']);
    Route::delete('/delete/{id}', [PrincipalController::class, 'destroy']);
    Route::post('/assign-to-school', [PrincipalController::class, 'assignToSchool']);
    Route::post('/unassign-from-school/{id}', [PrincipalController::class, 'unassignFromSchool']);
    Route::patch('/toggle-status/{id}', [PrincipalController::class, 'toggleStatus']);
    Route::post('/resend-credentials/{id}', [PrincipalController::class, 'resendCredentials']);
    Route::post('/reset-password/{id}', [PrincipalController::class, 'resetPassword']);
  });

  // Notifications/Notices Management for Administrator
  Route::get('/notices/all', [\App\Http\Controllers\NoticeController::class, 'getAdministratorNotices']);

  // Profile Management
  Route::prefix('profile')->group(function () {
    Route::put('/update', [UserController::class, 'updateAdministratorProfile']);
    Route::put('/change-password', [UserController::class, 'changeAdministratorPassword']);
  });
});

// ================== USERS ==================
// Principal subscription check (no subscription middleware - they need to check status)
Route::prefix('principal')->middleware(['jwt.auth'])->group(function () {
  // Get school subscription status (for access control)
  Route::get('/subscription/status', [SubscriptionController::class, 'getPrincipalSubscriptionStatus']);

  // Get administrator details for contact
  Route::get('/administrator/{id}', [PrincipalController::class, 'getAdministratorDetails']);

  // Request subscription from administrator
  Route::post('/request-subscription', [PrincipalController::class, 'requestSubscription']);

  // Principal Communication Routes (no subscription required)
  Route::get('/{id}/message-permissions', [PrincipalController::class, 'getMessagePermissions']);
  Route::put('/{id}/message-permissions', [PrincipalController::class, 'updateMessagePermissions']);
  Route::get('/{id}/communication-stats', [PrincipalController::class, 'getCommunicationStats']);
  Route::get('/{id}/conversations', [MessagingController::class, 'getPrincipalConversations']);
  Route::get('/{id}/contactable-users', [MessagingController::class, 'getContactableUsers']);
});

// ---------------------- 💼 Accountant Fee Management ----------------------
Route::prefix('accountant')->middleware(['jwt.auth'])->group(function () {
  // Dashboard
  Route::get('/dashboard/stats', [AccountantController::class, 'getDashboardStats']);
  Route::get('/schools/accessible', [AccountantController::class, 'getAccessibleSchools']);
  
  // Fee Structure Management
  Route::prefix('fee-structure')->group(function () {
    Route::get('/all', [AccountantController::class, 'getAllFeeStructures']);
    Route::post('/create', [AccountantController::class, 'createFeeStructure']);
    Route::put('/update/{id}', [AccountantController::class, 'updateFeeStructure']);
    Route::delete('/delete/{id}', [AccountantController::class, 'deleteFeeStructure']);
  });
  
  // Monthly Payment Management
  Route::prefix('monthly-payments')->group(function () {
    Route::get('/all', [AccountantController::class, 'getAllMonthlyPayments']);
    Route::post('/create', [AccountantController::class, 'createMonthlyPayment']);
    Route::put('/update/{id}', [AccountantController::class, 'updateMonthlyPayment']);
    Route::post('/generate-dues/{school_id}', [AccountantController::class, 'generateMonthlyDues']);
  });
  
  // Annual Payment Management
  Route::prefix('annual-payments')->group(function () {
    Route::get('/all', [AccountantController::class, 'getAllAnnualPayments']);
    Route::post('/create', [AccountantController::class, 'createAnnualPayment']);
    Route::put('/update/{id}', [AccountantController::class, 'updateAnnualPayment']);
    Route::delete('/delete/{id}', [AccountantController::class, 'deleteAnnualPayment']);
  });
  
  // Service Charge Management
  Route::prefix('service-charges')->group(function () {
    Route::get('/all', [AccountantController::class, 'getAllServiceCharges']);
    Route::post('/create', [AccountantController::class, 'createServiceCharge']);
    Route::put('/update/{id}', [AccountantController::class, 'updateServiceCharge']);
    Route::delete('/delete/{id}', [AccountantController::class, 'deleteServiceCharge']);
  });
  
  // Extra Service Management
  Route::prefix('extra-services')->group(function () {
    Route::get('/students/{school_id}', [AccountantController::class, 'getStudentExtraServices']);
    Route::post('/assign', [AccountantController::class, 'assignExtraService']);
    Route::delete('/remove/{id}', [AccountantController::class, 'removeExtraService']);
  });
  
  // Reports
  Route::prefix('reports')->group(function () {
    Route::get('/fee-collection', [AccountantController::class, 'getFeeCollectionReport']);
    Route::get('/pending-dues', [AccountantController::class, 'getPendingDuesReport']);
    Route::get('/payment-history', [AccountantController::class, 'getPaymentHistory']);
  });
});

// Principal routes without subscription requirement (for setup progress)
Route::prefix('principal')->middleware(['jwt.auth'])->group(function () {
    Route::get('/school-complete-info/{school_id}', [UserController::class, 'getSchoolWithCompleteInfo']);
});

// Principal routes now require BOTH authentication AND active subscription
Route::prefix('principal')->middleware(['jwt.auth', 'subscription'])->group(function () {
  // Dashboard
  Route::get('/dashboard/{school_id}', [UserController::class, 'getPrincipalDashboard']);

  // Stats
  Route::get('/stats/{school_id}', [UserController::class, 'getStats']);

  // Library Statistics
  Route::get('/library/statistics/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getStatistics']);

  // ---------------------- 📊 Reports & Analytics ----------------------
  Route::prefix('reports')->group(function () {
    Route::post('/data', [\App\Http\Controllers\ReportController::class, 'getReportData']);
    Route::post('/export', [\App\Http\Controllers\ReportController::class, 'exportReport']);
    Route::get('/attendance-trends/{school_id}', [\App\Http\Controllers\ReportController::class, 'getAttendanceTrends']);
    Route::get('/fee-collection/{school_id}', [\App\Http\Controllers\ReportController::class, 'getFeeCollectionStats']);
    Route::get('/performance-metrics/{school_id}', [\App\Http\Controllers\ReportController::class, 'getPerformanceMetrics']);
  });

  // ---------------------- 🏫 School Management ----------------------
  Route::prefix('school')->group(function () {
    Route::post('/register', [UserController::class, 'registerSchool']);
    Route::put('/update/{id}', [UserController::class, 'updateSchool']);
    Route::get('/get/{id}', [UserController::class, 'getSchoolById']);
    Route::get('/get-by-code/{code}', [UserController::class, 'getSchoolByCode']);
    Route::get('/getall', [UserController::class, 'getAllSchools']);
    Route::get('/paginated', [UserController::class, 'getPaginatedSchools']);
    Route::get('/active', [UserController::class, 'getActiveSchools']);
    Route::delete('/delete/{id}', [UserController::class, 'deleteSchool']);
    Route::post('/update-logo/{id}', [UserController::class, 'updateSchoolLogo']);
    Route::post('/update-principal-signature/{id}', [UserController::class, 'updatePrincipalSignature']);
  });

  Route::prefix('class')->group(function () {
    Route::post('/create', [UserController::class, 'createClass']);
    Route::put('/update/{id}', [UserController::class, 'updateClass']);
    Route::delete('/delete/{id}', [UserController::class, 'deleteClass']);
    Route::get('/getall/{school_id}', [UserController::class, 'getClassesBySchool']);
  });

  Route::prefix('subject')->group(function () {
    Route::post('/create/{school_id}', [UserController::class, 'createSubject']);
    Route::put('/update/{id}', [UserController::class, 'updateSubject']);
    Route::delete('/delete/{id}', [UserController::class, 'deleteSubject']);
    Route::get('/getall/{school_id}', [UserController::class, 'getAllSubjects']);
  });

  // Transport Management (New comprehensive system)
  Route::prefix('transport')->group(function () {
    // Statistics
    Route::get('/statistics/{school_id}', [\App\Http\Controllers\TransportController::class, 'getStatistics']);

    // Bus Management
    Route::get('/buses/all/{school_id}', [\App\Http\Controllers\TransportController::class, 'getAllBuses']);
    Route::get('/buses/{bus_id}', [\App\Http\Controllers\TransportController::class, 'getBus']);
    Route::post('/buses/create', [\App\Http\Controllers\TransportController::class, 'createBus']);
    Route::put('/buses/update/{bus_id}', [\App\Http\Controllers\TransportController::class, 'updateBus']);
    Route::delete('/buses/delete/{bus_id}', [\App\Http\Controllers\TransportController::class, 'deleteBus']);

    // Student Transport Assignments
    Route::get('/assignments/all/{school_id}', [\App\Http\Controllers\TransportController::class, 'getAssignments']);
    Route::get('/assignments/bus/{bus_id}', [\App\Http\Controllers\TransportController::class, 'getStudentsOnBus']);
    Route::post('/assignments/create', [\App\Http\Controllers\TransportController::class, 'assignStudent']);
    Route::put('/assignments/update/{assignment_id}', [\App\Http\Controllers\TransportController::class, 'updateAssignment']);
    Route::delete('/assignments/delete/{assignment_id}', [\App\Http\Controllers\TransportController::class, 'removeAssignment']);
  });

  // Legacy School Busses Management (keep for backward compatibility)
  Route::prefix('bus')->group(function () {
    Route::post('/create/{school_id}', [UserController::class, 'createSchoolBus']);
    Route::get('/get/{bus_id}', [UserController::class, 'getSchoolBus']);
    Route::get('/getall/{school_id}', [UserController::class, 'getAllSchoolBuses']);
    Route::put('/update/{bus_id}', [UserController::class, 'updateSchoolBus']);
    Route::delete('/delete/{bus_id}', [UserController::class, 'deleteSchoolBus']);
  });

  // School Facilities Management
  Route::prefix('school-facilities')->group(function () {
    Route::post('/create/{school_id}', [UserController::class, 'createSchoolFacility']);
    Route::get('/getall/{school_id}', [UserController::class, 'getSchoolFacilities']);
    Route::put('/update/{facility_id}', [UserController::class, 'updateSchoolFacility']);
    Route::delete('/delete/{facility_id}', [UserController::class, 'deleteSchoolFacility']);
  });

  // School Achievements Management
  Route::prefix('school-achievements')->group(function () {
    Route::post('/create/{school_id}', [UserController::class, 'createSchoolAchievement']);
    Route::get('/getall/{school_id}', [UserController::class, 'getSchoolAchievements']);
    Route::put('/update/{achievement_id}', [UserController::class, 'updateSchoolAchievement']);
    Route::delete('/delete/{achievement_id}', [UserController::class, 'deleteSchoolAchievement']);
  });

  // School Timings Management
  Route::prefix('school-timings')->group(function () {
    Route::post('/create/{school_id}', [UserController::class, 'createSchoolTiming']);
    Route::get('/getall/{school_id}', [UserController::class, 'getSchoolTimings']);
    Route::put('/update/{timing_id}', [UserController::class, 'updateSchoolTiming']);
    Route::delete('/delete/{timing_id}', [UserController::class, 'deleteSchoolTiming']);
    Route::post('/bulk-update/{school_id}', [UserController::class, 'updateSchoolTimingsBulk']);
  });


  // Student registration & management
  Route::prefix('student')->group(function () {
    Route::post('/register-student/{school_id}', [UserController::class, 'registerStudentDetails']);
    Route::post('/register-parent/{school_id}', [UserController::class, 'registerParentDetails']);
    Route::put('/update-student/{id}/{school_id}', [UserController::class, 'updateStudentDetails']);
    Route::get('/getstudents/{school_id}', [UserController::class, 'getStudentDetails']);
    Route::get('/getstudentmoredetails/{student_details_id}', [UserController::class, 'getStudentMoreDetails']);
  });

  Route::prefix('parent')->group(function () {
    Route::get('/', [UserController::class, 'getParentDetails']);
  });



  // Class timetable management
  Route::prefix('class-timetable')->group(function () {
    Route::post('/create', [UserController::class, 'createClassTimeTable']);
    Route::put('/update/{id}', [UserController::class, 'updateClassTimeTable']);
    Route::get('/get/{school_id}', [UserController::class, 'getClassTeacherTimeTable']);
    Route::get('/get-all-day/{school_id}/{teacher_id}', [UserController::class, 'getAllDayClassTimeTable']);
    Route::get('/get-by-class/{school_id}/{class_id}', [UserController::class, 'getTimetableByClass']);
    Route::delete('/delete/{id}', [UserController::class, 'deleteClassTimeTable']);
  });

  // Teacher registration & management
  Route::prefix('teacher')->group(function () {
    Route::post('/register/{school_id}', [UserController::class, 'createTeacher']);
    Route::put('/update/{id}/{school_id}', [UserController::class, 'updateTeacher']);
    Route::get('/getall/{school_id}', [UserController::class, 'getAllTeachers']);
    Route::delete('/delete/{id}', [UserController::class, 'deleteTeacher']);
    Route::get('/get/{id}', [UserController::class, 'getTeacherMoreDetails']);
    // NOTE: Teacher attendance routes have been moved to /api/principal/attendance/teachers
    // Old legacy routes removed - use AttendanceController endpoints instead
  });

  // ==================== ATTENDANCE ROUTES (PRINCIPAL) ====================
  Route::prefix('attendance')->group(function () {
    // Mark teacher attendance (by principal)
    Route::post('/teachers', [AttendanceController::class, 'markTeacherAttendance']);

    // Get today's teacher attendance
    Route::get('/teachers/today', [AttendanceController::class, 'getTodayTeacherAttendance']);

    // Get teacher attendance records with filtering
    Route::get('/teachers/records', [AttendanceController::class, 'getTeacherAttendanceRecords']);

    // Get class-wise student attendance analysis
    Route::get('/students/class/{class_id}', [AttendanceController::class, 'getClassWiseStudentAttendance']);

    // Get individual student attendance analysis
    Route::get('/students/{student_details_id}', [AttendanceController::class, 'getStudentIndividualAttendance']);

    // Get attendance analytics (students and teachers)
    Route::get('/analytics', [AttendanceController::class, 'getAttendanceAnalytics']);

    // Get streaks (for teachers and students)
    Route::get('/streaks/{userId}/{userType}', [AttendanceController::class, 'getStreaks']);
  });

  // User registration & management
  Route::prefix('user')->group(function () {
    Route::post('/register/{school_id}', [UserController::class, 'registerUser']);
    Route::patch('/toggle-status/{userId}', [UserController::class, 'toggleUserStatus']);
    Route::put('/update/{userId}', [UserController::class, 'updateUser']);
    Route::get('/getall/{school_id}', [UserController::class, 'getAllUsers']);
  });

  // ---------------------- 💰 Fee Structure Management ----------------------
  Route::prefix('fee-structure')->group(function () {
    Route::post('/store/{school_id}', [UserController::class, 'storeFeeStructure']);
    Route::get('/getall/{school_id}', [UserController::class, 'getAllFeeStructure']);
    Route::put('/update/{id}/{school_id}', [UserController::class, 'updateFeeStructure']);
    Route::delete('/delete/{id}', [UserController::class, 'deleteFeeStructure']);
  });

  // ---------------------- 💰 Service Charge Management ----------------------
  Route::prefix('service-charge')->group(function () {
    Route::post('/create/{school_id}', [UserController::class, 'createServiceCharge']);
    Route::get('/getall/{school_id}', [UserController::class, 'getAllServiceCharge']);
    Route::put('/update/{id}', [UserController::class, 'updateServiceCharges']);
    Route::delete('/delete/{id}', [UserController::class, 'deleteServiceCharges']);
  });

  // ---------------------- 🧾 Student Service Subscription ----------------------
  Route::put('/student-service/{student_details_id}', [UserController::class, 'updateStudentService']);
  Route::get('/student-services/{school_id}', [UserController::class, 'getStudentDetailsServices']);

  // ---------------------- ⚙️ System Commands ----------------------
  Route::post('/generate-monthly-dues/{school_id}', [UserController::class, 'runGenerateMonthlyPaymentsCommand']);

  // ---------------------- 💳 Monthly Payment Records ----------------------

  Route::get('/monthly-payments/{school_id}', [UserController::class, 'getAllMontlyPaymentsRecords']);
  Route::put('/monthly-payments/update/{studentDetailsId}/{school_id}', [UserController::class, 'updateMonthlyPaymentManually']);


  // ---------------------- 📝 Exam Management ----------------------
  Route::prefix('exam')->group(function () {
    Route::get('/all/{school_id}', [\App\Http\Controllers\ExamController::class, 'getAllExams']);
    Route::get('/{id}', [\App\Http\Controllers\ExamController::class, 'getExam']);
    Route::post('/create', [\App\Http\Controllers\ExamController::class, 'createExam']);
    Route::put('/update/{id}', [\App\Http\Controllers\ExamController::class, 'updateExam']);
    Route::delete('/delete/{id}', [\App\Http\Controllers\ExamController::class, 'deleteExam']);

    // Exam Schedules
    Route::post('/schedule/create', [\App\Http\Controllers\ExamController::class, 'createSchedule']);
    Route::post('/schedules/bulk-create', [\App\Http\Controllers\ExamController::class, 'bulkCreateSchedules']);
    Route::put('/schedules/bulk-update', [\App\Http\Controllers\ExamController::class, 'bulkUpdateSchedules']);
    Route::get('/schedules/{exam_id}', [\App\Http\Controllers\ExamController::class, 'getSchedules']);
    Route::get('/schedule/{schedule_id}/students', [\App\Http\Controllers\ExamController::class, 'getScheduleStudents']);
    Route::put('/schedule/update/{id}', [\App\Http\Controllers\ExamController::class, 'updateSchedule']);
    Route::delete('/schedule/delete/{id}', [\App\Http\Controllers\ExamController::class, 'deleteSchedule']);

    // Marks Entry
    Route::post('/marks/enter', [\App\Http\Controllers\ExamController::class, 'enterMarks']);
    Route::post('/marks/schedule/{schedule_id}/bulk-enter', [\App\Http\Controllers\ExamController::class, 'bulkEnterMarksForSchedule']);
    Route::post('/marks/bulk-enter', [\App\Http\Controllers\ExamController::class, 'bulkEnterMarks']);
    Route::post('/marks/student-wise', [\App\Http\Controllers\ExamController::class, 'studentWiseMarksEntry']);
    Route::post('/marks/csv-import', [\App\Http\Controllers\ExamController::class, 'csvImportMarks']);
    Route::get('/marks/schedule/{exam_schedule_id}', [\App\Http\Controllers\ExamController::class, 'getScheduleMarks']);
    Route::get('/marks/student/{student_id}/{school_id}', [\App\Http\Controllers\ExamController::class, 'getStudentMarks']);

    // Helper endpoints for marks entry
    Route::get('/{exam_id}/class/{class_id}/students', [\App\Http\Controllers\ExamController::class, 'getExamClassStudents']);
    Route::get('/{exam_id}/class/{class_id}/student/{student_id}/schedules', [\App\Http\Controllers\ExamController::class, 'getStudentSchedules']);
    Route::get('/{exam_id}/csv-template', [\App\Http\Controllers\ExamController::class, 'downloadCsvTemplate']);

    // Reports
    Route::get('/report/student/{student_id}/{exam_id}', [\App\Http\Controllers\ExamController::class, 'getStudentReport']);
    Route::get('/report/card/{exam_id}/{student_id}', [\App\Http\Controllers\ExamController::class, 'generateReportCard']);

    // Statistics and Results
    Route::get('/stats/{school_id}', [\App\Http\Controllers\ExamController::class, 'getExamStats']);
    Route::get('/results/students/{school_id}', [\App\Http\Controllers\ExamController::class, 'getStudentResults']);
    Route::get('/results/exams/{school_id}', [\App\Http\Controllers\ExamController::class, 'getExamResults']);
  });

  // Additional endpoints for exam management
  Route::get('/subjects/{school_id}', [\App\Http\Controllers\ExamController::class, 'getSubjects']);
  Route::get('/classes/{school_id}', [\App\Http\Controllers\ExamController::class, 'getClasses']);

  // Get Students
  Route::get('/getstudents/{school_id}', [UserController::class, 'getStudentDetails']);

  // ---------------------- 📚 Library Management ----------------------
  Route::prefix('library')->group(function () {
    // Books
    Route::get('/books/all/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getAllBooks']);
    Route::get('/books/available/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getAvailableBooks']);
    Route::get('/books/search/{school_id}', [\App\Http\Controllers\LibraryController::class, 'searchBooks']);
    Route::get('/books/{id}', [\App\Http\Controllers\LibraryController::class, 'getBook']);
    Route::post('/books/create', [\App\Http\Controllers\LibraryController::class, 'createBook']);
    Route::put('/books/update/{id}', [\App\Http\Controllers\LibraryController::class, 'updateBook']);
    Route::delete('/books/delete/{id}', [\App\Http\Controllers\LibraryController::class, 'deleteBook']);
    Route::get('/categories/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getCategories']);

    // Book Issues
    Route::post('/issue', [\App\Http\Controllers\LibraryController::class, 'issueBook']);
    Route::post('/return/{issue_id}', [\App\Http\Controllers\LibraryController::class, 'returnBook']);
    Route::get('/issues/all/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getAllIssues']);
    Route::get('/issues/active/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getActiveIssues']);
    Route::get('/issues/overdue/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getOverdueIssues']);
    Route::get('/issues/borrower', [\App\Http\Controllers\LibraryController::class, 'getBorrowerIssues']);
    // Digital Resources
    Route::get('/digital-resources/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getDigitalResources']);
    Route::post('/digital-resources/create', [\App\Http\Controllers\LibraryController::class, 'createDigitalResource']);
    Route::delete('/digital-resources/delete/{id}', [\App\Http\Controllers\LibraryController::class, 'deleteDigitalResource']);
  });

  // ---------------------- 🏨 Hostel Management ----------------------
  Route::prefix('hostel')->group(function () {
    // Statistics
    Route::get('/statistics/{school_id}', [\App\Http\Controllers\HostelController::class, 'getStatistics']);
    Route::post('/sync-fees/{school_id}', [\App\Http\Controllers\HostelController::class, 'syncHostelFees']);

    // Buildings
    Route::get('/buildings/all/{school_id}', [\App\Http\Controllers\HostelController::class, 'getAllBuildings']);
    Route::get('/buildings/{id}', [\App\Http\Controllers\HostelController::class, 'getBuilding']);
    Route::post('/buildings/create', [\App\Http\Controllers\HostelController::class, 'createBuilding']);
    Route::put('/buildings/update/{id}', [\App\Http\Controllers\HostelController::class, 'updateBuilding']);
    Route::delete('/buildings/delete/{id}', [\App\Http\Controllers\HostelController::class, 'deleteBuilding']);

    // Rooms
    Route::get('/rooms/all/{school_id}', [\App\Http\Controllers\HostelController::class, 'getAllRooms']);
    Route::get('/rooms/available/{school_id}', [\App\Http\Controllers\HostelController::class, 'getAvailableRooms']);
    Route::get('/rooms/{id}', [\App\Http\Controllers\HostelController::class, 'getRoom']);
    Route::post('/rooms/create', [\App\Http\Controllers\HostelController::class, 'createRoom']);
    Route::put('/rooms/update/{id}', [\App\Http\Controllers\HostelController::class, 'updateRoom']);
    Route::delete('/rooms/delete/{id}', [\App\Http\Controllers\HostelController::class, 'deleteRoom']);

    // Allocations
    Route::get('/allocations/all/{school_id}', [\App\Http\Controllers\HostelController::class, 'getAllAllocations']);
    Route::get('/allocations/student/{student_id}', [\App\Http\Controllers\HostelController::class, 'getStudentAllocation']);
    Route::post('/allocations/allocate', [\App\Http\Controllers\HostelController::class, 'allocateRoom']);
    Route::post('/allocations/vacate/{allocation_id}', [\App\Http\Controllers\HostelController::class, 'vacateRoom']);
    Route::post('/allocations/transfer/{allocation_id}', [\App\Http\Controllers\HostelController::class, 'transferRoom']);
  });

  // ---------------------- 👨‍🏫 Warden Management (Principal) ----------------------
  Route::prefix('wardens')->group(function () {
    Route::get('/', [\App\Http\Controllers\WardenController::class, 'index']);
    Route::get('/paginated', [\App\Http\Controllers\WardenController::class, 'paginated']);
    Route::get('/unassigned', [\App\Http\Controllers\WardenController::class, 'getUnassigned']);
    Route::get('/{id}', [\App\Http\Controllers\WardenController::class, 'show']);
    Route::post('/create', [\App\Http\Controllers\WardenController::class, 'store']);
    Route::put('/update/{id}', [\App\Http\Controllers\WardenController::class, 'update']);
    Route::delete('/delete/{id}', [\App\Http\Controllers\WardenController::class, 'destroy']);
    Route::patch('/toggle-status/{id}', [\App\Http\Controllers\WardenController::class, 'toggleStatus']);
    Route::post('/reset-password/{id}', [\App\Http\Controllers\WardenController::class, 'resetPassword']);
  });

  // ---------------------- 🍽️ Mess/Canteen Management (Principal) ----------------------
  Route::prefix('mess')->group(function () {
    Route::get('/menus/{school_id}', [\App\Http\Controllers\MessController::class, 'getMenus']);
    Route::post('/menus/create', [\App\Http\Controllers\MessController::class, 'createMenu']);
    Route::put('/menus/update/{id}', [\App\Http\Controllers\MessController::class, 'updateMenu']);
    Route::delete('/menus/delete/{id}', [\App\Http\Controllers\MessController::class, 'deleteMenu']);
    Route::get('/bookings/{school_id}', [\App\Http\Controllers\MessController::class, 'getBookings']);
    Route::post('/bookings/create', [\App\Http\Controllers\MessController::class, 'createBooking']);
    Route::put('/bookings/update-status/{id}', [\App\Http\Controllers\MessController::class, 'updateBookingStatus']);
  });

  // ---------------------- 📢 Notice/Communication Management ----------------------
  Route::prefix('notice')->group(function () {
    Route::get('/all/{school_id}', [\App\Http\Controllers\NoticeController::class, 'getAllNotices']);
    Route::get('/active/{school_id}', [\App\Http\Controllers\NoticeController::class, 'getActiveNotices']);
    Route::get('/my/{school_id}', [\App\Http\Controllers\NoticeController::class, 'getMyNotices']);
    Route::get('/unread/{school_id}', [\App\Http\Controllers\NoticeController::class, 'getUnreadNotices']);
    Route::post('/create', [\App\Http\Controllers\NoticeController::class, 'createNotice']);
    Route::put('/update/{id}', [\App\Http\Controllers\NoticeController::class, 'updateNotice']);
    Route::delete('/delete/{id}', [\App\Http\Controllers\NoticeController::class, 'deleteNotice']);
    Route::post('/mark-read/{id}', [\App\Http\Controllers\NoticeController::class, 'markAsRead']);
    Route::post('/toggle-active/{id}', [\App\Http\Controllers\NoticeController::class, 'toggleActive']);
    Route::get('/read-count/{id}', [\App\Http\Controllers\NoticeController::class, 'getReadCount']);
    // Generic route last (catch-all must be at the end)
    Route::get('/{id}', [\App\Http\Controllers\NoticeController::class, 'getNotice']);
  });

  // ---------------------- 📚 Syllabus Completion Management ----------------------
  Route::prefix('syllabus')->group(function () {
    Route::get('/overview', [SyllabusCompletionController::class, 'getOverview']);
    Route::get('/detailed', [SyllabusCompletionController::class, 'getDetailedView']);
    Route::get('/teacher/{teacher_id}', [SyllabusCompletionController::class, 'getTeacherCompletionForPrincipal']);
  });

  // ---------------------- 💬 Messaging/Chat Management ----------------------
  Route::prefix('messaging')->group(function () {
    Route::post('/group/create', [MessagingController::class, 'createCustomGroup']);
    Route::post('/group/{group_id}/add-members', [MessagingController::class, 'addMembers']);
    Route::post('/group/send', [MessagingController::class, 'sendDiaryMessage']);
    Route::post('/personal/send', [MessagingController::class, 'sendPersonal']);
    Route::get('/group/{room_id}/history', [MessagingController::class, 'groupHistory']);
    Route::get('/personal/history', [MessagingController::class, 'personalHistory']);
  });
});

// ==================== TEACHER ROUTES ====================
Route::prefix('teacher')->middleware('jwt.auth')->group(function () {
  // Get teacher profile details
  Route::get('/get/{id}', [TeacherController::class, 'getTeacherProfile']);

  // Update teacher profile
  Route::put('/update-profile/{id}', [TeacherController::class, 'updateTeacherProfile']);

  // Update teacher password
  Route::put('/update-password/{id}', [TeacherController::class, 'updateTeacherPassword']);

  // Get details of a specific class handled by the teacher
  Route::get('/class-details/{teacher_id}/{school_id}/{class_id}', [TeacherController::class, 'getTeacherClassDetails']);

  // Get list of students for a class + section
  Route::post('/student-details', [TeacherController::class, 'getStudentDetailsList']);

  // Update student attendance for a specific date
  Route::post('/attendance/update', [TeacherController::class, 'updateAttendance']);

  // Get all classes assigned to a specific teacher
  Route::get('/assigned-classes/{teacher_id}/{school_id}', [TeacherController::class, 'getTeacherAssignedClasses']);

  // Get teacher's full week timetable
  Route::get('/weekly-timetable/{teacher_id}/{school_id}', [TeacherController::class, 'getWeeklyTimetable']);

  // Get today's classes for a teacher
  Route::get('/today-classes/{teacher_id}/{school_id}', [TeacherController::class, 'getTodayClasses']);

  // Get teacher dashboard statistics
  Route::get('/dashboard-stats/{teacher_id}/{school_id}', [TeacherController::class, 'getDashboardStats']);

  // Syllabus completion routes
  Route::get('/syllabus/completion', [SyllabusCompletionController::class, 'getTeacherCompletion']);
  Route::get('/syllabus/completion/{class_id}/{subject_id}', [SyllabusCompletionController::class, 'getCompletion']);
  Route::post('/syllabus/completion', [SyllabusCompletionController::class, 'updateCompletion']);
  Route::get('/syllabus/history/{class_id}/{subject_id}', [SyllabusCompletionController::class, 'getHistory']);

  // ==================== ATTENDANCE ROUTES (TEACHER) ====================
  Route::prefix('attendance')->group(function () {
    // Mark student attendance (Quick, Period-wise, or Class-wise)
    Route::post('/students', [AttendanceController::class, 'markStudentAttendance']);

    // Bulk mark all students
    Route::post('/bulk-mark', [AttendanceController::class, 'bulkMarkAttendance']);

    // QR Code Attendance
    Route::post('/qr-session/create', [AttendanceController::class, 'createQRSession']);
    Route::get('/qr-session/{sessionId}/status', [AttendanceController::class, 'getQRSessionStatus']);

    // Get attendance records with filtering
    Route::get('/records', [AttendanceController::class, 'getAttendanceRecords']);

    // Get today's attendance records grouped by class
    Route::get('/today-by-class', [AttendanceController::class, 'getTodayAttendanceByClass']);

    // Get attendance analytics
    Route::get('/analytics', [AttendanceController::class, 'getAttendanceAnalytics']);

    // Get streaks (for students)
    Route::get('/streaks/{userId}/{userType}', [AttendanceController::class, 'getStreaks']);
  });
});

// ==================== WARDEN ROUTES ====================
Route::prefix('warden')->middleware(['jwt.auth', 'subscription'])->group(function () {
  // Warden Dashboard
  Route::get('/dashboard/{school_id}', [\App\Http\Controllers\WardenController::class, 'getDashboard']);
  
  // Warden Hostel Management (their assigned building only)
  Route::prefix('hostel')->group(function () {
    Route::get('/building', [\App\Http\Controllers\HostelController::class, 'getWardenBuilding']);
    Route::get('/rooms/all', [\App\Http\Controllers\HostelController::class, 'getWardenRooms']);
    Route::get('/allocations/all', [\App\Http\Controllers\HostelController::class, 'getWardenAllocations']);
  });
  
  // Warden Mess Management
  Route::prefix('mess')->group(function () {
    Route::get('/menus/{school_id}', [\App\Http\Controllers\MessController::class, 'getMenus']);
    Route::post('/menus/create', [\App\Http\Controllers\MessController::class, 'createMenu']);
    Route::put('/menus/update/{id}', [\App\Http\Controllers\MessController::class, 'updateMenu']);
    Route::delete('/menus/delete/{id}', [\App\Http\Controllers\MessController::class, 'deleteMenu']);
    Route::get('/bookings/{school_id}', [\App\Http\Controllers\MessController::class, 'getBookings']);
    Route::post('/bookings/create', [\App\Http\Controllers\MessController::class, 'createBooking']);
    Route::put('/bookings/update-status/{id}', [\App\Http\Controllers\MessController::class, 'updateBookingStatus']);
  });
});

// ==================== LIBRARIAN ROUTES ====================
// Librarian routes require BOTH authentication AND active subscription
Route::prefix('librarian')->middleware(['jwt.auth', 'subscription'])->group(function () {
  // Dashboard & Statistics
  Route::get('/dashboard/{school_id}', [UserController::class, 'getPrincipalDashboard']); // Reuse principal dashboard or create librarian-specific

  // Profile Management
  Route::prefix('profile')->group(function () {
    Route::put('/update', [UserController::class, 'updateLibrarianProfile']);
    Route::put('/change-password', [UserController::class, 'changeLibrarianPassword']);
  });

  // Library Statistics
  Route::get('/library/statistics/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getStatistics']);

  // ---------------------- 📚 Library Management ----------------------
  Route::prefix('library')->group(function () {
    // Books
    Route::get('/books/all/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getAllBooks']);
    Route::get('/books/available/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getAvailableBooks']);
    Route::get('/books/search/{school_id}', [\App\Http\Controllers\LibraryController::class, 'searchBooks']);
    Route::get('/books/{id}', [\App\Http\Controllers\LibraryController::class, 'getBook']);
    Route::post('/books/create', [\App\Http\Controllers\LibraryController::class, 'createBook']);
    Route::put('/books/update/{id}', [\App\Http\Controllers\LibraryController::class, 'updateBook']);
    Route::delete('/books/delete/{id}', [\App\Http\Controllers\LibraryController::class, 'deleteBook']);
    Route::get('/categories/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getCategories']);

    // Book Issues
    Route::post('/issue', [\App\Http\Controllers\LibraryController::class, 'issueBook']);
    Route::post('/return/{issue_id}', [\App\Http\Controllers\LibraryController::class, 'returnBook']);
    Route::get('/issues/all/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getAllIssues']);
    Route::get('/issues/active/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getActiveIssues']);
    Route::get('/issues/overdue/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getOverdueIssues']);
    Route::get('/issues/borrower', [\App\Http\Controllers\LibraryController::class, 'getBorrowerIssues']);
    Route::post('/issues/extend/{issue_id}', [\App\Http\Controllers\LibraryController::class, 'extendDueDate']);
  });
});

// Also add shared library routes accessible by both principal and librarian (outside principal prefix)
Route::prefix('library')->middleware(['jwt.auth', 'subscription'])->group(function () {
  // Books
  Route::get('/books/all/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getAllBooks']);
  Route::get('/books/available/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getAvailableBooks']);
  Route::get('/books/search/{school_id}', [\App\Http\Controllers\LibraryController::class, 'searchBooks']);
  Route::get('/books/{id}', [\App\Http\Controllers\LibraryController::class, 'getBook']);
  Route::post('/books/create', [\App\Http\Controllers\LibraryController::class, 'createBook']);
  Route::put('/books/update/{id}', [\App\Http\Controllers\LibraryController::class, 'updateBook']);
  Route::delete('/books/delete/{id}', [\App\Http\Controllers\LibraryController::class, 'deleteBook']);
  Route::get('/categories/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getCategories']);

  // Book Issues
  Route::post('/issue', [\App\Http\Controllers\LibraryController::class, 'issueBook']);
  Route::post('/return/{issue_id}', [\App\Http\Controllers\LibraryController::class, 'returnBook']);
  Route::get('/issues/all/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getAllIssues']);
  Route::get('/issues/active/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getActiveIssues']);
  Route::get('/issues/overdue/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getOverdueIssues']);
  Route::get('/issues/borrower', [\App\Http\Controllers\LibraryController::class, 'getBorrowerIssues']);
  Route::post('/issues/extend/{issue_id}', [\App\Http\Controllers\LibraryController::class, 'extendDueDate']);

  // Statistics
  Route::get('/statistics/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getStatistics']);

  // Digital Resources
  Route::get('/digital-resources/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getDigitalResources']);
  Route::post('/digital-resources/create', [\App\Http\Controllers\LibraryController::class, 'createDigitalResource']);
  Route::delete('/digital-resources/delete/{id}', [\App\Http\Controllers\LibraryController::class, 'deleteDigitalResource']);
});

// ==================== STUDENT ROUTES ====================
Route::prefix('student')->middleware('jwt.auth')->group(function () {
  // Student dashboard
  Route::get('/dashboard/{student_id}', [\App\Http\Controllers\StudentDashboardController::class, 'getDashboard']);
  Route::get('/info/{student_id}', [\App\Http\Controllers\StudentDashboardController::class, 'getStudentInfo']);
  Route::get('/today-classes/{student_id}', [\App\Http\Controllers\StudentDashboardController::class, 'getTodayClasses']);
  Route::get('/syllabus-progress/{student_id}', [\App\Http\Controllers\StudentDashboardController::class, 'getSyllabusProgress']);

  // Student profile management
  Route::get('/profile/{student_id}', [\App\Http\Controllers\StudentProfileController::class, 'getProfile']);
  Route::put('/profile/{student_id}', [\App\Http\Controllers\StudentProfileController::class, 'updateProfile']);
  Route::put('/password/{student_id}', [\App\Http\Controllers\StudentProfileController::class, 'updatePassword']);

  // Student exam management
  Route::prefix('exams')->group(function () {
    Route::get('/{student_id}/{school_id}', [\App\Http\Controllers\StudentExamController::class, 'getStudentExams']);
    Route::get('/schedules/{student_id}/{exam_id}', [\App\Http\Controllers\StudentExamController::class, 'getStudentExamSchedules']);
    Route::get('/marks/{student_id}/{school_id}', [\App\Http\Controllers\StudentExamController::class, 'getStudentMarks']);
    Route::get('/report-card/{student_id}/{exam_id}', [\App\Http\Controllers\StudentExamController::class, 'getStudentReportCard']);
  });

  // Student Library
  Route::prefix('library')->group(function () {
    Route::get('/books/all/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getAllBooks']);
    Route::get('/issues/borrower', [\App\Http\Controllers\LibraryController::class, 'getBorrowerIssues']);
    Route::get('/digital-resources/{school_id}', [\App\Http\Controllers\LibraryController::class, 'getDigitalResources']);
  });
});

