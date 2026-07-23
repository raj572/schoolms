<?php

namespace App\Http\Controllers;

use App\Models\MessMenu;
use App\Models\MessBooking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Exception;

class MessController extends Controller
{
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
     * Get menus for a school
     */
    public function getMenus(Request $request, int $schoolId): JsonResponse
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            // Validate school access
            if ($authUser->school_id != $schoolId && $authUser->role !== 'administrator') {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized access to school data'
                ], 403);
            }

            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            $mealType = $request->input('meal_type');

            $query = MessMenu::where('school_id', $schoolId)
                ->with(['creator:id,full_name,email']);

            if ($startDate) {
                $query->where('date', '>=', $startDate);
            }

            if ($endDate) {
                $query->where('date', '<=', $endDate);
            }

            if ($mealType) {
                $query->where('meal_type', $mealType);
            }

            $menus = $query->orderBy('date', 'desc')
                ->orderBy('meal_type')
                ->get();

            return response()->json([
                'status' => true,
                'data' => $menus
            ]);
        } catch (Exception $e) {
            Log::error("MessController::getMenus - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a menu
     */
    public function createMenu(Request $request): JsonResponse
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
                'date' => 'required|date',
                'meal_type' => 'required|in:breakfast,lunch,dinner',
                'items' => 'required|array|min:1',
                'items.*' => 'required|string',
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if menu already exists for this date and meal type
            $existingMenu = MessMenu::where('school_id', $authUser->school_id)
                ->where('date', $request->date)
                ->where('meal_type', $request->meal_type)
                ->first();

            if ($existingMenu) {
                return response()->json([
                    'status' => false,
                    'message' => 'Menu already exists for this date and meal type'
                ], 400);
            }

            $menu = MessMenu::create([
                'school_id' => $authUser->school_id,
                'date' => $request->date,
                'meal_type' => $request->meal_type,
                'items' => $request->items,
                'created_by' => $authUser->id,
                'description' => $request->description,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Menu created successfully',
                'data' => $menu->load('creator')
            ], 201);
        } catch (Exception $e) {
            Log::error("MessController::createMenu - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create menu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a menu
     */
    public function updateMenu(Request $request, int $id): JsonResponse
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
                'date' => 'sometimes|date',
                'meal_type' => 'sometimes|in:breakfast,lunch,dinner',
                'items' => 'sometimes|array|min:1',
                'items.*' => 'required|string',
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $menu = MessMenu::where('id', $id)
                ->where('school_id', $authUser->school_id)
                ->first();

            if (!$menu) {
                return response()->json([
                    'status' => false,
                    'message' => 'Menu not found'
                ], 404);
            }

            // Check if updating date/meal_type would create duplicate
            if ($request->has('date') || $request->has('meal_type')) {
                $date = $request->date ?? $menu->date;
                $mealType = $request->meal_type ?? $menu->meal_type;

                $existingMenu = MessMenu::where('school_id', $authUser->school_id)
                    ->where('date', $date)
                    ->where('meal_type', $mealType)
                    ->where('id', '!=', $id)
                    ->first();

                if ($existingMenu) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Menu already exists for this date and meal type'
                    ], 400);
                }
            }

            $menu->update($validator->validated());

            return response()->json([
                'status' => true,
                'message' => 'Menu updated successfully',
                'data' => $menu->fresh(['creator'])
            ]);
        } catch (Exception $e) {
            Log::error("MessController::updateMenu - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update menu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a menu
     */
    public function deleteMenu(Request $request, int $id): JsonResponse
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser || !$authUser->school_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized or school not found'
                ], 403);
            }

            $menu = MessMenu::where('id', $id)
                ->where('school_id', $authUser->school_id)
                ->first();

            if (!$menu) {
                return response()->json([
                    'status' => false,
                    'message' => 'Menu not found'
                ], 404);
            }

            // Check if there are bookings for this menu
            $bookingsCount = MessBooking::where('menu_id', $id)->count();
            if ($bookingsCount > 0) {
                return response()->json([
                    'status' => false,
                    'message' => 'Cannot delete menu. There are existing bookings for this menu.'
                ], 400);
            }

            $menu->delete();

            return response()->json([
                'status' => true,
                'message' => 'Menu deleted successfully'
            ]);
        } catch (Exception $e) {
            Log::error("MessController::deleteMenu - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete menu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bookings for a school
     */
    public function getBookings(Request $request, int $schoolId): JsonResponse
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);
            
            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            // Validate school access
            if ($authUser->school_id != $schoolId && $authUser->role !== 'administrator') {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized access to school data'
                ], 403);
            }

            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            $status = $request->input('status');
            $studentId = $request->input('student_id');

            $query = MessBooking::where('school_id', $schoolId)
                ->with(['student:id,candidate_name', 'menu:id,date,meal_type,items']);

            if ($startDate) {
                $query->where('booking_date', '>=', $startDate);
            }

            if ($endDate) {
                $query->where('booking_date', '<=', $endDate);
            }

            if ($status) {
                $query->where('status', $status);
            }

            if ($studentId) {
                $query->where('student_id', $studentId);
            }

            $bookings = $query->orderBy('booking_date', 'desc')
                ->orderBy('meal_type')
                ->get();

            return response()->json([
                'status' => true,
                'data' => $bookings
            ]);
        } catch (Exception $e) {
            Log::error("MessController::getBookings - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a booking
     */
    public function createBooking(Request $request): JsonResponse
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
                'student_id' => 'required|exists:students,id',
                'menu_id' => 'required|exists:mess_menus,id',
                'booking_date' => 'required|date',
                'meal_type' => 'required|in:breakfast,lunch,dinner',
                'remarks' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verify menu belongs to school
            $menu = MessMenu::where('id', $request->menu_id)
                ->where('school_id', $authUser->school_id)
                ->first();

            if (!$menu) {
                return response()->json([
                    'status' => false,
                    'message' => 'Menu not found or does not belong to your school'
                ], 404);
            }

            // Verify student belongs to school
            $student = \App\Models\Student::where('id', $request->student_id)
                ->where('school_id', $authUser->school_id)
                ->first();

            if (!$student) {
                return response()->json([
                    'status' => false,
                    'message' => 'Student not found or does not belong to your school'
                ], 404);
            }

            // Check for duplicate booking
            $existingBooking = MessBooking::where('student_id', $request->student_id)
                ->where('booking_date', $request->booking_date)
                ->where('meal_type', $request->meal_type)
                ->first();

            if ($existingBooking) {
                return response()->json([
                    'status' => false,
                    'message' => 'Booking already exists for this student, date, and meal type'
                ], 400);
            }

            $booking = MessBooking::create([
                'school_id' => $authUser->school_id,
                'student_id' => $request->student_id,
                'menu_id' => $request->menu_id,
                'booking_date' => $request->booking_date,
                'meal_type' => $request->meal_type,
                'status' => 'pending',
                'remarks' => $request->remarks,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Booking created successfully',
                'data' => $booking->load(['student', 'menu'])
            ], 201);
        } catch (Exception $e) {
            Log::error("MessController::createBooking - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update booking status
     */
    public function updateBookingStatus(Request $request, int $id): JsonResponse
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
                'status' => 'required|in:pending,confirmed,cancelled,consumed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $booking = MessBooking::where('id', $id)
                ->where('school_id', $authUser->school_id)
                ->first();

            if (!$booking) {
                return response()->json([
                    'status' => false,
                    'message' => 'Booking not found'
                ], 404);
            }

            $booking->update(['status' => $request->status]);

            return response()->json([
                'status' => true,
                'message' => 'Booking status updated successfully',
                'data' => $booking->fresh(['student', 'menu'])
            ]);
        } catch (Exception $e) {
            Log::error("MessController::updateBookingStatus - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update booking status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

