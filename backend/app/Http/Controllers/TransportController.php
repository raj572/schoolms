<?php

namespace App\Http\Controllers;

use App\Services\TransportService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TransportController extends Controller
{
    protected TransportService $transportService;

    public function __construct(TransportService $transportService)
    {
        $this->transportService = $transportService;
    }

    // ==================== Statistics ====================

    public function getStatistics(int $schoolId)
    {
        try {
            $result = $this->transportService->getTransportStatistics($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("TransportController::getStatistics - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    // ==================== Bus Management ====================

    public function getAllBuses(int $schoolId)
    {
        try {
            $result = $this->transportService->getAllBuses($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("TransportController::getAllBuses - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function getBus(int $busId)
    {
        try {
            $result = $this->transportService->getBus($busId);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("TransportController::getBus - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function createBus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_id' => 'required|exists:schools,id',
            'bus_number' => 'required|string|max:50',
            'driver_name' => 'required|string|max:255',
            'driver_contact' => 'required|string|max:20',
            'route_name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1|max:100',
            'registration_number' => 'nullable|string|max:50',
            'status' => 'required|in:active,maintenance,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->transportService->createBus($validator->validated());
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (Exception $e) {
            Log::error("TransportController::createBus - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function updateBus(Request $request, int $busId)
    {
        $validator = Validator::make($request->all(), [
            'bus_number' => 'sometimes|string|max:50',
            'driver_name' => 'sometimes|string|max:255',
            'driver_contact' => 'sometimes|string|max:20',
            'route_name' => 'sometimes|string|max:255',
            'capacity' => 'sometimes|integer|min:1|max:100',
            'registration_number' => 'nullable|string|max:50',
            'status' => 'sometimes|in:active,maintenance,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->transportService->updateBus($busId, $validator->validated());
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("TransportController::updateBus - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function deleteBus(int $busId)
    {
        try {
            $result = $this->transportService->deleteBus($busId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("TransportController::deleteBus - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    // ==================== Transport Assignments ====================

    public function getAssignments(int $schoolId)
    {
        try {
            $result = $this->transportService->getAllAssignments($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("TransportController::getAssignments - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function getStudentsOnBus(int $busId)
    {
        try {
            $result = $this->transportService->getStudentsOnBus($busId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("TransportController::getStudentsOnBus - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function assignStudent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_id' => 'required|exists:schools,id',
            'student_details_id' => 'required|exists:student_details,id',
            'bus_id' => 'required|exists:school_buses,id',
            'pickup_point' => 'required|string|max:255',
            'pickup_time' => 'required|date_format:H:i',
            'drop_time' => 'required|date_format:H:i|after:pickup_time',
            'monthly_fee' => 'required|numeric|min:0',
            'status' => 'sometimes|in:active,inactive,suspended',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->transportService->assignStudentToTransport($validator->validated());
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (Exception $e) {
            Log::error("TransportController::assignStudent - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function updateAssignment(Request $request, int $assignmentId)
    {
        $validator = Validator::make($request->all(), [
            'bus_id' => 'sometimes|exists:school_buses,id',
            'pickup_point' => 'sometimes|string|max:255',
            'pickup_time' => 'sometimes|date_format:H:i',
            'drop_time' => 'sometimes|date_format:H:i',
            'monthly_fee' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:active,inactive,suspended',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->transportService->updateAssignment($assignmentId, $validator->validated());
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("TransportController::updateAssignment - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function removeAssignment(int $assignmentId)
    {
        try {
            $result = $this->transportService->removeAssignment($assignmentId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("TransportController::removeAssignment - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }
}

