<?php

namespace App\Http\Controllers;

use App\Models\SuperAdmin;
use App\Helpers\JWTHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Exception;

class SuperAdminAuthController extends Controller
{
    /**
     * Super Admin Login
     * POST /api/super-admin/auth/login
     */
    public function login(Request $request)
    {
        Log::info('=== SUPER ADMIN LOGIN ATTEMPT ===');
        Log::info('Request URL: ' . $request->fullUrl());
        Log::info('Request Method: ' . $request->method());
        Log::info('Request Body: ' . json_encode($request->all()));

        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            Log::info('Validation passed. Looking up super admin with email: ' . $validated['email']);
            $superAdmin = SuperAdmin::where('email', $validated['email'])->first();

            if (!$superAdmin) {
                Log::warning('Super admin not found for email: ' . $validated['email']);
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid credentials.',
                ], 401);
            }

            Log::info('Login attempt for: ' . $superAdmin->email . ', Password hash length: ' . strlen($superAdmin->password));
            Log::info('Password check result: ' . (Hash::check($validated['password'], $superAdmin->password) ? 'PASS' : 'FAIL'));

            if (!Hash::check($validated['password'], $superAdmin->password)) {
                Log::warning('Password check failed for: ' . $superAdmin->email);
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid credentials.',
                ], 401);
            }

            if (!$superAdmin->isActive()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Account is inactive or suspended.',
                ], 403);
            }

            // Update last login
            $superAdmin->updateLastLogin($request->ip());

            // Generate JWT token
            $token = JWTHelper::generateToken([
                'user_id' => $superAdmin->id,
                'email' => $superAdmin->email,
                'role' => 'super_admin',
                'type' => 'super_admin',
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Login successful.',
                'data' => [
                    'token' => $token,
                    'user' => [
                        'id' => $superAdmin->id,
                        'username' => $superAdmin->username,
                        'email' => $superAdmin->email,
                        'full_name' => $superAdmin->full_name,
                        'role' => 'super_admin',
                        'permissions' => $superAdmin->permissions,
                    ],
                ],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Super Admin login failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Login failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get authenticated super admin
     * GET /api/super-admin/auth/me
     */
    public function me(Request $request)
    {
        try {
            $payload = $request->get('jwt_payload');
            $superAdmin = SuperAdmin::find($payload['user_id']);

            if (!$superAdmin) {
                return response()->json([
                    'status' => false,
                    'message' => 'Super admin not found.',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'data' => [
                    'id' => $superAdmin->id,
                    'username' => $superAdmin->username,
                    'email' => $superAdmin->email,
                    'full_name' => $superAdmin->full_name,
                    'phone' => $superAdmin->phone,
                    'role' => 'super_admin',
                    'status' => $superAdmin->status,
                    'permissions' => $superAdmin->permissions,
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get super admin failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch user.',
            ], 500);
        }
    }

    /**
     * Change password
     * POST /api/super-admin/auth/change-password
     */
    public function changePassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            $payload = $request->get('jwt_payload');
            $superAdmin = SuperAdmin::find($payload['user_id']);

            if (!Hash::check($validated['current_password'], $superAdmin->password)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Current password is incorrect.',
                ], 401);
            }

            $superAdmin->update([
                'password' => Hash::make($validated['new_password']),
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Password changed successfully.',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Password change failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Password change failed.',
            ], 500);
        }
    }

    /**
     * Logout
     * POST /api/super-admin/auth/logout
     */
    public function logout()
    {
        return response()->json([
            'status' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Request password reset
     * POST /api/super-admin/auth/forgot-password
     */
    public function forgotPassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
            ]);

            $superAdmin = SuperAdmin::where('email', $validated['email'])->first();

            if (!$superAdmin) {
                // Don't reveal if email exists or not for security
                return response()->json([
                    'status' => true,
                    'message' => 'If your email exists in our system, you will receive a password reset link.',
                ]);
            }

            // Check if account is active
            if (!$superAdmin->isActive()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Account is inactive or suspended.',
                ], 403);
            }

            // Generate reset token
            $resetToken = Str::random(64);
            $expiresAt = now()->addHours(1); // Token valid for 1 hour

            // Store token in database
            $superAdmin->update([
                'password_reset_token' => $resetToken,
                'password_reset_expires_at' => $expiresAt,
            ]);

            // Send reset email
            try {
                $resetUrl = env('FRONTEND_URL', 'http://localhost:5173') . "/super-admin/reset-password?token={$resetToken}&email=" . urlencode($superAdmin->email);

                Mail::send('emails.super-admin-password-reset', [
                    'superAdmin' => $superAdmin,
                    'resetUrl' => $resetUrl,
                    'expiresAt' => $expiresAt->format('Y-m-d H:i:s'),
                ], function ($message) use ($superAdmin) {
                    $message->to($superAdmin->email)
                            ->subject('Password Reset Request - Eklavya Super Admin');
                });

                Log::info("Password reset email sent to super admin: {$superAdmin->email}");

            } catch (Exception $e) {
                Log::error("Failed to send password reset email: " . $e->getMessage());
                return response()->json([
                    'status' => false,
                    'message' => 'Failed to send reset email. Please try again later.',
                ], 500);
            }

            return response()->json([
                'status' => true,
                'message' => 'Password reset link has been sent to your email.',
                'data' => [
                    'reset_token' => $resetToken, // For testing/development only - remove in production
                ],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Forgot password failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Request failed.',
            ], 500);
        }
    }

    /**
     * Verify reset token
     * POST /api/super-admin/auth/verify-reset-token
     */
    public function verifyResetToken(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'token' => 'required|string',
            ]);

            $superAdmin = SuperAdmin::where('email', $validated['email'])
                ->where('password_reset_token', $validated['token'])
                ->first();

            if (!$superAdmin) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid or expired reset token.',
                ], 400);
            }

            // Check if token expired
            if (now()->isAfter($superAdmin->password_reset_expires_at)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Reset token has expired. Please request a new one.',
                ], 400);
            }

            return response()->json([
                'status' => true,
                'message' => 'Token is valid.',
                'data' => [
                    'email' => $superAdmin->email,
                    'expires_at' => $superAdmin->password_reset_expires_at,
                ],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Verify reset token failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Verification failed.',
            ], 500);
        }
    }

    /**
     * Reset password with token
     * POST /api/super-admin/auth/reset-password
     */
    public function resetPassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'token' => 'required|string',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $superAdmin = SuperAdmin::where('email', $validated['email'])
                ->where('password_reset_token', $validated['token'])
                ->first();

            if (!$superAdmin) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid or expired reset token.',
                ], 400);
            }

            // Check if token expired
            if (now()->isAfter($superAdmin->password_reset_expires_at)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Reset token has expired. Please request a new one.',
                ], 400);
            }

            // Update password and clear reset token
            $hashedPassword = Hash::make($validated['password']);
            Log::info("Resetting password for: {$superAdmin->email}, New hash length: " . strlen($hashedPassword));

            $superAdmin->update([
                'password' => $hashedPassword,
                'password_reset_token' => null,
                'password_reset_expires_at' => null,
            ]);

            // Verify the password was saved correctly
            $superAdmin->refresh();
            Log::info("Password saved. Verification check: " . (Hash::check($validated['password'], $superAdmin->password) ? 'PASS' : 'FAIL'));
            Log::info("Password reset successfully for super admin: {$superAdmin->email}");

            // Send confirmation email
            try {
                Mail::send('emails.super-admin-password-changed', [
                    'superAdmin' => $superAdmin,
                ], function ($message) use ($superAdmin) {
                    $message->to($superAdmin->email)
                            ->subject('Password Changed - Eklavya Super Admin');
                });
            } catch (Exception $e) {
                Log::warning("Failed to send password change confirmation email: " . $e->getMessage());
            }

            return response()->json([
                'status' => true,
                'message' => 'Password has been reset successfully. You can now login with your new password.',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Reset password failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Password reset failed.',
            ], 500);
        }
    }
}

