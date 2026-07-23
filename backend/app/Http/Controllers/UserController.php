<?php

namespace App\Http\Controllers;

use App\Models\MonthlyPayment;
use App\Models\MonthlyPayments;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use App\Services\EmailService;
use App\Services\UserService;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use App\Rules\UniqueUsername;

class UserController extends Controller
{
    protected UserService $userService;
    protected EmailService $emailService;

    public function __construct(UserService $userService, EmailService $emailService)
    {
        $this->userService = $userService;
        $this->emailService = $emailService;
    }

    /**
     * Helper to decide HTTP code from service response
     */
    protected function httpCodeFromServiceResult(array $res, bool $isCreate = false): int
    {
        if (!empty($res['status'])) {
            return $isCreate ? 201 : 200;
        }

        $msg = strtolower($res['message'] ?? '');
        if (str_contains($msg, 'not found')) {
            return 404;
        }

        return 400;
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
            $verification = \App\Helpers\JWTHelper::verifyToken($token);

            if (!$verification['success']) {
                return null;
            }

            $payload = $verification['data'];
            $userId = $payload->user_id ?? null;

            if (!$userId) {
                return null;
            }

            return User::find($userId);
        } catch (Exception $e) {
            Log::error('Error getting authenticated user: ' . $e->getMessage());
            return null;
        }
    }

    public function getStats(Request $request, $school_id)
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);

            // For administrators, verify school ownership
            if ($authUser && $authUser->role === 'administrator') {
                $school = \App\Models\School::find($school_id);
                if (!$school || $school->administrator_id != $authUser->id) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Unauthorized. You can only view stats for your own schools.',
                        'data' => null,
                        'error' => null,
                    ], 403);
                }
            }

            $res = $this->userService->getStats($school_id);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
        } catch (Exception $e) {
            Log::error("Error fetching stats for school_id {$school_id}: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch statistics.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getPrincipalDashboard(Request $request, $school_id)
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);

            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized.',
                    'data' => null,
                ], 401);
            }

            // Get comprehensive dashboard statistics
            $stats = $this->userService->getPrincipalDashboardStats($school_id);

            // Get recent activities
            $recentActivities = $this->userService->getRecentActivities($school_id);

            return response()->json([
                'status' => true,
                'message' => 'Dashboard data retrieved successfully.',
                'data' => [
                    'stats' => $stats,
                    'recent_activities' => $recentActivities,
                ],
            ], 200);

        } catch (Exception $e) {
            Log::error("Error fetching dashboard for school_id {$school_id}: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch dashboard data.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ============================================================
    // ===============  STUDENT MANAGEMENT  =======================
    // ============================================================


    public function registerStudentDetails(Request $request, $school_id)
    {
        try {
            // ✅ Step 1: Validate input
            $validated = $request->validate([
                'school_id' => 'required|integer|exists:schools,id',
                'candidate_name' => ['required', 'string', 'max:100', new UniqueUsername()],
                'gender' => 'required|string|max:10',
                'addhar' => 'nullable|string|max:20|unique:student_details,addhar',
                'dob' => 'required|date',

                // 🔹 class selection is mandatory
                'class' => 'required|array',
                'class.id' => 'required|integer|exists:school_class,id',
                'class.class' => 'required|string|max:30',
                'class.section' => 'nullable|string|max:30',

                'roll_no' => 'nullable|string|max:10',
                'email' => 'required|email|unique:student_details,email',
                'parent_email' => 'required|email|unique:parents,email',
                'father_name' => 'required|string|max:100',
                'mother_name' => 'required|string|max:100',
                'phone' => 'required|string|max:15',
                'address' => 'required|string|max:255',
            ]);

            // ✅ Step 2: Wrap entire registration in a transaction
            return DB::transaction(function () use ($validated, $school_id) {
                // --- Step 2.1: Create student login credentials ---
                $createCred = $this->userService->createStudentLoginCredential($validated, $school_id);
                $studentCreateCode = $this->httpCodeFromServiceResult($createCred, true);

                if (empty($createCred['status']) || empty($createCred['data'])) {
                    // ❌ stop transaction if user creation failed
                    throw new Exception($createCred['message'] ?? 'Failed to create student login credentials.');
                }

                $student = $createCred['data'];

                // --- Step 2.2: Register student details ---
                $registerStudentDetails = $this->userService->registerStudentDetails($validated, $student->id, $school_id);
                $registerCode = $this->httpCodeFromServiceResult($registerStudentDetails, true);

                if (empty($registerStudentDetails['status']) || empty($registerStudentDetails['data'])) {
                    // ❌ Throw exception to trigger rollback
                    throw new Exception($registerStudentDetails['message'] ?? 'Failed to register student details.');
                }


                // Send welcome email (outside transaction)
                $message = <<<EOT
Dear {$validated['candidate_name']},

🎉 Welcome to Eklavya School!

Your registration has been successfully completed.

Here are your login credentials:

📧 Email: {$student->email}
🔑 Password: {$createCred['data']->plain_password}  (Please change after first login)

Best Regards,
Eklavya School
EOT;

                try {
                    Mail::raw($message, function ($mail) use ($student) {
                        $mail->to($student->email)
                            ->subject('Welcome to Eklavya School – Login Credentials');
                    });
                } catch (TransportExceptionInterface $e) {
                    // Mail failed — student is created, but inform caller and log details
                    Log::error("Email sending failed for student (id={$student->id}, email={$student->email}): " . $e->getMessage());

                    // Attach plain password for immediate response (as your previous code did)
                    $student->plain_password = $createCred['data']->plain_password;

                    return [
                        'status' => false,
                        'message' => 'Student created but failed to send email with credentials.',
                        'data' => $student,
                        'error' => $e->getMessage(),
                    ];
                }

                // ✅ Step 2.3: Commit transaction automatically
                return response()->json([
                    'status' => true,
                    'message' => 'Student registered successfully.',
                    'data' => [
                        'student' => $registerStudentDetails['data'],
                    ],
                    'error' => null,
                ], 201);
            });
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            // ✅ rollback automatically happens when inside DB::transaction
            Log::error("Student registration failed", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Registration failed.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getParentDetails(Request $request)
    {
        $validated = $request->validate([
            'school_id' => 'required|integer',
            'email' => 'sometimes|string',
            'phone' => 'sometimes|string',
        ]);
        try {
            $res = $this->userService->getParentDetails($validated);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
        } catch (Exception $e) {
            Log::error("Error fetching parent details: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch parent details.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function registerParentDetails(Request $request, $school_id)
    {
        try {
            $validated = $request->validate([
                'school_id' => 'required',
                'student_id' => 'required|integer|exists:students,id',
                'father_name' => 'required|string|max:100',
                'mother_name' => 'required|string|max:100',
                'guardian_name' => 'nullable|string|max:100',
                'email' => 'required|email|unique:parents,email',
                'phone' => 'required|string|max:15',
                'address' => 'required|string|max:255',
                'relation' => 'nullable|string|max:50',
            ]);

            $res = $this->userService->registerParentDetails($validated, $school_id);
            $code = $this->httpCodeFromServiceResult($res, true);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Registration failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Registration failed.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateStudentDetails(Request $request, $id, $school_id)
    {
        try {
            $validated = $request->validate([
                'school_id' => 'required',
                'candidate_name' => 'sometimes|nullable|string|max:100',
                'gender' => 'sometimes|nullable|string|max:10',
                'addhar' => 'sometimes|nullable|string|max:20|unique:student_details,addhar,' . $id,
                'dob' => 'sometimes|nullable|date',
                'class' => 'sometimes|nullable|array',
                'class.id' => 'required_with:class|integer|exists:school_class,id',
                'class.class' => 'required_with:class|string|max:30',
                'roll_no' => 'sometimes|nullable|string|max:10',
                'email' => 'sometimes|nullable|email|unique:student_details,email,' . $id,
                'father_name' => 'sometimes|nullable|string|max:100',
                'mother_name' => 'sometimes|nullable|string|max:100',
                'phone' => 'sometimes|nullable|string|max:15',
                'address' => 'sometimes|nullable|string|max:255',
                'admission_date' => 'sometimes|nullable|date',
            ]);

            $res = $this->userService->updateStudentDetails($id, $validated, $school_id);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Update failed.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getStudentDetails($school_id)
    {
        if (empty($school_id) || !is_numeric($school_id)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid or missing school ID.',
                'data' => null,
                'error' => null,
            ], 400);
        }

        try {
            $res = $this->userService->getAllStudentDetails($school_id);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
        } catch (Exception $e) {
            Log::error("Error fetching student details: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch student details.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    //Routing not done yet
    public function getStudentMoreDetails($student_details_id)
    {
        if (empty($student_details_id) || !is_numeric($student_details_id)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid or missing student details ID.',
                'data' => null,
                'error' => null,
            ], 400);
        }

        try {
            $res = $this->userService->getStudentMoreDetails($student_details_id);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
        } catch (Exception $e) {
            Log::error("Error fetching student more details: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch student more details.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    // ============================================================
    // ===============  USER MANAGEMENT  ==========================
    // ============================================================

    public function registerUser(Request $request, $school_id)
    {
        try {
            $request->merge(['school_id' => $school_id]); // ✅ include route param in request

            $validated = $request->validate([
                'school_id' => 'required|exists:schools,id',
                'full_name' => 'required|string|max:100',
                'username' => ['required', 'string', 'max:100', new UniqueUsername()],
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6|max:100',
                'phone' => 'nullable|string|max:100',
                'role' => 'required|in:administrator,accountant,principal,librarian'
            ]);

            $res = $this->userService->registerUser($validated, $school_id);
            $code = $this->httpCodeFromServiceResult($res, true);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Registration failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Registration failed.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateUser(Request $request, int $userId)
    {
        try {
            // Get the user to determine which table it belongs to
            $user = User::find($userId);

            $validated = $request->validate([
                'username' => ['sometimes', 'string', 'max:100', new UniqueUsername($userId, 'users')],
                'email' => 'sometimes|email|unique:users,email,' . $userId,
                'phone' => 'sometimes|string|max:100',
                'role' => 'sometimes|string|max:15'
            ]);

            $validated['id'] = $userId;

            $res = $this->userService->updateUser($validated);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update user failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update user.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateAdministratorProfile(Request $request)
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);

            if (!$authUser || $authUser->role !== 'administrator') {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Administrator access required.',
                    'data' => null,
                ], 403);
            }

            $validated = $request->validate([
                'full_name' => 'sometimes|string|max:100',
                'username' => ['sometimes', 'string', 'max:100', new UniqueUsername($authUser->id, 'users')],
                'email' => 'sometimes|email|unique:users,email,' . $authUser->id,
                'phone' => 'sometimes|string|max:100',
            ]);

            $validated['id'] = $authUser->id;

            // Allow self-update for administrators
            $res = $this->userService->updateUser($validated, true);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update administrator profile failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update profile.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function changeAdministratorPassword(Request $request)
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);

            if (!$authUser || $authUser->role !== 'administrator') {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Administrator access required.',
                    'data' => null,
                ], 403);
            }

            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            // Verify current password
            if (!password_verify($validated['current_password'], $authUser->password)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Current password is incorrect.',
                    'data' => null,
                ], 400);
            }

            // Update password
            $authUser->password = password_hash($validated['new_password'], PASSWORD_DEFAULT);
            $authUser->save();

            return response()->json([
                'status' => true,
                'message' => 'Password updated successfully.',
                'data' => null,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Change administrator password failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to change password.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateLibrarianProfile(Request $request)
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);

            if (!$authUser || $authUser->role !== 'librarian') {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Librarian access required.',
                    'data' => null,
                ], 403);
            }

            $validated = $request->validate([
                'full_name' => 'sometimes|string|max:100',
                'username' => ['sometimes', 'string', 'max:100', new UniqueUsername($authUser->id, 'users')],
                'email' => 'sometimes|email|unique:users,email,' . $authUser->id,
                'phone' => 'sometimes|string|max:100',
            ]);

            $validated['id'] = $authUser->id;

            // Allow self-update for administrators
            $res = $this->userService->updateUser($validated, true);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update librarian profile failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update profile.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function changeLibrarianPassword(Request $request)
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);

            if (!$authUser || $authUser->role !== 'librarian') {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Librarian access required.',
                    'data' => null,
                ], 403);
            }

            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            // Verify current password
            if (!password_verify($validated['current_password'], $authUser->password)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Current password is incorrect.',
                    'data' => null,
                ], 400);
            }

            // Update password
            $authUser->password = password_hash($validated['new_password'], PASSWORD_DEFAULT);
            $authUser->save();

            return response()->json([
                'status' => true,
                'message' => 'Password updated successfully.',
                'data' => null,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Change librarian password failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to change password.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function toggleUserStatus(int $userId)
    {
        try {
            $res = $this->userService->toggleUserStatus($userId);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
        } catch (Exception $e) {
            Log::error("Toggle user status failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to toggle user status.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    //Routing not done yet
    public function getAllUsers($school_id)
    {
        if (empty($school_id) || !is_numeric($school_id)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid or missing school ID.',
                'data' => null,
                'error' => null,
            ], 400);
        }

        try {
            $res = $this->userService->getAllUsers($school_id);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
        } catch (Exception $e) {
            Log::error("Error fetching users: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch users.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ============================================================
    // ===============  SCHOOL MANAGEMENT  ========================
    // ============================================================

    public function registerSchool(Request $request)
    {
        try {
            // Get authenticated administrator
            $authUser = $this->getAuthenticatedUser($request);
            if (!$authUser || $authUser->role !== 'administrator') {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Only administrators can register schools.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $validated = $request->validate([
                'user_id' => 'nullable|integer|exists:users,id',
                'name' => 'required|string|max:100|unique:schools,name',
                'email' => 'required|email|unique:schools,email',
                'phone' => 'required|string|max:15',
                'address' => 'required|string|max:255',
                'city' => 'required|string|max:50',
                'state' => 'required|string|max:50',
                'country' => 'required|string|max:50',
                'pincode' => 'required|string|max:10',
                'logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                'principal_sign_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                'principal_name' => 'nullable|string|max:100',
                'principal_phone' => 'nullable|string|max:15',
                'principal_email' => 'nullable|email',
                'affiliation_number' => 'nullable|string|max:100',
                'board' => 'nullable|string|max:50',
                'website' => 'nullable|url|max:255',
                'description' => 'nullable|string',
                'established_date' => 'nullable|date',
                'school_code' => 'nullable|string|max:50|unique:schools,school_code',
                'status' => 'nullable|string|in:active,inactive',
            ]);

            // Validate that administrator exists and is active
            $administrator = User::where('id', $authUser->id)
                ->where('role', 'administrator')
                ->where('status', 'active')
                ->first();

            if (!$administrator) {
                return response()->json([
                    'status' => false,
                    'message' => 'Administrator account is not active or not found.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            // Add administrator_id to the validated data
            $validated['administrator_id'] = $administrator->id;

            $res = $this->userService->registerSchool($validated);
            $code = $this->httpCodeFromServiceResult($res, true);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("School registration failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'School registration failed.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateSchool(Request $request, $id)
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->id : null;

            $validated = $request->validate([
                'user_id' => 'nullable|integer|exists:users,id',
                'name' => 'sometimes|string|max:100|unique:schools,name,' . $id,
                'email' => 'sometimes|email|unique:schools,email,' . $id,
                'phone' => 'sometimes|string|max:15',
                'address' => 'sometimes|string|max:255',
                'city' => 'sometimes|string|max:50',
                'state' => 'sometimes|string|max:50',
                'country' => 'sometimes|string|max:50',
                'pincode' => 'sometimes|string|max:10',
                'logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                'principal_sign_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                'principal_name' => 'sometimes|string|max:100',
                'principal_phone' => 'sometimes|string|max:15',
                'principal_email' => 'sometimes|email',
                'affiliation_number' => 'sometimes|string|max:100',
                'board' => 'sometimes|string|max:50',
                'website' => 'sometimes|url|max:255',
                'description' => 'sometimes|string',
                'established_date' => 'sometimes|date',
                'school_code' => 'nullable|sometimes|string|max:50|unique:schools,school_code,' . $id,
                'status' => 'sometimes|string|in:active,inactive',
            ]);

            $res = $this->userService->updateSchool($id, $validated, $administratorId);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("School update failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update school.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getSchoolById(Request $request, $id)
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->id : null;

            $res = $this->userService->getSchoolById($id, $administratorId);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
        } catch (Exception $e) {
            Log::error("Get school by ID failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch school.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getSchoolByCode($code)
    {
        try {
            $res = $this->userService->getSchoolByCode($code);
            $httpCode = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $httpCode);
        } catch (Exception $e) {
            Log::error("Get school by code failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch school.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getAllSchools(Request $request)
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->id : null;

            $filters = $request->validate([
                'status' => 'nullable|string|in:active,inactive',
                'board' => 'nullable|string|max:50',
                'city' => 'nullable|string|max:50',
                'state' => 'nullable|string|max:50',
            ]);

            $res = $this->userService->getAllSchools($filters, $administratorId);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Get all schools failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch schools.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getPaginatedSchools(Request $request)
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->id : null;

            $validated = $request->validate([
                'per_page' => 'nullable|integer|min:1|max:100',
                'status' => 'nullable|string|in:active,inactive',
                'board' => 'nullable|string|max:50',
                'search' => 'nullable|string|max:255',
            ]);

            $perPage = $validated['per_page'] ?? 15;
            $filters = [
                'status' => $validated['status'] ?? null,
                'board' => $validated['board'] ?? null,
                'search' => $validated['search'] ?? null,
            ];

            $res = $this->userService->getPaginatedSchools($perPage, array_filter($filters), $administratorId);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Get paginated schools failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch schools.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteSchool(Request $request, $id)
    {
        try {
            // School deletion is disabled for data integrity
            // Schools should be marked as inactive instead of deleted
            return response()->json([
                'status' => false,
                'message' => 'School deletion is not allowed. Please deactivate the school instead to maintain data integrity.',
                'data' => null,
                'error' => null,
            ], 403);

            // Old code kept for reference
            /*
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->id : null;

            $res = $this->userService->deleteSchool($id, $administratorId);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
            */
        } catch (Exception $e) {
            Log::error("Delete school failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to process request.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function toggleSchoolStatus(Request $request, $id)
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->id : null;

            // Verify school belongs to administrator
            $school = School::where('id', $id)->where('administrator_id', $administratorId)->first();

            if (!$school) {
                return response()->json([
                    'status' => false,
                    'message' => 'School not found or you do not have permission to modify this school.',
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
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateSchoolLogo(Request $request, $id)
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->id : null;

            $validated = $request->validate([
                'logo_file' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            ]);

            $res = $this->userService->updateSchoolLogo($id, $validated['logo_file'], $administratorId);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update school logo failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update school logo.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updatePrincipalSignature(Request $request, $id)
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->id : null;

            $validated = $request->validate([
                'principal_sign_file' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            ]);

            $res = $this->userService->updatePrincipalSignature($id, $validated['principal_sign_file'], $administratorId);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update principal signature failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update principal signature.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getActiveSchools(Request $request)
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->id : null;

            $res = $this->userService->getActiveSchools($administratorId);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
        } catch (Exception $e) {
            Log::error("Get active schools failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch active schools.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ============================================================
    // ===============  FEE STRUCTURE MANAGEMENT  =================
    // ============================================================

    public function storeFeeStructure(Request $request, $school_id)
    {
        try {
            $validated = $request->validate([
                'class' => 'required|string|exists:school_class,class',
                'tution_fee' => 'required|numeric|min:0',
                'other_fee' => 'required|numeric|min:0',
                'registration_fee' => 'required|numeric|min:0',
                'admission_fee' => 'required|numeric|min:0',
            ]);

            // ensure school_id present for service
            $validated['school_id'] = $school_id;

            $res = $this->userService->createFeeStructure($validated);
            $code = $this->httpCodeFromServiceResult($res, true);

            return response()->json($res, $code);
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

    public function getAllFeeStructure($school_id)
    {
        try {
            $res = $this->userService->getAllFeeStructure($school_id);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
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

    public function deleteFeeStructure($id)
    {
        try {
            $res = $this->userService->deleteFeeStructure($id);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
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

    public function updateFeeStructure(Request $request, $id, $school_id)
    {
        try {
            $validated = $request->validate([
                'class' => 'required|string|exists:school_class,class',
                'monthly_fee' => 'sometimes|numeric|min:0',
                'other_fee' => 'sometimes|numeric|min:0',
                'registration_fee' => 'sometimes|numeric|min:0',
                'admission_fee' => 'sometimes|numeric|min:0',
            ]);

            $validated['id'] = $id;

            $res = $this->userService->updateFeeStructure($validated, $school_id);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
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

    // ============================================================
    // ===============  SERVICE CHARGE MANAGEMENT =================
    // ============================================================

    public function createServiceCharge(Request $request, $school_id)
    {
        try {
            $validated = $request->validate([
                'service_type' => 'required|string|',
                'service_name' => 'required|string|max:100',
                'stopage' => 'required|numeric|min:0',
                'charge' => 'sometimes|required|numeric|min:0',
                'description' => 'nullable|string|max:255',
            ]);

            $res = $this->userService->createServiceCharge($validated, $school_id);
            $code = $this->httpCodeFromServiceResult($res, true);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Create transport fee failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create transport fee.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateServiceCharges(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'service_name' => 'sometimes|string|max:100',
                'charge' => 'sometimes|numeric|min:0',
                'description' => 'sometimes|nullable|string|max:255',
                'stopage' => 'sometimes|numeric|min:0',
            ]);

            $validated['id'] = $id;

            $res = $this->userService->updateServiceCharge($validated);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
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

    public function getAllServiceCharge($school_id)
    {
        try {
            $res = $this->userService->getServiceCharge($school_id);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
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

    public function deleteServiceCharges($id)
    {
        try {
            $res = $this->userService->deleteServiceCharge($id);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
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

    public function updateStudentService(Request $request, $student_details_id)
    {
        try {
            $validated = $request->validate([
                'school_id' => 'required|integer|exists:schools,id',
                'services'  => 'required|array',
                'services.*' => 'integer|exists:services,id', // each service id must exist
            ]);

            // add required student id
            $validated['student_details_id'] = $student_details_id;

            // send to service layer
            $res = $this->userService->updateStudentService($validated);
            $code = $this->httpCodeFromServiceResult($res, false);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update student service failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update student service.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getStudentDetailsServices($school_id)
    {
        try {
            $res = $this->userService->getStudentDetailsServices($school_id);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
        } catch (Exception $e) {
            Log::error("Get student details services failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch student details services.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ============================================================
    // ===============  MONTHLY PAYMENTS  =========================
    // ============================================================

    public function runGenerateMonthlyPaymentsCommand($school_id)
    {
        try {
            Artisan::call('generate:monthly-dues');
            $output = Artisan::output();

            return response()->json([
                'status' => true,
                'message' => 'Monthly dues command executed successfully.',
                'data' => ['output' => $output],
                'error' => null,
            ], 200);
        } catch (Exception $e) {
            Log::error("Run monthly payments command failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to run monthly dues command.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getAllMontlyPaymentsRecords($school_id)
    {
        try {
            $res = $this->userService->getAllPaymentsWithStudentInfo($school_id);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
        } catch (Exception $e) {
            Log::error("Get monthly payments records failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch monthly payments records.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateMonthlyPaymentManually(Request $request, $studentDetailsId, $school_id)
    {
        try {
            $validated = $request->validate([
                'id' => 'required|integer|exists:monthly_payments,id',
                'status' => ['required', Rule::in(['paid', 'due', 'pending'])],
                'mode' => ['nullable', Rule::in(['cash', 'online', 'cheque'])],
                'remarks' => 'nullable|string|max:255',
            ]);

            $res = $this->userService->updateMonthlyPaymentManually($studentDetailsId, $validated, $school_id);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
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


    // ============================================================
    // ===============  SUBJECT MANAGEMENT  =======================
    // ============================================================

    public function createSubject(Request $request, $school_id)
    {
        try {
            $validated = $request->validate([
                'subject_name' => 'required|string|max:100',
                'description' => 'nullable|string|max:255',
            ]);

            $res = $this->userService->createSubject($validated, $school_id);
            $code = $this->httpCodeFromServiceResult($res, true);

            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Create subject failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create subject.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getAllSubjects($school_id)
    {
        try {
            $res = $this->userService->getAllSubjects($school_id);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
        } catch (Exception $e) {
            Log::error("Get subjects failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch subjects.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteSubject($id)
    {
        try {
            $res = $this->userService->deleteSubject($id);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
        } catch (Exception $e) {
            Log::error("Delete subject failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete subject.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateSubject(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'subject_name' => 'sometimes|string|max:100',
                'description' => 'sometimes|nullable|string|max:255',
            ]);

            $validated['id'] = $id;

            $res = $this->userService->updateSubject($validated);
            $code = $this->httpCodeFromServiceResult($res, false);
            return response()->json($res, $code);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update subject failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update subject.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    // ============================================================
    // ===============  TEACHER MANAGEMENT  =======================
    // ============================================================

    public function createTeacher(Request $request, $school_id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'email' => 'required|email|unique:teachers,email',
                'phone' => 'required|string|max:15',
                'qualification' => 'nullable|string|max:100',
                'dob' => 'nullable|date',
                'gender' => 'nullable|string|max:10',
                'address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'employee_code' => 'nullable|string|max:50|unique:teachers,employee_code'
            ]);

            $validated['school_id'] = $school_id;

            $res = $this->userService->createTeacher($validated);
            return response()->json($res, $res['success'] ? 201 : 500);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $e->errors()
            ], 422);
        } catch (QueryException $e) {
            Log::error('DB error creating teacher: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Database error occurred while creating teacher.',
                'error'   => $e->getMessage()
            ], 500);
        } catch (Exception $e) {
            Log::error('Unexpected error creating teacher: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function updateTeacher(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'school_id' => 'required|integer|exists:schools,id',
                'name' => 'sometimes|required|string|max:100',
                'email' => 'sometimes|required|email|unique:teachers,email,' . $id,
                'phone' => 'sometimes|required|string|max:15',
                'qualification' => 'nullable|string|max:100',
                'dob' => 'nullable|date',
                'gender' => 'nullable|string|max:10',
                'address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'employee_code' => 'nullable|string|max:50|unique:teachers,employee_code,' . $id,
                'subjects' => 'nullable|array',
                'subjects.*' => 'integer|exists:subjects,id',
            ]);

            $res = $this->userService->updateTeacher($id, $validated);
            return response()->json($res, $res['success'] ? 200 : 500);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $e->errors()
            ], 422);
        } catch (QueryException $e) {
            Log::error('DB error updating teacher: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Database error occurred while updating teacher.',
                'error'   => $e->getMessage()
            ], 500);
        } catch (Exception $e) {
            Log::error('Unexpected error updating teacher: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function getAllTeachers($school_id = null)
    {
        try {
            $res = $this->userService->getAllTeachers($school_id);
            return response()->json($res, 200);
        } catch (Exception $e) {
            Log::error('Error fetching teachers: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch teachers.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function getTeacherMoreDetails($id)
    {
        try {
            $details = $this->userService->getTeacherMoreDetails($id);
            return response()->json($details, $details['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error('Error fetching teacher details: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch teacher details.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function deleteTeacher($id)
    {
        try {
            $res = $this->userService->deleteTeacher($id);
            return response()->json($res, $res['success'] ? 200 : 500);
        } catch (QueryException $e) {
            Log::error('DB error deleting teacher: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Database error occurred while deleting teacher.',
                'error'   => $e->getMessage()
            ], 500);
        } catch (Exception $e) {
            Log::error('Unexpected error deleting teacher: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ===============================
     * 📌 MARK BULK ATTENDANCE
     * ===============================
     */
    public function markBulkAttendance(Request $request)
    {
        try {
            $validated = $request->validate([
                'school_id' => 'required|integer|exists:schools,id',
                'attendance_date' => 'required|date',
                'attendances' => 'required|array|min:1',
                'attendances.*.teacher_id' => 'required|integer|exists:teachers,id',
                'attendances.*.status' => 'required|string|in:present,absent,late,half_day',
                'attendances.*.session_id' => 'nullable|integer|exists:sessions,id',
                'attendances.*.remarks' => 'nullable|string|max:255',
            ]);

            $result = $this->userService->markBulkAttendance($validated);
            return response()->json($result, $result['status'] ? 200 : 409);
        } catch (ValidationException $e) {
            Log::warning('Validation failed for bulk attendance: ' . json_encode($e->errors()));
            return response()->json([
                'status' => false,
                'message' => 'Validation failed.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Unexpected error in bulk attendance: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Unexpected error occurred.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    /**
     * ===============================
     * 📌 MARK ATTENDANCE
     * ===============================
     */
    public function markSingleAttendance(Request $request)
    {
        try {
            $validated = $request->validate([
                'teacher_id' => 'required|integer|exists:teachers,id',
                'school_id' => 'required|integer|exists:schools,id',
                'attendance_date' => 'required|date',
                'status' => 'required|string|in:present,absent,late,half_day',
                'session_id' => 'nullable|integer|exists:sessions,id',
                'remarks' => 'nullable|string|max:255',
            ]);

            $result = $this->userService->markAttendance($validated);

            return response()->json($result, $result['status'] ? 200 : 409);
        } catch (ValidationException $e) {
            Log::warning('Validation error marking teacher attendance: ' . json_encode($e->errors()));
            return response()->json([
                'status' => false,
                'message' => 'Validation failed.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Unexpected error marking teacher attendance: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Unexpected error occurred.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * ===============================
     * 📌 FETCH DAILY ATTENDANCE RECORDS
     * ===============================
     */
    public function getTeacherAttendance(Request $request)
    {
        try {
            $validated = $request->validate([
                'teacher_id' => 'required|integer|exists:teachers,id',
                'school_id' => 'required|integer|exists:schools,id',
                'month' => 'nullable|integer|min:1|max:12',
                'year' => 'nullable|integer|min:2000|max:' . date('Y'),
            ]);

            $result = $this->userService->getTeacherAttendance(
                $validated['teacher_id'],
                $validated['school_id'],
                $validated['month'] ?? null,
                $validated['year'] ?? null
            );

            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (ValidationException $e) {
            Log::warning('Validation error fetching attendance: ' . json_encode($e->errors()));
            return response()->json([
                'status' => false,
                'message' => 'Validation failed.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Unexpected error fetching teacher attendance: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Unexpected error occurred.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * ===============================
     * 📌 FETCH MONTHLY ATTENDANCE SUMMARY
     * ===============================
     */
    public function getTeacherMonthlySummary(Request $request)
    {
        try {
            $validated = $request->validate([
                'teacher_id' => 'required|integer|exists:teachers,id',
                'school_id' => 'required|integer|exists:schools,id',
                'year' => 'required|integer|min:2000|max:' . date('Y'),
            ]);

            $result = $this->userService->getTeacherMonthlySummary(
                $validated['teacher_id'],
                $validated['school_id'],
                $validated['year']
            );

            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (ValidationException $e) {
            Log::warning('Validation error fetching attendance summary: ' . json_encode($e->errors()));
            return response()->json([
                'status' => false,
                'message' => 'Validation failed.',
                'data' => null,
                'error' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Unexpected error fetching teacher summary: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Unexpected error occurred.',
                'data' => null,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ============================================================
    // ===============  CLASS MANAGEMENT  =========================
    // ============================================================

    public function createClass(Request $request)
    {
        $data = $request->validate([
            'class' => 'required|string|max:255',
            'section' => 'nullable|string|max:255',
            'room_no' => 'nullable|string|max:50',
            'teacher_in_charge' => 'nullable|string|max:255',
            'capacity' => 'nullable|integer',
            'status' => 'nullable|string',
            'notes' => 'nullable|string',
            'school_id' => 'required|integer|exists:schools,id',
        ]);

        $result = $this->userService->createClass($data);
        return response()->json($result, $result['status'] ? 200 : 500);
    }

    public function updateClass(Request $request, $id)
    {
        $data = $request->validate([
            'class' => 'sometimes|string|max:255',
            'section' => 'sometimes|string|max:255',
            'room_no' => 'sometimes|string|max:50',
            'teacher_in_charge' => 'sometimes|string|max:255',
            'capacity' => 'sometimes|integer',
            'status' => 'sometimes|string',
            'notes' => 'sometimes|string',
        ]);

        $result = $this->userService->updateClass($id, $data);
        return response()->json($result, $result['status'] ? 200 : 404);
    }

    public function deleteClass($id)
    {
        $result = $this->userService->deleteClass($id);
        return response()->json($result, $result['status'] ? 200 : 404);
    }

    public function getClassesBySchool($school_id)
    {
        $result = $this->userService->getClassesBySchool($school_id);
        return response()->json($result, $result['status'] ? 200 : 500);
    }

    // ============================================================
    // ===============  CLASS_TIME_TABLE MANAGEMENT  ==============
    // ============================================================

    public function createClassTimeTable(Request $request)
    {
        try {
            $validated = $request->validate([
                'school_id' => 'required|integer|exists:schools,id',
                'timetable' => 'required|array|min:1',
                'timetable.*.class_id' => 'required|integer|exists:school_class,id',
                'timetable.*.subject_id' => 'required|integer|exists:school_subjects,id',
                'timetable.*.teacher_id' => 'required|integer|exists:teachers,id',
                'timetable.*.day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
                'timetable.*.start_time' => 'required|date_format:H:i',
                'timetable.*.end_time' => 'required|date_format:H:i|after:timetable.*.start_time',
            ]);

            $result = $this->userService->createClassTimeTable($validated);

            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Create class timetable failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create class timetable.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateClassTimeTable(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'class_id' => 'sometimes|required|integer|exists:school_class,id',
                'subject_id' => 'sometimes|required|integer|exists:school_subjects,id',
                'teacher_id' => 'sometimes|required|integer|exists:teachers,id',
                'day_of_week' => 'sometimes|required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
                'start_time' => 'sometimes|required|date_format:H:i',
                'end_time' => 'sometimes|required|date_format:H:i|after:start_time',
            ]);

            $result = $this->userService->updateClassTimeTable($id, $validated);

            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update class timetable failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update class timetable.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getClassTeacherTimeTable(Request $request, $school_id)
    {
        try {
            $filters = $request->validate([
                'class_id' => 'nullable|integer|exists:school_class,id',
                'teacher_id' => 'nullable|integer|exists:teachers,id',
            ]);

            $filters['school_id'] = $school_id;

            $result = $this->userService->getClassTimeTable($filters);

            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Get class timetable failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch class timetable.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getAllDayClassTimeTable($school_id, $teacher_id)
    {
        try {
            $result = $this->userService->getAllDayClassTimeTable($school_id, $teacher_id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("Get all day class timetable failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch all day class timetable.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getTimetableByClass($school_id, $class_id)
    {
        try {
            $result = $this->userService->getTimetableByClass($school_id, $class_id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("Get timetable by class failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch timetable for the specified class.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteClassTimeTable($id)
    {
        try {
            $result = $this->userService->deleteClassTimeTable($id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("Delete class timetable failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete class timetable entry.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ============================================================
    // ===============  SCHOOL BUS MANAGEMENT  ====================
    // ============================================================

    public function createSchoolBus(Request $request, $school_id)
    {
        try {
            $validated = $request->validate([
                'bus_number' => 'required|string|max:255|unique:school_buses,bus_number',
                'driver_name' => 'required|string|max:255',
                'driver_contact' => 'required|string|max:20',
                'route_name' => 'nullable|string|max:255',
                'status' => 'nullable|string|in:active,inactive',
            ]);

            $result = $this->userService->createSchoolBus($validated, $school_id);
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Create school bus failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create school bus.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getAllSchoolBuses($school_id)
    {
        try {
            $result = $this->userService->getAllSchoolBuses($school_id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("Get all school buses failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch school buses.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getSchoolBus($school_id, $bus_id)
    {
        try {
            $result = $this->userService->getSchoolBus($bus_id, $school_id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("Get school bus failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch school bus.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateSchoolBus(Request $request, $school_id, $bus_id)
    {
        try {
            $validated = $request->validate([
                'bus_number' => 'sometimes|string|max:255|unique:school_buses,bus_number,' . $bus_id,
                'driver_name' => 'sometimes|string|max:255',
                'driver_contact' => 'sometimes|string|max:20',
                'route_name' => 'nullable|string|max:255',
                'status' => 'sometimes|string|in:active,inactive',
            ]);

            $result = $this->userService->updateSchoolBus($bus_id, $validated, $school_id);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update school bus failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update school bus.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteSchoolBus($school_id, $bus_id)
    {
        try {
            $result = $this->userService->deleteSchoolBus($bus_id, $school_id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("Delete school bus failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete school bus.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ============================================================
    // ===============  SCHOOL FACILITIES MANAGEMENT  =============
    // ============================================================

    public function createSchoolFacility(Request $request, $school_id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'count' => 'nullable|integer|min:1',
                'description' => 'nullable|string',
                'status' => 'nullable|string|in:active,inactive,under_maintenance',
            ]);

            $result = $this->userService->createSchoolFacility($validated, $school_id);
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Create facility failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create facility.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getSchoolFacilities($school_id)
    {
        try {
            $result = $this->userService->getSchoolFacilities($school_id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("Get facilities failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch facilities.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateSchoolFacility(Request $request, $facility_id)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'count' => 'sometimes|integer|min:1',
                'description' => 'sometimes|nullable|string',
                'status' => 'sometimes|string|in:active,inactive,under_maintenance',
            ]);

            $result = $this->userService->updateSchoolFacility($facility_id, $validated);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update facility failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update facility.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteSchoolFacility($facility_id)
    {
        try {
            $result = $this->userService->deleteSchoolFacility($facility_id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("Delete facility failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete facility.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ============================================================
    // ===============  SCHOOL ACHIEVEMENTS MANAGEMENT  ===========
    // ============================================================

    public function createSchoolAchievement(Request $request, $school_id)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'year' => 'required|string|max:4',
                'category' => 'nullable|string|max:100',
                'certificate_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,pdf|max:5120',
            ]);

            $result = $this->userService->createSchoolAchievement($validated, $school_id);
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Create achievement failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create achievement.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getSchoolAchievements($school_id)
    {
        try {
            $result = $this->userService->getSchoolAchievements($school_id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("Get achievements failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch achievements.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateSchoolAchievement(Request $request, $achievement_id)
    {
        try {
            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|nullable|string',
                'year' => 'sometimes|string|max:4',
                'category' => 'sometimes|nullable|string|max:100',
                'certificate_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,pdf|max:5120',
            ]);

            $result = $this->userService->updateSchoolAchievement($achievement_id, $validated);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update achievement failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update achievement.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteSchoolAchievement($achievement_id)
    {
        try {
            $result = $this->userService->deleteSchoolAchievement($achievement_id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("Delete achievement failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete achievement.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ============================================================
    // ===============  SCHOOL TIMINGS MANAGEMENT  ================
    // ============================================================

    public function createSchoolTiming(Request $request, $school_id)
    {
        try {
            $validated = $request->validate([
                'day' => 'required|string|max:255',
                'morning' => 'required|string|max:255',
                'office' => 'required|string|max:255',
                'order' => 'nullable|integer|min:0',
            ]);

            $result = $this->userService->createSchoolTiming($validated, $school_id);
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Create timing failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create timing.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getSchoolTimings($school_id)
    {
        try {
            $result = $this->userService->getSchoolTimings($school_id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("Get timings failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch timings.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateSchoolTiming(Request $request, $timing_id)
    {
        try {
            $validated = $request->validate([
                'day' => 'sometimes|string|max:255',
                'morning' => 'sometimes|string|max:255',
                'office' => 'sometimes|string|max:255',
                'order' => 'sometimes|integer|min:0',
            ]);

            $result = $this->userService->updateSchoolTiming($timing_id, $validated);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Update timing failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update timing.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteSchoolTiming($timing_id)
    {
        try {
            $result = $this->userService->deleteSchoolTiming($timing_id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("Delete timing failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete timing.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateSchoolTimingsBulk(Request $request, $school_id)
    {
        try {
            $validated = $request->validate([
                'timings' => 'required|array|min:1',
                'timings.*.day' => 'required|string|max:255',
                'timings.*.morning' => 'required|string|max:255',
                'timings.*.office' => 'required|string|max:255',
                'timings.*.order' => 'nullable|integer|min:0',
            ]);

            $result = $this->userService->updateSchoolTimingsBulk($school_id, $validated['timings']);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error("Bulk update timings failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update timings.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ============================================================
    // ===============  GET COMPLETE SCHOOL INFO  =================
    // ============================================================

    public function getSchoolWithCompleteInfo($school_id)
    {
        try {
            $result = $this->userService->getSchoolWithCompleteInfo($school_id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("Get complete school info failed: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch complete school information.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    // ============================================================
    // ===========  ADMINISTRATOR DASHBOARD ANALYTICS  ============
    // ============================================================

    public function getAdministratorDashboard(Request $request)
    {
        try {
            // Get authenticated administrator
            $authUser = $this->getAuthenticatedUser($request);
            if (!$authUser || $authUser->role !== 'administrator') {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Only administrators can access this dashboard.',
                    'data' => null,
                    'error' => null,
                ], 403);
            }

            $administratorId = $authUser->id;

            // Get school IDs for this administrator
            $schoolIds = \App\Models\School::where('administrator_id', $administratorId)->pluck('id');

            $stats = [
                'total_schools' => \App\Models\School::where('administrator_id', $administratorId)->count(),
                'active_schools' => \App\Models\School::where('administrator_id', $administratorId)->where('status', 'active')->count(),
                'total_users' => User::whereIn('school_id', $schoolIds)->count(),
                'total_subscriptions' => \App\Models\Subscription::whereIn('school_id', $schoolIds)->count(),
                'active_subscriptions' => \App\Models\Subscription::whereIn('school_id', $schoolIds)->where('status', 'active')->count(),
                'trial_subscriptions' => \App\Models\Subscription::whereIn('school_id', $schoolIds)->where('status', 'trial')->count(),
                'expired_subscriptions' => \App\Models\Subscription::whereIn('school_id', $schoolIds)->where('status', 'expired')->count(),
                'total_revenue' => \App\Models\PaymentTransaction::whereIn('school_id', $schoolIds)->where('status', 'completed')->sum('amount'),
                'monthly_revenue' => \App\Models\PaymentTransaction::whereIn('school_id', $schoolIds)->where('status', 'completed')
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->sum('amount'),
                'pending_payments' => \App\Models\PaymentTransaction::whereIn('school_id', $schoolIds)->where('status', 'pending')->count(),
            ];

            // Revenue growth for last 10 months
            $revenueGrowth = [];
            for ($i = 9; $i >= 0; $i--) {
                $month = now()->subMonths($i);
                $monthName = $month->format('M');
                $revenue = \App\Models\PaymentTransaction::whereIn('school_id', $schoolIds)
                    ->where('status', 'completed')
                    ->whereMonth('created_at', $month->month)
                    ->whereYear('created_at', $month->year)
                    ->sum('amount');
                $schoolCount = \App\Models\Subscription::whereIn('school_id', $schoolIds)
                    ->whereMonth('created_at', $month->month)
                    ->whereYear('created_at', $month->year)
                    ->count();
                $revenueGrowth[] = [
                    'month' => $monthName,
                    'revenue' => (float)$revenue,
                    'schools' => $schoolCount,
                ];
            }

            // Plan distribution
            $planDistribution = \App\Models\Subscription::select('plan_id', DB::raw('count(*) as value'))
                ->whereIn('school_id', $schoolIds)
                ->whereIn('status', ['active', 'trial'])
                ->groupBy('plan_id')
                ->with('plan')
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => $item->plan->name ?? 'Unknown Plan',
                        'value' => $item->value,
                        'color' => $this->getPlanColor($item->plan->name ?? 'Unknown Plan'),
                    ];
                });

            // Subscription trend for last 6 months
            $subscriptionTrend = [];
            for ($i = 5; $i >= 0; $i--) {
                $month = now()->subMonths($i);
                $monthName = $month->format('M');
                $active = \App\Models\Subscription::whereIn('school_id', $schoolIds)
                    ->where('status', 'active')
                    ->whereMonth('created_at', $month->month)
                    ->whereYear('created_at', $month->year)
                    ->count();
                $trial = \App\Models\Subscription::whereIn('school_id', $schoolIds)
                    ->where('status', 'trial')
                    ->whereMonth('created_at', $month->month)
                    ->whereYear('created_at', $month->year)
                    ->count();
                $expired = \App\Models\Subscription::whereIn('school_id', $schoolIds)
                    ->where('status', 'expired')
                    ->whereMonth('created_at', $month->month)
                    ->whereYear('created_at', $month->year)
                    ->count();
                $subscriptionTrend[] = [
                    'month' => $monthName,
                    'active' => $active,
                    'trial' => $trial,
                    'expired' => $expired,
                ];
            }

            // Top schools by revenue (lifetime value) - only administrator's schools
            $topSchools = \App\Models\School::select('schools.id', 'schools.name', DB::raw('COALESCE(SUM(payment_transactions.amount), 0) as total_revenue'))
                ->where('schools.administrator_id', $administratorId)
                ->leftJoin('payment_transactions', function($join) {
                    $join->on('schools.id', '=', 'payment_transactions.school_id')
                         ->where('payment_transactions.status', '=', 'completed');
                })
                ->groupBy('schools.id', 'schools.name')
                ->orderBy('total_revenue', 'desc')
                ->having('total_revenue', '>', 0)
                ->limit(5)
                ->with(['subscriptions' => function ($query) {
                    $query->latest()->with('plan');
                }])
                ->get()
                ->map(function ($school) {
                    $latestSubscription = $school->subscriptions->first();
                    return [
                        'name' => $school->name,
                        'revenue' => (float)$school->total_revenue,
                        'plan' => $latestSubscription && $latestSubscription->plan ? $latestSubscription->plan->name : 'No Plan',
                        'status' => $latestSubscription ? $latestSubscription->status : 'inactive',
                    ];
                });

            // Recent schools - only administrator's schools
            $recentSchools = \App\Models\School::where('administrator_id', $administratorId)
                ->with(['subscriptions' => function ($query) {
                    $query->latest()->with('plan');
                }])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($school) {
                    $latestSubscription = $school->subscriptions->first();
                    return [
                        'name' => $school->name,
                        'city' => $school->city ?? 'N/A',
                        'plan' => $latestSubscription && $latestSubscription->plan ? $latestSubscription->plan->name : 'No Plan',
                        'status' => $latestSubscription ? $latestSubscription->status : 'inactive',
                        'joined_date' => $school->created_at->format('Y-m-d'),
                    ];
                });

            return response()->json([
                'status' => true,
                'data' => [
                    'stats' => $stats,
                    'revenue_growth' => $revenueGrowth,
                    'plan_distribution' => $planDistribution,
                    'subscription_trend' => $subscriptionTrend,
                    'top_schools' => $topSchools,
                    'recent_schools' => $recentSchools,
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get administrator dashboard failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch dashboard data.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function getPlanColor($planName)
    {
        $colors = [
            'Basic' => '#3b82f6',
            'Standard' => '#8b5cf6',
            'Premium' => '#10b981',
        ];
        return $colors[$planName] ?? '#6b7280';
    }
}
