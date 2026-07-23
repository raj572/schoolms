<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use App\Helpers\JWTHelper;
use Illuminate\Http\Request;
use App\Services\AuthService;
use Exception;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function registerUser(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'email' => 'required|string|email|max:100|unique:users,email',
                'password' => 'required|string|min:8|max:100',
            ]);

            $user = $this->authService->registerUser($validated);
            if (!$user['status']) {
                return response()->json([
                    'status' => false,
                    'message' => $user['message']
                ], 400);
            }
            return response()->json([
                'status' => true,
                'message' => 'User registered successfully',
                'data' => $user['data']
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Simple login for newly registered users (no school_id required)
     * POST /api/auth/login
     */
    public function simpleLogin(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|string|email|max:100',
                'password' => 'required|string|max:100'
            ]);

            $user = $this->authService->simpleLogin($validated);
            if (!$user['status']) {
                return response()->json([
                    'status' => false,
                    'message' => $user['message']
                ], 401);
            }
            return response()->json([
                'status' => true,
                'message' => $user['message'],
                'data' => $user['data'],
                'token' => $user['token']
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login with school_id (for existing users)
     * POST /api/auth/login/{school_id}
     */
    public function login(Request $request, $school_id)
    {
        try {
            // Validate school_id parameter
            $school_id = (int) $school_id;
            if ($school_id <= 0) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid school ID'
                ], 400);
            }

            $validated = $request->validate([
                'role' => 'required|string|in:student,parent,teacher,administrator,accountant,principal,librarian,warden',
                'email' => 'required|string|email|max:100',
                'password' => 'required|string|max:100'
            ]);

            $user = $this->authService->login($validated, $school_id);
            if (!$user['status']) {
                return response()->json([
                    'status' => false,
                    'message' => $user['message']
                ], 401);
            }
            return response()->json([
                'status' => true,
                'message' => $user['message'],
                'token' => $user['token']
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUser(Request $request)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json([
                'status' => false,
                'message' => 'Authorization token missing or invalid',
            ], 401);
        }

        $token = substr($authHeader, 7);

        // 🔹 Verify token
        $verification = JWTHelper::verifyToken($token);

        if (!$verification['success']) {
            return response()->json([
                'status' => false,
                'message' => $verification['message'],
            ], 401);
        }

        // 🔹 Extract actual payload
        $payload = $verification['data']; // This is the real JWT payload object

        try {
            // 🔹 Pass only payload (not the whole verification array)
            $userdata = $this->authService->getUser($payload);

            // If service returned a wrapped structure, just forward it
            return response()->json([
                'status' => $userdata['status'],
                'message' => $userdata['message'],
                'data' => $userdata['data'],
            ], $userdata['status'] ? 200 : 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error retrieving user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getSchoolList()
    {
        try {
            $result = $this->authService->getSchoolList();

            if (!$result['status']) {
                return response()->json([
                    'status' => false,
                    'message' => $result['message']
                ], 401);
            }

            return response()->json([
                'status' => true,
                'message' => 'School list fetched successfully',
                'data' => $result['data']
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch school list',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function verifyForOtp(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'role' => 'required|string|in:student,parent,teacher,administrator,accountant,principal,librarian,warden',
                'school_id' => 'required|integer|exists:schools,id'
            ]);

            // Call the new, improved service method
            $result = $this->authService->sendOtpForPasswordReset($validated);

            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'A server error occurred while processing the OTP request.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'otp' => 'required|string',
                'newPassword' => 'required|string|min:8|max:100',
                'role' => 'required|string|in:student,parent,teacher,administrator,accountant,principal,librarian,warden',
                'school_id' => 'required|integer|exists:schools,id'
            ]);

            $result = $this->authService->changePassword($validated);

            if (!$result['status']) {
                return response()->json([
                    'status' => false,
                    'message' => $result['message']
                ], 401);
            }

            return response()->json([
                'status' => true,
                'message' => $result['message']
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Password change failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
