<?php

namespace App\Http\Controllers;

use App\Services\WardenService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

class WardenController extends Controller
{
    protected $wardenService;

    public function __construct(WardenService $wardenService)
    {
        $this->wardenService = $wardenService;
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
     * Get all wardens for a school
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser || !$authUser->school_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized or school not found'
                ], 403);
            }

            $wardens = $this->wardenService->getWardensBySchool($authUser->school_id);

            return response()->json([
                'status' => true,
                'data' => $wardens
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch wardens',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get paginated wardens
     */
    public function paginated(Request $request): JsonResponse
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser || !$authUser->school_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized or school not found'
                ], 403);
            }

            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);
            $search = $request->input('search', '');
            $status = $request->input('status', null);

            $wardens = $this->wardenService->getPaginatedWardens(
                $perPage, 
                $page, 
                $search, 
                $status, 
                $authUser->school_id
            );

            return response()->json([
                'status' => true,
                'data' => $wardens
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch wardens',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unassigned wardens
     */
    public function getUnassigned(Request $request): JsonResponse
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser || !$authUser->school_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized or school not found'
                ], 403);
            }

            $wardens = $this->wardenService->getUnassignedWardens($authUser->school_id);

            return response()->json([
                'status' => true,
                'data' => $wardens
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch unassigned wardens',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get warden by ID
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser || !$authUser->school_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized or school not found'
                ], 403);
            }

            $warden = $this->wardenService->getWardenById($id, $authUser->school_id);

            if (!$warden) {
                return response()->json([
                    'status' => false,
                    'message' => 'Warden not found'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'data' => $warden
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch warden',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new warden
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser || !$authUser->school_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized or school not found'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'required|string|max:20',
                'username' => ['required', 'string', 'max:255', new \App\Rules\UniqueUsername()],
                'status' => 'nullable|in:active,inactive',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $warden = $this->wardenService->createWarden($validator->validated(), $authUser->school_id);

            return response()->json([
                'status' => true,
                'message' => 'Warden created successfully and credentials sent to email',
                'data' => $warden
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to create warden',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a warden
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser || !$authUser->school_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized or school not found'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'full_name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $id,
                'phone' => 'sometimes|string|max:20',
                'username' => ['sometimes', 'string', 'max:255', new \App\Rules\UniqueUsername($id)],
                'status' => 'nullable|in:active,inactive',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $warden = $this->wardenService->updateWarden($id, $validator->validated(), $authUser->school_id);

            if (!$warden) {
                return response()->json([
                    'status' => false,
                    'message' => 'Warden not found'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Warden updated successfully',
                'data' => $warden
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update warden',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a warden
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser || !$authUser->school_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized or school not found'
                ], 403);
            }

            $result = $this->wardenService->deleteWarden($id, $authUser->school_id);

            if ($result === null) {
                return response()->json([
                    'status' => false,
                    'message' => 'Warden not found'
                ], 404);
            }

            if ($result === false) {
                return response()->json([
                    'status' => false,
                    'message' => 'Failed to delete warden'
                ], 500);
            }

            return response()->json([
                'status' => true,
                'message' => 'Warden deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Toggle warden status
     */
    public function toggleStatus(Request $request, $id): JsonResponse
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser || !$authUser->school_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized or school not found'
                ], 403);
            }

            $warden = $this->wardenService->toggleStatus($id, $authUser->school_id);

            if (!$warden) {
                return response()->json([
                    'status' => false,
                    'message' => 'Warden not found'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Warden status updated successfully',
                'data' => $warden
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to toggle status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset warden password
     */
    public function resetPassword(Request $request, $id): JsonResponse
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser || !$authUser->school_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized or school not found'
                ], 403);
            }

            $warden = $this->wardenService->resetPassword($id, $authUser->school_id);

            if (!$warden) {
                return response()->json([
                    'status' => false,
                    'message' => 'Warden not found'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Password reset successfully. New password sent to email.'
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
     * Get warden dashboard statistics
     */
    public function getDashboard(Request $request, int $schoolId): JsonResponse
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser || $authUser->role !== 'warden' || $authUser->school_id != $schoolId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Get assigned building
            $building = \App\Models\HostelBuilding::where('warden_id', $authUser->id)
                ->where('school_id', $schoolId)
                ->first();

            if (!$building) {
                return response()->json([
                    'status' => true,
                    'data' => [
                        'building' => null,
                        'total_rooms' => 0,
                        'occupied_rooms' => 0,
                        'vacant_rooms' => 0,
                        'total_students' => 0,
                        'total_menus' => 0,
                        'total_bookings' => 0,
                    ]
                ]);
            }

            // Get room statistics
            $rooms = \App\Models\HostelRoom::where('hostel_building_id', $building->id)->get();
            $roomIds = $rooms->pluck('id')->toArray();
            
            $totalRooms = $rooms->count();
            $occupiedRooms = $rooms->where('status', 'full')->count() + 
                           $rooms->filter(fn($r) => $r->occupied_beds > 0 && $r->status !== 'full')->count();
            $vacantRooms = $totalRooms - $occupiedRooms;
            
            $allocations = \App\Models\HostelAllocation::whereIn('hostel_room_id', $roomIds)
                ->where('status', 'active')
                ->count();

            // Get mess statistics
            $totalMenus = \App\Models\MessMenu::where('school_id', $schoolId)
                ->whereDate('date', '>=', now()->startOfMonth())
                ->count();

            $totalBookings = \App\Models\MessBooking::where('school_id', $schoolId)
                ->whereDate('booking_date', '>=', now()->startOfMonth())
                ->count();

            return response()->json([
                'status' => true,
                'data' => [
                    'building' => $building,
                    'total_rooms' => $totalRooms,
                    'occupied_rooms' => $occupiedRooms,
                    'vacant_rooms' => $vacantRooms,
                    'total_students' => $allocations,
                    'total_menus' => $totalMenus,
                    'total_bookings' => $totalBookings,
                ]
            ]);
        } catch (Exception $e) {
            Log::error("WardenController::getDashboard - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

