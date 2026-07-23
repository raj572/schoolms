<?php

namespace App\Http\Middleware;

use App\Helpers\JWTHelper;
use App\Models\ParentModel;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Student;
use App\Models\SuperAdmin;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class JWTAuthentication
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // 🔹 1. Get Bearer token from the Authorization header
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Access token is missing. Please provide a valid token.'
            ], 401);
        }

        // 🔹 2. Verify JWT using your JWTHelper
        $verification = JWTHelper::verifyToken($token);

        if (!$verification['success']) {
            $message = $verification['message'];

            // Choose appropriate HTTP code
            $statusCode = match (true) {
                str_contains($message, 'expired') => 403,
                str_contains($message, 'signature') => 401,
                str_contains($message, 'structure') => 400,
                default => 401,
            };

            return response()->json([
                'success' => false,
                'message' => $message,
            ], $statusCode);
        }

        // 🔹 3. Extract payload data
        $payload = $verification['data'];

        $user = null;

        // 🔹 4. Identify the correct user model based on role or type
        // Check if this is a super admin (identified by type field or role)
        if ((isset($payload->type) && $payload->type === 'super_admin') ||
            (isset($payload->role) && $payload->role === 'super_admin')) {
            $user = SuperAdmin::find($payload->user_id);
        }
        // Regular users based on role
        elseif (isset($payload->role)) {
            if ($payload->role === 'student') {
                $user = Student::find($payload->user_id);
            } elseif ($payload->role === 'parent') {
                $user = ParentModel::find($payload->user_id);
            } elseif ($payload->role === 'teacher') {
                $user = Teacher::find($payload->user_id);
            } else {
                $user = User::find($payload->user_id);
            }
        } else {
            // Fallback to User model if no role specified
            $user = User::find($payload->user_id);
        }

        if (!$user) {
            Log::warning('JWTAuthentication: User not found for user_id ' . json_encode($payload) . ' and role ' . ($payload->role ?? 'unknown'));
            return response()->json([
                'success' => false,
                'message' => 'User associated with this token was not found.'
            ], 404);
        }

        // 🔹 5. Attach user and payload to the request (stateless)
        $request->merge([
            'auth_user'   => $user ? $user->toArray() : null,
            'jwt_payload' => json_decode(json_encode($payload), true),
        ]);

        // ✅ No Auth::login() — JWT is stateless, no sessions are used.
        return $next($request);
    }
}
