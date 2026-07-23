<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Subscription;
use Illuminate\Support\Facades\Auth;

class SubscriptionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Get user from JWT middleware (attached to request)
        $authUserArray = $request->input('auth_user');

        if (!$authUserArray) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated.',
                'redirect' => '/login',
            ], 401);
        }

        // Convert array to User model for compatibility
        $user = \App\Models\User::find($authUserArray['id']);

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated.',
                'redirect' => '/login',
            ], 401);
        }

        // Check 1: Email verification
        if (!$user->email_verified) {
            return response()->json([
                'status' => false,
                'message' => 'Please verify your email first.',
                'redirect' => '/verify-email',
                'registration_step' => 'email_verification',
            ], 403);
        }

        // Check 2: School setup
        if (!$user->school_setup_completed) {
            return response()->json([
                'status' => false,
                'message' => 'Please complete school setup first.',
                'redirect' => '/setup-school',
                'registration_step' => 'school_setup',
            ], 403);
        }

        // Check 3: Verify actual subscription in database first (real-time check)
        $subscription = null;
        if ($user->school_id) {
            $subscription = Subscription::where('school_id', $user->school_id)
                ->whereIn('status', ['active', 'trial'])
                ->where('end_date', '>=', now())
                ->first();

            if (!$subscription) {
                // Subscription expired or not found
                // Update user status to keep it in sync
                $user->update([
                    'subscription_active' => false,
                    'registration_status' => 'suspended',
                ]);

                return response()->json([
                    'status' => false,
                    'message' => 'Your subscription has expired. Please renew to continue.',
                    'redirect' => '/pricing',
                    'subscription_status' => 'expired',
                ], 403);
            }
            
            // If subscription is active in DB but user flag is false, update it
            if (!$user->subscription_active && $subscription) {
                $user->update([
                    'subscription_active' => true,
                ]);
            }
        } else {
            // No school assigned yet
            if (!$user->subscription_active) {
                return response()->json([
                    'status' => false,
                    'message' => 'No active subscription. Please select a plan.',
                    'redirect' => '/pricing',
                    'registration_step' => 'subscription_selection',
                ], 403);
            }
        }

        // Check if trial has ended
        if ($subscription && $subscription->status === 'trial' && $subscription->trial_end_date) {
            if ($subscription->trial_end_date->isPast()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Your trial period has ended. Please subscribe to continue.',
                    'redirect' => '/pricing',
                    'subscription_status' => 'trial_ended',
                ], 403);
            }
        }

        // Attach subscription to request for use in controllers
        if ($subscription) {
            $request->merge([
                'subscription' => $subscription,
                'subscription_plan' => $subscription->plan,
            ]);
        }

        // All checks passed - allow access
        return $next($request);
    }
}

