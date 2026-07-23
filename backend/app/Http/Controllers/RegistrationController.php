<?php

namespace App\Http\Controllers;

use App\Services\RegistrationService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Exception;

class RegistrationController extends Controller
{
    protected $registrationService;

    public function __construct(RegistrationService $registrationService)
    {
        $this->registrationService = $registrationService;
    }

    /**
     * NEW FLOW - Step 1: Send OTP for registration
     * POST /api/auth/send-registration-otp
     */
    public function sendRegistrationOTP(Request $request)
    {
        try {
            $validated = $request->validate([
                'full_name' => 'required|string|max:100',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:15',
            ]);

            $result = $this->registrationService->sendRegistrationOTP($validated);

            return response()->json($result, $result['status'] ? 200 : 400);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Send registration OTP failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to send OTP.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * NEW FLOW - Step 2: Verify OTP and complete registration
     * POST /api/auth/verify-otp-and-register
     */
    public function verifyOTPAndRegister(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'otp' => 'required|string|size:6',
            ]);

            $result = $this->registrationService->verifyOTPAndRegister($validated);

            return response()->json($result, $result['status'] ? 201 : 400);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Verify OTP and register failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Registration failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * OLD FLOW - Step 1: Register user with personal details
     * POST /api/auth/register
     */
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'full_name' => 'required|string|max:100',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:15',
                'role' => 'sometimes|in:principal,administrator',
            ]);

            $result = $this->registrationService->registerUser($validated);

            return response()->json($result, $result['status'] ? 201 : 400);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Registration failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Registration failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Step 2: Verify email with token
     * POST /api/auth/verify-email
     */
    public function verifyEmail(Request $request)
    {
        try {
            $validated = $request->validate([
                'token' => 'required|string',
            ]);

            $result = $this->registrationService->verifyEmail($validated['token']);

            return response()->json($result, $result['status'] ? 200 : 400);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Email verification failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Verification failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Step 3: Register school details
     * POST /api/registration/school/{userId}
     */
    public function registerSchool(Request $request, $userId)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'email' => 'required|email|unique:schools,email',
                'phone' => 'required|string|max:15',
                'school_code' => 'nullable|string|max:50|unique:schools,school_code',
                'address' => 'required|string|max:255',
                'city' => 'required|string|max:50',
                'state' => 'required|string|max:50',
                'country' => 'required|string|max:50',
                'pincode' => 'required|string|max:10',
                'board' => 'required|string|max:50',
                'affiliation_number' => 'nullable|string|max:100',
                'established_date' => 'required|date',
                'website' => 'nullable|url|max:255',
                'description' => 'nullable|string',
                'principal_name' => 'nullable|string|max:100',
                'principal_email' => 'nullable|email',
                'principal_phone' => 'nullable|string|max:15',
                'logo_path' => 'nullable|string',
            ]);

            $validated['status'] = 'active'; // Set default status

            $result = $this->registrationService->registerSchool($userId, $validated);

            return response()->json($result, $result['status'] ? 201 : 400);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('School registration failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'School registration failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get registration progress for user
     * GET /api/registration/progress/{userId}
     */
    public function getProgress($userId)
    {
        try {
            $result = $this->registrationService->getProgress($userId);

            return response()->json($result, $result['status'] ? 200 : 404);

        } catch (Exception $e) {
            Log::error('Get progress failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch progress.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Resend verification email
     * POST /api/auth/resend-verification
     */
    public function resendVerification(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
            ]);

            $result = $this->registrationService->resendVerificationEmail($validated['email']);

            return response()->json($result, $result['status'] ? 200 : 400);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Resend verification failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to resend verification email.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel incomplete registration
     * DELETE /api/registration/cancel/{userId}
     *
     * Allows a user to cancel their incomplete registration if they haven't
     * completed school setup yet. This will delete their user account.
     */
    public function cancelRegistration($userId)
    {
        try {
            $result = $this->registrationService->cancelIncompleteRegistration($userId);

            return response()->json($result, $result['status'] ? 200 : 400);

        } catch (Exception $e) {
            Log::error('Cancel registration failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to cancel registration.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}

