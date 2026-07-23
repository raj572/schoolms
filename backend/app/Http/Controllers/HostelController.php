<?php

namespace App\Http\Controllers;

use App\Services\HostelService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * HostelController
 *
 * Handles HTTP requests for hostel management
 */
class HostelController extends Controller
{
    protected HostelService $hostelService;

    public function __construct(HostelService $hostelService)
    {
        $this->hostelService = $hostelService;
    }

    // ==================== Statistics ====================

    public function getStatistics(int $schoolId)
    {
        try {
            $result = $this->hostelService->getStatistics($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::getStatistics - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function syncHostelFees(int $schoolId)
    {
        try {
            $result = $this->hostelService->syncHostelFeesToMonthlyPayments($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::syncHostelFees - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    // ==================== Buildings ====================

    public function getAllBuildings(int $schoolId)
    {
        try {
            $result = $this->hostelService->getAllBuildings($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::getAllBuildings - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function getBuilding(int $id)
    {
        try {
            $result = $this->hostelService->getBuildingById($id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("HostelController::getBuilding - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function createBuilding(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_id' => 'required|exists:schools,id',
            'building_name' => 'required|string|max:255',
            'building_type' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'warden_id' => 'nullable|exists:users,id',
            'warden_name' => 'nullable|string|max:255', // Deprecated, kept for backward compatibility
            'warden_contact' => 'nullable|string|max:20', // Deprecated, kept for backward compatibility
            'total_rooms' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            // Verify warden belongs to school if provided
            if ($request->warden_id) {
                $warden = \App\Models\User::where('id', $request->warden_id)
                    ->where('role', 'warden')
                    ->where('school_id', $request->school_id)
                    ->first();
                
                if (!$warden) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Warden not found or does not belong to this school'
                    ], 400);
                }
            }

            $result = $this->hostelService->createBuilding($validator->validated());
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::createBuilding - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function updateBuilding(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'building_name' => 'sometimes|string|max:255',
            'building_type' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'warden_id' => 'nullable|exists:users,id',
            'warden_name' => 'nullable|string|max:255', // Deprecated, kept for backward compatibility
            'warden_contact' => 'nullable|string|max:20', // Deprecated, kept for backward compatibility
            'total_rooms' => 'sometimes|integer|min:0',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,under_maintenance',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            // Verify warden belongs to school if provided
            if ($request->warden_id) {
                $building = \App\Models\HostelBuilding::find($id);
                if ($building) {
                    $warden = \App\Models\User::where('id', $request->warden_id)
                        ->where('role', 'warden')
                        ->where('school_id', $building->school_id)
                        ->first();
                    
                    if (!$warden) {
                        return response()->json([
                            'status' => false,
                            'message' => 'Warden not found or does not belong to this school'
                        ], 400);
                    }
                }
            }

            $result = $this->hostelService->updateBuilding($id, $validator->validated());
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::updateBuilding - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function deleteBuilding(int $id)
    {
        try {
            $result = $this->hostelService->deleteBuilding($id);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::deleteBuilding - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    // ==================== Rooms ====================

    public function getAllRooms(Request $request, int $schoolId)
    {
        try {
            $buildingId = $request->query('building_id');
            $result = $this->hostelService->getAllRooms($schoolId, $buildingId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::getAllRooms - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function getAvailableRooms(int $schoolId)
    {
        try {
            $result = $this->hostelService->getAvailableRooms($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::getAvailableRooms - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function getRoom(int $id)
    {
        try {
            $result = $this->hostelService->getRoomById($id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("HostelController::getRoom - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function createRoom(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'hostel_building_id' => 'required|exists:hostel_buildings,id',
            'school_id' => 'required|exists:schools,id',
            'room_number' => 'required|string|max:50',
            'floor' => 'nullable|integer',
            'block_wing' => 'nullable|string|max:100',
            'room_type' => 'nullable|string|max:100',
            'capacity' => 'required|integer|min:1',
            'monthly_fee' => 'required|numeric|min:0',
            'facilities' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            // Add default values
            $data = $validator->validated();
            $data['occupied_beds'] = 0;
            $data['status'] = 'available';
            
            $result = $this->hostelService->createRoom($data);
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::createRoom - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function updateRoom(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'room_number' => 'sometimes|string|max:50',
            'floor' => 'nullable|integer',
            'block_wing' => 'nullable|string|max:100',
            'room_type' => 'nullable|string|max:100',
            'capacity' => 'sometimes|integer|min:1',
            'monthly_fee' => 'sometimes|numeric|min:0',
            'facilities' => 'nullable|string',
            'status' => 'sometimes|in:available,full,under_maintenance',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->hostelService->updateRoom($id, $validator->validated());
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::updateRoom - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function deleteRoom(int $id)
    {
        try {
            $result = $this->hostelService->deleteRoom($id);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::deleteRoom - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    // ==================== Allocations ====================

    public function getAllAllocations(Request $request, int $schoolId)
    {
        try {
            $activeOnly = $request->query('active_only', false);
            $result = $this->hostelService->getAllAllocations($schoolId, $activeOnly);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::getAllAllocations - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function getStudentAllocation(int $studentId)
    {
        try {
            $result = $this->hostelService->getStudentAllocation($studentId);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("HostelController::getStudentAllocation - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function allocateRoom(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'hostel_room_id' => 'required|exists:hostel_rooms,id',
            'student_id' => 'required|exists:students,id',
            'student_details_id' => 'required|exists:student_details,id',
            'school_id' => 'required|exists:schools,id',
            'allocation_date' => 'required|date',
            'monthly_fee' => 'required|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->hostelService->allocateRoom($validator->validated());
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::allocateRoom - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function vacateRoom(Request $request, int $allocationId)
    {
        $validator = Validator::make($request->all(), [
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->hostelService->vacateRoom($allocationId, $request->remarks);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::vacateRoom - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function transferRoom(Request $request, int $allocationId)
    {
        $validator = Validator::make($request->all(), [
            'new_room_id' => 'required|exists:hostel_rooms,id',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();
            $result = $this->hostelService->transferRoom($allocationId, $data['new_room_id'], $data['remarks'] ?? null);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::transferRoom - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    // ==================== Warden-specific methods ====================

    /**
     * Get warden's assigned building
     */
    public function getWardenBuilding(Request $request)
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser || $authUser->role !== 'warden' || !$authUser->school_id) {
                return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
            }

            $building = \App\Models\HostelBuilding::where('warden_id', $authUser->id)
                ->where('school_id', $authUser->school_id)
                ->with(['warden:id,full_name,email', 'rooms'])
                ->first();

            if (!$building) {
                return response()->json([
                    'status' => false,
                    'message' => 'No building assigned'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'data' => $building
            ]);
        } catch (Exception $e) {
            Log::error("HostelController::getWardenBuilding - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get all rooms in warden's building
     */
    public function getWardenRooms(Request $request)
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser || $authUser->role !== 'warden' || !$authUser->school_id) {
                return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
            }

            $building = \App\Models\HostelBuilding::where('warden_id', $authUser->id)
                ->where('school_id', $authUser->school_id)
                ->first();

            if (!$building) {
                return response()->json([
                    'status' => false,
                    'data' => [],
                    'message' => 'No building assigned'
                ]);
            }

            $result = $this->hostelService->getAllRooms($authUser->school_id, $building->id);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("HostelController::getWardenRooms - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get all allocations for warden's building
     */
    public function getWardenAllocations(Request $request)
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser || $authUser->role !== 'warden' || !$authUser->school_id) {
                return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
            }

            $building = \App\Models\HostelBuilding::where('warden_id', $authUser->id)
                ->where('school_id', $authUser->school_id)
                ->first();

            if (!$building) {
                return response()->json([
                    'status' => false,
                    'data' => [],
                    'message' => 'No building assigned'
                ]);
            }

            // Get allocations for rooms in this building
            $roomIds = \App\Models\HostelRoom::where('hostel_building_id', $building->id)
                ->pluck('id')
                ->toArray();

            $allocations = \App\Models\HostelAllocation::whereIn('hostel_room_id', $roomIds)
                ->with([
                    'hostelRoom.hostelBuilding',
                    'studentDetails'
                ])
                ->orderBy('allocation_date', 'desc')
                ->get();

            return response()->json([
                'status' => true,
                'data' => $allocations
            ]);
        } catch (Exception $e) {
            Log::error("HostelController::getWardenAllocations - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get authenticated user helper
     */
    protected function getAuthenticatedUser(Request $request): ?\App\Models\User
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

            return \App\Models\User::find($userId);
        } catch (Exception $e) {
            Log::error('Error getting authenticated user: ' . $e->getMessage());
            return null;
        }
    }
}


