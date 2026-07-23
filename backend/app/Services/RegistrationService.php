<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Repositories\SchoolRepository;
use App\Models\User;
use App\Helpers\JWTHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Exception;

class RegistrationService
{
    protected $userRepository;
    protected $schoolRepository;
    protected $emailService;

    public function __construct(
        UserRepository $userRepository,
        SchoolRepository $schoolRepository,
        EmailService $emailService
    ) {
        $this->userRepository = $userRepository;
        $this->schoolRepository = $schoolRepository;
        $this->emailService = $emailService;
    }

    /**
     * NEW FLOW - Step 1: Send OTP to email before registration
     */
    public function sendRegistrationOTP(array $data): array
    {
        try {
            $email = $data['email'];

            // Check if email already exists
            $existingUser = User::where('email', $email)->first();
            if ($existingUser) {
                return [
                    'status' => false,
                    'message' => 'Email already registered.',
                ];
            }

            // Generate 6-digit OTP
            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Store OTP and registration data in cache for 10 minutes
            $cacheKey = 'registration_otp_' . $email;
            Cache::put($cacheKey, [
                'otp' => $otp,
                'registration_data' => $data,
                'created_at' => now(),
            ], now()->addMinutes(10));

            // Send OTP via email
            try {
                $subject = 'Your Registration OTP - School Management System';
                $message = "Hello {$data['full_name']},\n\n";
                $message .= "Your OTP for registration is: {$otp}\n\n";
                $message .= "This OTP will expire in 10 minutes.\n\n";
                $message .= "If you did not request this, please ignore this email.\n\n";
                $message .= "Best regards,\n";
                $message .= "School Management Team";

                $this->emailService->sendRaw($email, $subject, $message);
            } catch (Exception $e) {
                Log::error('Failed to send OTP email: ' . $e->getMessage());
                return [
                    'status' => false,
                    'message' => 'Failed to send OTP. Please try again.',
                ];
            }

            return [
                'status' => true,
                'message' => 'OTP sent to your email successfully.',
                'data' => [
                    'email' => $email,
                    'expires_in' => 600, // 10 minutes in seconds
                ],
            ];

        } catch (Exception $e) {
            Log::error('Send registration OTP failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to send OTP. Please try again.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * NEW FLOW - Step 2: Verify OTP and complete registration
     */
    public function verifyOTPAndRegister(array $data): array
    {
        try {
            DB::beginTransaction();

            $email = $data['email'];
            $otp = $data['otp'];

            // Retrieve cached OTP data
            $cacheKey = 'registration_otp_' . $email;
            $cachedData = Cache::get($cacheKey);

            if (!$cachedData) {
                return [
                    'status' => false,
                    'message' => 'OTP expired. Please request a new one.',
                ];
            }

            // Verify OTP
            if ($cachedData['otp'] !== $otp) {
                return [
                    'status' => false,
                    'message' => 'Invalid OTP. Please try again.',
                ];
            }

            // Get registration data from cache
            $registrationData = $cachedData['registration_data'];

            // Create user with administrator role
            $userData = [
                'full_name' => $registrationData['full_name'],
                'username' => $registrationData['email'],
                'email' => $registrationData['email'],
                'password' => Hash::make($registrationData['full_name'] . '2026'),
                'phone' => $registrationData['phone'],
                'role' => 'administrator', // Always administrator for new flow
                'registration_status' => 'active', // Email already verified via OTP
                'email_verified' => true, // OTP verification = email verification
                'email_verified_at' => now(),
                'school_setup_completed' => false,
                'subscription_active' => false,
                'status' => 'active',
            ];

            $user = User::create($userData);

            // Send welcome email with credentials
            try {
                $plainPassword = $registrationData['full_name'] . '2026';
                $subject = 'Welcome to School Management System - Your Account Credentials';
                $message = "Hello {$registrationData['full_name']},\n\n";
                $message .= "Your administrator account has been successfully verified and created.\n\n";
                $message .= "Here are your login credentials to continue your school setup:\n";
                $message .= "Email: {$registrationData['email']}\n";
                $message .= "Password: {$plainPassword}\n\n";
                $message .= "Please login and change your password as soon as possible.\n\n";
                $message .= "Best regards,\n";
                $message .= "School Management Team";

                $this->emailService->sendRaw($registrationData['email'], $subject, $message);
                Log::info("Sent welcome email with credentials to new administrator: {$registrationData['email']}");
            } catch (Exception $e) {
                Log::warning("Failed to send welcome credentials email: " . $e->getMessage());
            }


            // Generate JWT token for the user
            $token = JWTHelper::generateToken($user);

            // Clear OTP from cache
            Cache::forget($cacheKey);

            DB::commit();

            return [
                'status' => true,
                'message' => 'Registration successful. Complete your school setup to continue.',
                'data' => [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'role' => $user->role,
                    'email_verified' => true,
                    'school_setup_completed' => false,
                ],
                'token' => $token, // Include JWT token for school setup
            ];

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('OTP verification and registration failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Registration failed. Please try again.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * OLD FLOW - Step 1: Register user with personal details
     */
    public function registerUser(array $data): array
    {
        try {
            DB::beginTransaction();

            // Check if email already exists
            $existingUser = User::where('email', $data['email'])->first();
            if ($existingUser) {
                return [
                    'status' => false,
                    'message' => 'Email already registered.',
                    'data' => null,
                ];
            }

            // Create user
            $userData = [
                'full_name' => $data['full_name'],
                'username' => $data['email'], // Use email as username initially
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'],
                'role' => $data['role'] ?? 'principal',
                'registration_status' => 'pending_verification',
                'email_verified' => false,
                'school_setup_completed' => false,
                'subscription_active' => false,
                'status' => 'active',
                'verification_token' => Str::random(64),
            ];

            $user = User::create($userData);

            // Send verification email
            try {
                $this->emailService->sendVerificationEmail($user);
            } catch (Exception $e) {
                Log::warning('Verification email failed: ' . $e->getMessage());
                // Continue anyway - user can resend
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Registration successful. Please check your email to verify your account.',
                'data' => [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'next_step' => 'email_verification',
                ],
            ];

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('User registration failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Registration failed. Please try again.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Step 2: Verify email
     */
    public function verifyEmail(string $token): array
    {
        try {
            $user = User::where('verification_token', $token)->first();

            if (!$user) {
                return [
                    'status' => false,
                    'message' => 'Invalid verification token.',
                    'data' => null,
                ];
            }

            if ($user->email_verified) {
                return [
                    'status' => false,
                    'message' => 'Email already verified.',
                    'data' => ['user' => $user],
                ];
            }

            $user->update([
                'email_verified' => true,
                'email_verified_at' => now(),
                'registration_status' => 'pending_school_setup',
                'verification_token' => null,
            ]);

            return [
                'status' => true,
                'message' => 'Email verified successfully.',
                'data' => [
                    'user' => $user->fresh(),
                    'next_step' => 'school_setup',
                ],
            ];

        } catch (Exception $e) {
            Log::error('Email verification failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Verification failed.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Step 3: Register school
     */
    public function registerSchool(int $userId, array $schoolData): array
    {
        try {
            DB::beginTransaction();

            $user = User::find($userId);

            if (!$user) {
                return [
                    'status' => false,
                    'message' => 'User not found.',
                    'data' => null,
                ];
            }

            if (!$user->email_verified) {
                return [
                    'status' => false,
                    'message' => 'Email not verified. Please verify your email first.',
                    'data' => null,
                ];
            }

            // Only administrators can register schools in this flow
            if ($user->role !== 'administrator') {
                return [
                    'status' => false,
                    'message' => 'Only administrators can register schools.',
                    'data' => null,
                ];
            }

            // Add administrator_id to school data
            $schoolData['administrator_id'] = $userId;

            // Create school
            $school = $this->schoolRepository->create($schoolData);

            if (!$school) {
                DB::rollBack();
                return [
                    'status' => false,
                    'message' => 'Failed to create school.',
                    'data' => null,
                ];
            }

            // If principal details are provided, create a principal user
            $principalUser = null;
            if (!empty($schoolData['principal_email']) && !empty($schoolData['principal_name'])) {
                try {
                    // Check if principal email already exists
                    $existingPrincipal = User::where('email', $schoolData['principal_email'])->first();

                    if (!$existingPrincipal) {
                        // Generate default password: principalName + 2026
                        $generatedPassword = $schoolData['principal_name'] . '2026';

                        // Create principal user
                        $principalUser = User::create([
                            'full_name' => $schoolData['principal_name'],
                            'username' => $schoolData['principal_email'], // Use email as username
                            'email' => $schoolData['principal_email'],
                            'password' => Hash::make($generatedPassword),
                            'phone' => $schoolData['principal_phone'] ?? null,
                            'role' => 'principal',
                            'school_id' => $school->id,
                            'administrator_id' => $userId,
                            'assignment_status' => 'assigned',
                            'registration_status' => 'active',
                            'email_verified' => true,
                            'email_verified_at' => now(),
                            'school_setup_completed' => true,
                            'subscription_active' => true, // Inherit from school's subscription
                            'status' => 'active',
                        ]);

                        // Send credentials to principal via email
                        try {
                            $subject = 'Your Principal Account Credentials - School Management System';
                            $message = "Hello {$schoolData['principal_name']},\n\n";
                            $message .= "A principal account has been created for you at {$school->name}.\n\n";
                            $message .= "Your login credentials are:\n";
                            $message .= "Email: {$schoolData['principal_email']}\n";
                            $message .= "Password: {$generatedPassword}\n\n";
                            $message .= "Please login and change your password immediately.\n\n";
                            $message .= "Best regards,\n";
                            $message .= "School Management Team";

                            $this->emailService->sendRaw($schoolData['principal_email'], $subject, $message);

                            Log::info("Principal user created and credentials sent for school: {$school->name} (Principal Email: {$schoolData['principal_email']})");
                        } catch (Exception $e) {
                            Log::warning("Principal user created but failed to send credentials email: " . $e->getMessage());
                        }
                    } else {
                        Log::info("Principal email already exists, skipping principal user creation: {$schoolData['principal_email']}");
                    }
                } catch (Exception $e) {
                    Log::error("Failed to create principal user during school registration: " . $e->getMessage());
                    // Don't fail the entire school registration, just log the error
                }
            }

            // Update user with school_id and mark setup as completed
            $user->update([
                'school_id' => $school->id,
                'school_setup_completed' => true,
                'registration_status' => 'pending_subscription',
            ]);

            DB::commit();

            Log::info("School registered successfully for administrator: {$user->email} (User ID: {$userId}, School ID: {$school->id})");

            return [
                'status' => true,
                'message' => 'School registered successfully.' . ($principalUser ? ' Principal user created and credentials sent via email.' : ''),
                'data' => [
                    'school' => $school,
                    'user' => $user->fresh(),
                    'principal_created' => $principalUser !== null,
                    'next_step' => 'subscription_selection',
                ],
            ];

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('School registration failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'School registration failed.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get registration progress
     */
    public function getProgress(int $userId): array
    {
        try {
            $user = User::find($userId);

            if (!$user) {
                return [
                    'status' => false,
                    'message' => 'User not found.',
                    'data' => null,
                ];
            }

            $nextStep = $this->determineNextStep($user);

            return [
                'status' => true,
                'data' => [
                    'email_verified' => $user->email_verified,
                    'school_setup_completed' => $user->school_setup_completed,
                    'subscription_active' => $user->subscription_active,
                    'registration_status' => $user->registration_status,
                    'next_step' => $nextStep,
                    'progress_percentage' => $this->calculateProgress($user),
                ],
            ];

        } catch (Exception $e) {
            Log::error('Get progress failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch progress.',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Resend verification email
     */
    public function resendVerificationEmail(string $email): array
    {
        try {
            $user = User::where('email', $email)->first();

            if (!$user) {
                return [
                    'status' => false,
                    'message' => 'User not found.',
                ];
            }

            if ($user->email_verified) {
                return [
                    'status' => false,
                    'message' => 'Email already verified.',
                ];
            }

            // Generate new token if needed
            if (!$user->verification_token) {
                $user->update(['verification_token' => Str::random(64)]);
            }

            $this->emailService->sendVerificationEmail($user->fresh());

            return [
                'status' => true,
                'message' => 'Verification email sent successfully.',
            ];

        } catch (Exception $e) {
            Log::error('Resend verification failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to resend verification email.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Helper: Determine next step for user
     */
    private function determineNextStep(User $user): string
    {
        if (!$user->email_verified) return 'verify_email';
        if (!$user->school_setup_completed) return 'setup_school';
        if (!$user->subscription_active) return 'select_plan';
        return 'access_dashboard';
    }

    /**
     * Helper: Calculate progress percentage
     */
    private function calculateProgress(User $user): int
    {
        $progress = 0;
        if ($user->email_verified) $progress += 33;
        if ($user->school_setup_completed) $progress += 33;
        if ($user->subscription_active) $progress += 34;
        return $progress;
    }

    /**
     * Cleanup incomplete registrations
     * Deletes users who registered but didn't complete school setup within given hours
     *
     * @param int $hoursOld Number of hours to consider registration as abandoned (default: 24 hours)
     * @return array Result with count of deleted users
     */
    public function cleanupIncompleteRegistrations(int $hoursOld = 24): array
    {
        try {
            DB::beginTransaction();

            // Find users who:
            // 1. Are administrators
            // 2. Have email_verified = true
            // 3. Have school_setup_completed = false
            // 4. Created more than $hoursOld hours ago
            $cutoffTime = now()->subHours($hoursOld);

            $incompleteUsers = User::where('role', 'administrator')
                ->where('email_verified', true)
                ->where('school_setup_completed', false)
                ->where('created_at', '<', $cutoffTime)
                ->get();

            $deletedCount = 0;
            $skippedCount = 0;
            $deletedEmails = [];
            $skippedEmails = [];

            foreach ($incompleteUsers as $user) {
                /** @var \App\Models\User $user */
                // Safety check: Ensure user has no related critical data
                if ($this->userHasCriticalDependencies($user)) {
                    Log::warning("Skipping cleanup for user {$user->email} (ID: {$user->id}) - has related data");
                    $skippedCount++;
                    $skippedEmails[] = $user->email;
                    continue;
                }

                // Log the deletion
                Log::info("Cleaning up incomplete registration for user: {$user->email} (ID: {$user->id})");

                $deletedEmails[] = $user->email;
                $user->delete();
                $deletedCount++;
            }

            DB::commit();

            $message = "Cleaned up {$deletedCount} incomplete registration(s).";
            if ($skippedCount > 0) {
                $message .= " Skipped {$skippedCount} user(s) with existing data.";
            }

            return [
                'status' => true,
                'message' => $message,
                'data' => [
                    'deleted_count' => $deletedCount,
                    'deleted_emails' => $deletedEmails,
                    'skipped_count' => $skippedCount,
                    'skipped_emails' => $skippedEmails,
                ],
            ];

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Cleanup incomplete registrations failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Cleanup failed.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Cancel a specific user's incomplete registration
     *
     * @param int $userId The user ID to cancel
     * @return array Result of cancellation
     */
    public function cancelIncompleteRegistration(int $userId): array
    {
        try {
            DB::beginTransaction();

            $user = User::find($userId);

            if (!$user) {
                return [
                    'status' => false,
                    'message' => 'User not found.',
                ];
            }

            // Only allow cancellation of incomplete registrations
            if ($user->school_setup_completed) {
                return [
                    'status' => false,
                    'message' => 'Cannot cancel completed registration.',
                ];
            }

            // Only allow cancellation for administrators
            if ($user->role !== 'administrator') {
                return [
                    'status' => false,
                    'message' => 'Can only cancel administrator registrations.',
                ];
            }

            // Safety check: Prevent deletion if user has critical dependencies
            if ($this->userHasCriticalDependencies($user)) {
                return [
                    'status' => false,
                    'message' => 'Cannot cancel registration. User has existing data (subscriptions, payments, etc.).',
                ];
            }

            $email = $user->email;
            $user->delete();

            DB::commit();

            Log::info("User cancelled their incomplete registration: {$email} (ID: {$userId})");

            return [
                'status' => true,
                'message' => 'Registration cancelled successfully.',
                'data' => [
                    'email' => $email,
                ],
            ];

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Cancel registration failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to cancel registration.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Migrate existing principal data from schools to principal users
     * This creates principal user accounts for schools that have principal details
     * but no corresponding principal user in the system
     *
     * @return array Result with count of created principals
     */
    public function migratePrincipalsFromSchools(): array
    {
        try {
            DB::beginTransaction();

            // Get all schools that have principal details but no principal user assigned
            $schools = DB::table('schools')
                ->whereNotNull('principal_email')
                ->whereNotNull('principal_name')
                ->whereNotNull('administrator_id')
                ->get();

            $createdCount = 0;
            $skippedCount = 0;
            $createdPrincipals = [];
            $skippedReasons = [];

            foreach ($schools as $school) {
                // Check if a principal user already exists for this email
                $existingPrincipal = User::where('email', $school->principal_email)->first();

                if ($existingPrincipal) {
                    $skippedCount++;
                    $skippedReasons[] = "Email already exists: {$school->principal_email} for school: {$school->name}";
                    Log::info("Skipping principal creation for {$school->name} - email already exists: {$school->principal_email}");
                    continue;
                }

                // Generate default password: principalName + 2026
                $generatedPassword = $school->principal_name . '2026';

                try {
                    // Create principal user
                    $principalUser = User::create([
                        'full_name' => $school->principal_name,
                        'username' => $school->principal_email,
                        'email' => $school->principal_email,
                        'password' => Hash::make($generatedPassword),
                        'phone' => $school->principal_phone ?? null,
                        'role' => 'principal',
                        'school_id' => $school->id,
                        'administrator_id' => $school->administrator_id,
                        'assignment_status' => 'assigned',
                        'registration_status' => 'active',
                        'email_verified' => true,
                        'email_verified_at' => now(),
                        'school_setup_completed' => true,
                        'subscription_active' => true,
                        'status' => 'active',
                    ]);

                    // Send credentials to principal via email
                    try {
                        $subject = 'Your Principal Account Credentials - School Management System';
                        $message = "Hello {$school->principal_name},\n\n";
                        $message .= "A principal account has been created for you at {$school->name}.\n\n";
                        $message .= "Your login credentials are:\n";
                        $message .= "Email: {$school->principal_email}\n";
                        $message .= "Password: {$generatedPassword}\n\n";
                        $message .= "Please login and change your password immediately.\n\n";
                        $message .= "Best regards,\n";
                        $message .= "School Management Team";

                        $this->emailService->sendRaw($school->principal_email, $subject, $message);
                    } catch (Exception $e) {
                        Log::warning("Principal user created but failed to send credentials email: " . $e->getMessage());
                    }

                    $createdCount++;
                    $createdPrincipals[] = [
                        'school_name' => $school->name,
                        'principal_name' => $school->principal_name,
                        'principal_email' => $school->principal_email,
                    ];

                    Log::info("Migrated principal user for school: {$school->name} (Email: {$school->principal_email})");
                } catch (Exception $e) {
                    $skippedCount++;
                    $skippedReasons[] = "Error creating principal for {$school->name}: " . $e->getMessage();
                    Log::error("Failed to migrate principal for school {$school->name}: " . $e->getMessage());
                }
            }

            DB::commit();

            $message = "Successfully migrated {$createdCount} principal(s) from school records to user accounts.";
            if ($skippedCount > 0) {
                $message .= " Skipped {$skippedCount} record(s).";
            }

            return [
                'status' => true,
                'message' => $message,
                'data' => [
                    'total_schools_checked' => $schools->count(),
                    'created_count' => $createdCount,
                    'created_principals' => $createdPrincipals,
                    'skipped_count' => $skippedCount,
                    'skipped_reasons' => $skippedReasons,
                ],
            ];

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Migrate principals from schools failed: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Migration failed.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check if user has critical dependencies that prevent deletion
     *
     * @param User $user
     * @return bool True if user has dependencies, false otherwise
     */
    private function userHasCriticalDependencies(User $user): bool
    {
        // Check if user has any schools assigned
        if ($user->school_id) {
            return true;
        }

        // Check if user has any schools they manage (administrator)
        if (DB::table('schools')->where('administrator_id', $user->id)->exists()) {
            return true;
        }

        // Check if user has subscriptions (as subscribed_by)
        if (DB::table('subscriptions')->where('subscribed_by', $user->id)->exists()) {
            return true;
        }

        // Check if user has payment transactions
        if (DB::table('payment_transactions')->where('user_id', $user->id)->exists()) {
            return true;
        }

        // Check if user has subscription history entries (as changed_by)
        if (DB::table('subscription_history')->where('changed_by', $user->id)->exists()) {
            return true;
        }

        // Check if user is referenced in teachers table
        if (DB::table('teachers')->where('user_id', $user->id)->exists()) {
            return true;
        }

        // Check if user is referenced in parents table
        if (DB::table('parents')->where('user_id', $user->id)->exists()) {
            return true;
        }

        // No critical dependencies found
        return false;
    }
}

