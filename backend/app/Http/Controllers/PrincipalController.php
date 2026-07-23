<?php

namespace App\Http\Controllers;

use App\Services\PrincipalService;
use App\Services\PrincipalCommunicationService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;

class PrincipalController extends Controller
{
    protected $principalService;
    protected $principalCommunicationService;

    public function __construct(PrincipalService $principalService, PrincipalCommunicationService $principalCommunicationService)
    {
        $this->principalService = $principalService;
        $this->principalCommunicationService = $principalCommunicationService;
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

    /**
     * Get all principals
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->id : null;

            $principals = $this->principalService->getAllPrincipals($administratorId);

            return response()->json([
                'status' => true,
                'data' => $principals
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch principals',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get paginated principals
     */
    public function paginated(Request $request): JsonResponse
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->id : null;

            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);
            $search = $request->input('search', '');
            $status = $request->input('status', null);

            $principals = $this->principalService->getPaginatedPrincipals($perPage, $page, $search, $status, $administratorId);

            return response()->json([
                'status' => true,
                'data' => $principals
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch principals',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific principal by ID
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->id : null;

            $principal = $this->principalService->getPrincipalById($id, $administratorId);

            if (!$principal) {
                return response()->json([
                    'status' => false,
                    'message' => 'Principal not found or you do not have access'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'data' => $principal
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch principal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get principals without assigned schools
     */
    public function unassigned(Request $request): JsonResponse
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->id : null;

            $principals = $this->principalService->getUnassignedPrincipals($administratorId);

            return response()->json([
                'status' => true,
                'data' => $principals
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch unassigned principals',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new principal
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);
            $administratorId = ($authUser && $authUser->role === 'administrator') ? $authUser->id : null;

            $validatedData = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'required|string|max:20',
                'username' => ['required', 'string', 'max:255', new \App\Rules\UniqueUsername()],
                'school_id' => 'nullable|exists:schools,id',
                'status' => 'nullable|in:active,inactive',
            ]);

            // Verify that if school_id is provided, it belongs to the administrator
            if (!empty($validatedData['school_id']) && $administratorId) {
                $school = \App\Models\School::find($validatedData['school_id']);
                if (!$school || $school->administrator_id != $administratorId) {
                    return response()->json([
                        'status' => false,
                        'message' => 'You can only assign principals to your own schools'
                    ], 403);
                }
            }

            $result = $this->principalService->createPrincipal($validatedData, $administratorId);

            return response()->json([
                'status' => true,
                'message' => 'Principal created successfully and credentials sent to email',
                'data' => $result
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to create principal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a principal
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'full_name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:users,email,' . $id,
                'phone' => 'sometimes|required|string|max:20',
                'username' => ['sometimes', 'required', 'string', 'max:255', new \App\Rules\UniqueUsername($id, 'users')],
                'school_id' => 'nullable|exists:schools,id',
                'status' => 'sometimes|in:active,inactive',
            ]);

            $result = $this->principalService->updatePrincipal($id, $validatedData);

            if (!$result) {
                return response()->json([
                    'status' => false,
                    'message' => 'Principal not found'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Principal updated successfully',
                'data' => $result
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update principal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a principal
     */
    public function destroy($id): JsonResponse
    {
        try {
            $result = $this->principalService->deletePrincipal($id);

            if (!$result) {
                return response()->json([
                    'status' => false,
                    'message' => 'Principal not found'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Principal deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete principal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign principal to school
     */
    public function assignToSchool(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'principal_id' => 'required|exists:users,id',
                'school_id' => 'required|exists:schools,id',
            ]);

            $result = $this->principalService->assignPrincipalToSchool(
                $validatedData['principal_id'],
                $validatedData['school_id']
            );

            return response()->json([
                'status' => true,
                'message' => 'Principal assigned to school successfully',
                'data' => $result
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to assign principal to school',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Unassign principal from school
     */
    public function unassignFromSchool($principalId): JsonResponse
    {
        try {
            $result = $this->principalService->unassignPrincipalFromSchool($principalId);

            return response()->json([
                'status' => true,
                'message' => 'Principal unassigned from school successfully',
                'data' => $result
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to unassign principal from school',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle principal status
     */
    public function toggleStatus($id): JsonResponse
    {
        try {
            $result = $this->principalService->toggleStatus($id);

            if (!$result) {
                return response()->json([
                    'status' => false,
                    'message' => 'Principal not found'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Principal status updated successfully',
                'data' => $result
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update principal status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resend credentials email
     */
    public function resendCredentials($id): JsonResponse
    {
        try {
            $result = $this->principalService->resendCredentials($id);

            if (!$result) {
                return response()->json([
                    'status' => false,
                    'message' => 'Failed to resend credentials'
                ], 500);
            }

            return response()->json([
                'status' => true,
                'message' => 'Credentials sent successfully to principal email'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to resend credentials',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset principal password
     */
    public function resetPassword($id): JsonResponse
    {
        try {
            $result = $this->principalService->resetPassword($id);

            if (!$result) {
                return response()->json([
                    'status' => false,
                    'message' => 'Principal not found'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Password reset successfully and sent to principal email',
                'data' => $result
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to reset password',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get administrator details for principal contact
     */
    public function getAdministratorDetails(Request $request, $administratorId): JsonResponse
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);

            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            // Verify the principal is trying to contact their own administrator
            if ($authUser->role === 'principal' && $authUser->administrator_id != $administratorId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Access denied. You can only view your own administrator details.'
                ], 403);
            }

            // Get administrator details
            $administrator = User::where('id', $administratorId)
                ->where('role', 'administrator')
                ->select('id', 'full_name', 'username', 'email', 'phone', 'administrator_id')
                ->first();

            if (!$administrator) {
                return response()->json([
                    'status' => false,
                    'message' => 'Administrator not found'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Administrator details retrieved successfully',
                'data' => $administrator
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching administrator details: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve administrator details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Notify administrator about subscription request from principal
     */
    public function requestSubscription(Request $request): JsonResponse
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);

            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            // Only principals can request subscription
            if ($authUser->role !== 'principal') {
                return response()->json([
                    'status' => false,
                    'message' => 'Only principals can request subscription'
                ], 403);
            }

            // Get the school for this principal
            // Principal's school_id links them to their school
            $school = \App\Models\School::find($authUser->school_id);

            if (!$school) {
                return response()->json([
                    'status' => false,
                    'message' => 'Principal not assigned to any school'
                ], 404);
            }

            // Get administrator details
            $administratorId = $authUser->administrator_id;
            $administrator = User::where('id', $administratorId)->first();

            if (!$administrator) {
                return response()->json([
                    'status' => false,
                    'message' => 'Administrator not found'
                ], 404);
            }

            // Create a notice/notification for the administrator
            Log::info("Creating notice for administrator. Principal: {$authUser->id}, School: {$school->id}");

            $notice = \App\Models\Notice::create([
                'school_id' => $school->id,
                'title' => 'Subscription Activation Request',
                'content' => "Principal {$authUser->full_name} ({$authUser->email}) has requested subscription activation for {$school->name} (Code: {$school->school_code}). Please activate a subscription plan to enable full features.",
                'type' => 'urgent',
                'priority' => 'high',
                'target_roles' => json_encode(['administrator']),
                'publish_date' => now()->toDateString(),
                'is_active' => true,
                'created_by' => $authUser->id,
                'created_by_role' => 'principal',
            ]);

            Log::info("Notice created successfully. Notice ID: {$notice->id}");

            // Also try to get the PrincipalService instance to trigger a notification
            try {
                // You can add email notification here if needed
                // \App\Services\MailService::sendSubscriptionRequestNotification($administrator, $authUser, $school);
            } catch (Exception $e) {
                Log::warning('Could not send email notification: ' . $e->getMessage());
            }

            Log::info("Principal {$authUser->id} requested subscription for school {$school->id}");

            return response()->json([
                'status' => true,
                'message' => 'Your subscription request has been sent to the administrator',
                'data' => [
                    'notice_id' => $notice->id,
                    'school_name' => $school->name,
                    'administrator_name' => $administrator->full_name
                ]
            ]);
        } catch (Exception $e) {
            Log::error('Error requesting subscription: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to send subscription request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get message permissions for a principal
     */
    public function getMessagePermissions($id): JsonResponse
    {
        try {
            $result = $this->principalCommunicationService->getMessagePermissions($id);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("PrincipalController::getMessagePermissions - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to get message permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update message permissions for a principal
     */
    public function updateMessagePermissions(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'school_id' => 'nullable|exists:schools,id',
                'allow_from_teachers' => 'sometimes|boolean',
                'allow_from_parents' => 'sometimes|boolean',
                'allow_from_students' => 'sometimes|boolean',
                'allow_from_administrator' => 'sometimes|boolean',
            ]);

            $result = $this->principalCommunicationService->updateMessagePermissions($id, $validated);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("PrincipalController::updateMessagePermissions - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update message permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get communication statistics for a principal
     */
    public function getCommunicationStats($id): JsonResponse
    {
        try {
            $result = $this->principalCommunicationService->getCommunicationStats($id);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("PrincipalController::getCommunicationStats - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to get communication statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

