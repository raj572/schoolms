<?php

namespace App\Services;

use App\Helpers\JWTHelper;
use App\Models\School;
use App\Repositories\ParentRepository;
use App\Repositories\StudentDetailsRepository;
use App\Repositories\StudentRepository;
use App\Repositories\TeacherRepository;
use App\Repositories\UserRepository;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Throwable;

class AuthService
{
    protected EmailService $emailService;
    protected StudentRepository $studentRepository;
    protected UserRepository $userRepository;
    protected StudentDetailsRepository $studentDetailsRepository;
    protected ParentRepository $parentRepository;
    protected TeacherRepository $teacherRepository;

    public function __construct(
        StudentRepository $studentRepository,
        StudentDetailsRepository $studentDetailsRepository,
        EmailService $emailService,
        UserRepository $userRepository,
        ParentRepository $parentRepository,
        TeacherRepository $teacherRepository
    ) {
        $this->studentRepository = $studentRepository;
        $this->studentDetailsRepository = $studentDetailsRepository;
        $this->emailService = $emailService;
        $this->userRepository = $userRepository;
        $this->parentRepository = $parentRepository;
        $this->teacherRepository = $teacherRepository;
    }

    public function test()
    {
        return "Testing Success";
    }

    function generateStrongPassword($length = 12)
    {
        $upper    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lower    = 'abcdefghijklmnopqrstuvwxyz';
        $numbers  = '0123456789';
        $symbols  = '!@#$%^&*()-_=+?';

        // Ensure at least one of each type
        $password = '';
        $password .= $upper[random_int(0, strlen($upper) - 1)];
        $password .= $lower[random_int(0, strlen($lower) - 1)];
        $password .= $numbers[random_int(0, strlen($numbers) - 1)];
        $password .= $symbols[random_int(0, strlen($symbols) - 1)];

        // Fill remaining length with all characters mixed
        $all = $upper . $lower . $numbers . $symbols;
        for ($i = strlen($password); $i < $length; $i++) {
            $password .= $all[random_int(0, strlen($all) - 1)];
        }

        // Shuffle to avoid predictable sequence
        $password = str_shuffle($password);

        // Prepend two spaces if system requires them
        return $password;
    }

    public function registerUser(array $data)
    {
        try {
            // Hash the password before saving
            $data['password'] = Hash::make($data['password']);

            $user = $this->userRepository->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => 'administrator',
                'status' => 'active',
            ]);

            return [
                'status' => true,
                'message' => 'User registered successfully',
                'data' => $user,
            ];
        } catch (QueryException $e) {
            Log::error('Error registering user: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Error registering user: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Simple login for newly registered users (no school_id required)
     */
    public function simpleLogin(array $data)
    {
        try {
            $email = $data['email'] ?? null;
            $password = $data['password'] ?? null;

            if (!$email || !$password) {
                return [
                    'status' => false,
                    'message' => 'Missing required fields (email, password)',
                ];
            }

            // Find user by email only
            $user = DB::table('users')->where('email', $email)->first();

            if (!$user) {
                return [
                    'status' => false,
                    'message' => 'Invalid credentials',
                ];
            }

            // Verify password
            if (!Hash::check($password, $user->password)) {
                return [
                    'status' => false,
                    'message' => 'Invalid credentials',
                ];
            }

            // Check if account is active
            if (isset($user->status) && $user->status === 'inactive') {
                return [
                    'status' => false,
                    'message' => 'Your account is inactive.',
                ];
            }

            // Generate token
            $token = JWTHelper::generateToken($user);

            // For administrators: auto-sync school_setup_completed and subscription_active
            // based on actual DB state in case the flags were never updated
            $schoolSetupCompleted = (bool)$user->school_setup_completed;
            $subscriptionActive = (bool)$user->subscription_active;
            $schoolId = $user->school_id;

            if ($user->role === 'administrator') {
                // Check if this administrator actually has schools in the DB
                $firstSchool = DB::table('schools')
                    ->where('administrator_id', $user->id)
                    ->first();
                
                $hasSchools = $firstSchool !== null;

                if ($hasSchools) {
                    $updates = [];

                    if (!$schoolSetupCompleted) {
                        // Administrator has schools but flag is false — sync it
                        $updates['school_setup_completed'] = true;
                        $schoolSetupCompleted = true;
                    }

                    if (empty($schoolId)) {
                        // Administrator has schools but no school_id on user record — sync it
                        $updates['school_id'] = $firstSchool->id;
                        $schoolId = $firstSchool->id;
                    }

                    if (!empty($updates)) {
                        DB::table('users')->where('id', $user->id)->update($updates);
                        Log::info("Auto-synced flags for administrator ID {$user->id}: " . json_encode($updates));
                    }
                }

                // Check if any of their schools has an active subscription
                if ($hasSchools) {
                    $schoolIds = DB::table('schools')
                        ->where('administrator_id', $user->id)
                        ->pluck('id');
                    
                    $hasActiveSubscription = DB::table('subscriptions')
                        ->whereIn('school_id', $schoolIds)
                        ->whereIn('status', ['active', 'trial'])
                        ->exists();

                    if ($hasActiveSubscription && !$subscriptionActive) {
                        DB::table('users')
                            ->where('id', $user->id)
                            ->update(['subscription_active' => true]);
                        $subscriptionActive = true;
                        Log::info("Auto-synced subscription_active=true for administrator ID {$user->id}");
                    }
                }
            }

            return [
                'status' => true,
                'message' => 'Login successful',
                'token' => $token,
                'data' => [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'full_name' => $user->full_name ?? $user->username,
                    'role' => $user->role,
                    'school_id' => $schoolId,
                    'email_verified' => (bool)$user->email_verified,
                    'school_setup_completed' => $schoolSetupCompleted,
                    'subscription_active' => $subscriptionActive,
                    'registration_status' => $user->registration_status,
                ],
            ];
        } catch (QueryException $e) {
            Log::error('Database error during simple login: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Database error occurred while logging in.',
            ];
        } catch (Throwable $e) {
            Log::error('Simple login error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return [
                'status' => false,
                'message' => 'An unexpected error occurred during login. Please try again later.',
            ];
        }
    }

    /**
     * Login with school_id (for existing users)
     */
    public function login(array $data, $school_id)
    {
        try {
            // Extract fields safely
            $email = $data['email'] ?? null;
            $password = $data['password'] ?? null;
            $role = $data['role'] ?? null;

            // Basic sanity check
            if (!$email || !$password || !$role || !$school_id) {
                return [
                    'status' => false,
                    'message' => 'Missing required fields (email, password, role, or school_id)',
                ];
            }

            // 1️⃣ Choose repository based on role
            switch ($role) {
                case 'student':
                    $user = $this->studentRepository->getStudent($email, $school_id)->first();
                    break;
                case 'parent':
                    $user = $this->parentRepository->getParent($email, $school_id)->first();
                    break;
                case 'teacher':
                    $user = $this->teacherRepository->getByEmail($email, $school_id)->first();
                    break;
                default:
                    $user = $this->userRepository->getUser($email, $school_id)->first();
                    break;
            }

            // 2️⃣ Check if user exists
            if (!$user || $user->role !== $role) {
                return [
                    'status' => false,
                    'message' => 'User not found for this school',
                ];
            }

            // 3️⃣ Check if account is active
            if (isset($user->status) && $user->status === 'inactive') {
                return [
                    'status' => false,
                    'message' => 'Your account is inactive. Please contact the school administrator.',
                ];
            }

            // 4️⃣ Verify password
            if (!Hash::check($password, $user->password)) {
                return [
                    'status' => false,
                    'message' => 'Invalid credentials',
                ];
            }
            // if ($password != $user->password) {
            //     return [
            //         'status' => false,
            //         'message' => 'Invalid credentials', 
            //     ];
            // }

            // 5️ Generate token
            $token = JWTHelper::generateToken($user);

            return [
                'status' => true,
                'message' => 'Login successful',
                'token' => $token
            ];
        } catch (QueryException $e) {
            // Database-related error
            Log::error('Database error during login: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Database error occurred while logging in.',
            ];
        } catch (Throwable $e) {
            // Any other unexpected errors
            Log::error('Login error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return [
                'status' => false,
                'message' => 'An unexpected error occurred during login. Please try again later.',
            ];
        }
    }

    public function getUser($payload)
    {
        Log::info('Fetching user with payload', ['payload' => $payload]);

        try {
            // 🔹 Handle if $payload is wrapped like {"success":true, "data": {"stdClass": {...}}}
            if (isset($payload->data->stdClass)) {
                $payloadData = $payload->data->stdClass;
            } elseif (isset($payload->data)) {
                $payloadData = $payload->data;
            } else {
                $payloadData = $payload;
            }

            // 🔹 Normalize to object
            if (is_array($payloadData)) {
                $payloadData = (object) $payloadData;
            }

            $school_id = $payloadData->school_id ?? null;
            $userId = $payloadData->user_id ?? null;
            $role = $payloadData->role ?? null;

            // Allow administrators to proceed without a school_id in their JWT payload
            if (!$userId || !$role || (!$school_id && $role !== 'administrator')) {
                return [
                    'status' => false,
                    'message' => 'Missing required parameters',
                    'data' => null,
                ];
            }

            // 🔹 Fetch user by role
            if ($role === 'student') {
                $user = $this->studentRepository->findById($userId, $school_id)->first();
            } elseif ($role === 'parent') {
                $user = $this->parentRepository->findById($userId, $school_id);
            } elseif ($role === 'teacher') {
                $user = $this->teacherRepository->findById($userId, $school_id)->first();
            } else {
                if ($role === 'administrator') {
                    $user = \App\Models\User::find($userId);
                } else {
                    $user = $this->userRepository->findById($userId, $school_id);
                }
            }

            if (!$user) {
                return [
                    'status' => false,
                    'message' => 'User not found',
                    'data' => null,
                ];
            }

            // For administrators: auto-sync school_setup_completed and subscription_active in real-time
            if ($role === 'administrator') {
                $schoolSetupCompleted = (bool)$user->school_setup_completed;
                $subscriptionActive = (bool)$user->subscription_active;
                $schoolId = $user->school_id;

                $firstSchool = DB::table('schools')
                    ->where('administrator_id', $user->id)
                    ->first();
                
                $hasSchools = $firstSchool !== null;

                if ($hasSchools) {
                    $updates = [];

                    if (!$schoolSetupCompleted) {
                        $updates['school_setup_completed'] = true;
                        $user->school_setup_completed = true;
                    }

                    if (empty($schoolId)) {
                        $updates['school_id'] = $firstSchool->id;
                        $user->school_id = $firstSchool->id;
                    }

                    // Check if any of their schools has an active subscription
                    $schoolIds = DB::table('schools')
                        ->where('administrator_id', $user->id)
                        ->pluck('id');
                    
                    $hasActiveSubscription = DB::table('subscriptions')
                        ->whereIn('school_id', $schoolIds)
                        ->whereIn('status', ['active', 'trial'])
                        ->exists();

                    if ($hasActiveSubscription && !$subscriptionActive) {
                        $updates['subscription_active'] = true;
                        $user->subscription_active = true;
                    }

                    if (!empty($updates)) {
                        DB::table('users')->where('id', $user->id)->update($updates);
                        Log::info("Auto-synced flags inside getUser for administrator ID {$user->id}: " . json_encode($updates));
                    }
                }
            }
            
            // Convert to array and ensure all fields are included
            $userArray = $user->toArray();
            
            // Remove sensitive fields
            unset($userArray['password']);
            unset($userArray['otp']);
            unset($userArray['verification_token']);
            
            return [
                'status' => true,
                'message' => 'User retrieved successfully',
                'data' => $userArray,
            ];
        } catch (Exception $e) {
            Log::error('Error retrieving user', ['error' => $e->getMessage()]);
            return [
                'status' => false,
                'message' => 'Error retrieving user: ' . $e->getMessage(),
                'data' => null,
            ];
        }
    }


    public function getSchoolList()
    {
        try {
            $schools = School::where('status', 'active')->get(['id', 'name', 'city']);

            return [
                'status' => true,
                'message' => 'Schools retrieved successfully',
                'data' => $schools,
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => 'Error retrieving schools: ' . $e->getMessage(),
                'data' => null,
            ];
        }
    }


    /**
     * Finds a user, generates an OTP, saves it to the database, and then sends it via email.
     * This entire process is wrapped in a database transaction.
     *
     * @param array $data Contains 'email', 'role', and 'school_id'
     * @return array
     */
    public function sendOtpForPasswordReset(array $data): array
    {
        $email = $data['email'];
        $role = $data['role'];
        $school_id = $data['school_id'];

        // Step 1: Fetch user by role
        $user = match ($role) {
            'student' => $this->studentRepository->getStudent($email, $school_id)->first(),
            'parent' => $this->parentRepository->getParent($email, $school_id)->first(),
            'teacher' => $this->teacherRepository->getByEmail($email, $school_id)->first(),
            default => $this->userRepository->getUser($email, $school_id)->first(),
        };

        if (!$user) {
            return ['status' => false, 'message' => 'User not found for the specified role and school.'];
        }

        // Step 2: Generate OTP
        $otp = rand(100000, 999999);
        $otpExpiresAt = now()->addMinutes(10);

        try {
            // Wrap DB update and email sending in a transaction
            DB::transaction(function () use ($user, $otp, $otpExpiresAt) {
                // Step 3: Update user record with OTP
                $user->otp = $otp;
                $user->otp_expiration_time = $otpExpiresAt;
                $updateSuccess = $user->save();

                if (!$updateSuccess) {
                    throw new Exception("Failed to save OTP to the database.");
                }

                // Step 4: Determine user's name for the email
                $name = match ($user->role) {
                    'student' => $user->detail->candidate_name ?? $user->username,
                    'parent' => $user->father_name ?? $user->guardian_name ?? 'Parent',
                    'teacher' => $user->name,
                    'warden' => $user->full_name ?? $user->username,
                    default => $user->full_name ?? $user->username,
                };

                $message = "Dear {$name},\n\nYour One-Time Password (OTP) for password reset is: {$otp}\n\nThis OTP is valid for 10 minutes.\n\nThanks,\n" . config('app.name');

                // Step 5: Send the email
                Mail::raw($message, fn($mail) => $mail->to($user->email)->subject('Your OTP for Password Reset'));
            });

            return [
                'status' => true,
                'message' => 'An OTP has been sent to your email address.',
                'user_id' => $user->id
            ];
        } catch (TransportExceptionInterface $e) {
            Log::error('Mail sending failed during OTP process.', ['error' => $e->getMessage()]);
            return [
                'status' => false,
                'message' => 'Could not send OTP email. Please check your email configuration or try again later.',
            ];
        } catch (Throwable $e) {
            Log::error('An error occurred during the OTP generation and sending process.', ['error' => $e->getMessage()]);
            return [
                'status' => false,
                'message' => 'An unexpected error occurred: ' . $e->getMessage(),
            ];
        }
    }


    public function changePassword(array $data)
    {
        $email = $data['email'];
        $role = $data['role'];
        $school_id = $data['school_id'];

        // 1. Get user by role, email, and school
        $user = match ($role) {
            'student' => $this->studentRepository->getStudent($email, $school_id)->first(),
            'parent' => $this->parentRepository->getParent($email, $school_id)->first(),
            'teacher' => $this->teacherRepository->getByEmail($email, $school_id)->first(),
            default => $this->userRepository->getUser($email, $school_id)->first(),
        };

        if (!$user) {
            return ['status' => false, 'message' => 'User not found for the specified school.'];
        }

        // 2. OTP validation
        if ($user->otp !== $data['otp']) {
            return ['status' => false, 'message' => 'Invalid OTP'];
        }

        if (Carbon::now()->greaterThan($user->otp_expiration_time)) {
            return ['status' => false, 'message' => 'OTP has expired'];
        }

        // 3. Hash new password and clear OTP fields
        $updateData = [
            'password' => Hash::make($data['newPassword']),
            'otp' => null,
            'otp_expiration_time' => null,
        ];

        // 4. Update via correct repository
        $updateStatus = match ($role) {
            'student' => $this->studentRepository->update($user->id, $updateData),
            'parent' => $this->parentRepository->update($user->id, $updateData),
            'teacher' => $this->teacherRepository->update($user->id, $school_id, $updateData),
            default => $this->userRepository->update($user->id, $updateData),
        };

        if (!$updateStatus) {
            Log::error('Failed to update password in database', ['email' => $user->email, 'role' => $role]);
            return ['status' => false, 'message' => 'Failed to save new password.'];
        }

        Log::info('Password changed successfully', ['email' => $user->email, 'role' => $role]);
        return ['status' => true, 'message' => 'Password changed successfully.'];
    }
}
