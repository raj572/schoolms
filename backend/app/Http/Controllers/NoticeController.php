<?php

namespace App\Http\Controllers;

use App\Services\NoticeService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * NoticeController
 *
 * Handles HTTP requests for notice/announcement management
 */
class NoticeController extends Controller
{
    protected NoticeService $noticeService;

    public function __construct(NoticeService $noticeService)
    {
        $this->noticeService = $noticeService;
    }

    /**
     * Get all notices for a school
     */
    public function getAllNotices(int $schoolId)
    {
        try {
            $result = $this->noticeService->getAllNotices($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("NoticeController::getAllNotices - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get active notices
     */
    public function getActiveNotices(int $schoolId)
    {
        try {
            $result = $this->noticeService->getActiveNotices($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("NoticeController::getActiveNotices - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get all notices for administrator (across all their schools)
     */
    public function getAdministratorNotices(Request $request)
    {
        try {
            // Get authenticated user
            $authUser = $this->getAuthenticatedUser($request);

            if (!$authUser) {
                Log::error("NoticeController::getAdministratorNotices - No authenticated user");
                return response()->json([
                    'status' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            if ($authUser->role !== 'administrator') {
                Log::error("NoticeController::getAdministratorNotices - User is not an administrator. Role: " . $authUser->role);
                return response()->json([
                    'status' => false,
                    'message' => 'Only administrators can access this endpoint'
                ], 403);
            }

            // Get all schools for this administrator
            $schools = \App\Models\School::where('administrator_id', $authUser->id)->pluck('id');
            Log::info("NoticeController::getAdministratorNotices - Administrator ID: {$authUser->id}, Found schools: " . $schools->count());
            
            if ($schools->isEmpty()) {
                Log::warning("NoticeController::getAdministratorNotices - No schools found for administrator ID: {$authUser->id}");
                return response()->json([
                    'status' => true,
                    'message' => 'No schools found',
                    'data' => []
                ]);
            }
            
            // Get all notices for these schools
            $notices = \App\Models\Notice::whereIn('school_id', $schools)
                ->with('school', 'creator')
                ->where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->take(50)
                ->get();

            Log::info("NoticeController::getAdministratorNotices - Found " . $notices->count() . " notices");
            
            // Log first notice for debugging
            if ($notices->count() > 0) {
                Log::info("NoticeController::getAdministratorNotices - First notice: " . json_encode($notices->first()->toArray()));
            }

            return response()->json([
                'status' => true,
                'message' => 'Notices fetched successfully',
                'data' => $notices
            ]);
        } catch (Exception $e) {
            Log::error("NoticeController::getAdministratorNotices - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Helper to get authenticated user from JWT token
     */
    protected function getAuthenticatedUser(Request $request)
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

    /**
     * Get notices for current user
     */
    public function getMyNotices(Request $request, int $schoolId)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|string',
            'user_id' => 'required|integer',
            'user_type' => 'required|string',
            'class_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();
            $result = $this->noticeService->getNoticesForRole(
                $schoolId,
                $data['role'],
                $data['class_id'] ?? null
            );
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("NoticeController::getMyNotices - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get unread notices
     */
    public function getUnreadNotices(Request $request, int $schoolId)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|string',
            'user_id' => 'required|integer',
            'user_type' => 'required|string',
            'class_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();
            $result = $this->noticeService->getUnreadNotices(
                $schoolId,
                $data['role'],
                $data['user_id'],
                $data['user_type'],
                $data['class_id'] ?? null
            );
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("NoticeController::getUnreadNotices - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get notice by ID
     */
    public function getNotice(int $id)
    {
        try {
            $result = $this->noticeService->getNoticeById($id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("NoticeController::getNotice - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Create notice
     */
    public function createNotice(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_id' => 'required|exists:schools,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:notice,announcement,event,holiday,urgent',
            'priority' => 'required|in:low,medium,high,urgent',
            'target_roles' => 'nullable|array',
            'target_classes' => 'nullable|array',
            'publish_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after:publish_date',
            'attachment_url' => 'nullable|string',
            'created_by' => 'required|exists:users,id',
            'created_by_role' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->noticeService->createNotice($validator->validated());
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (Exception $e) {
            Log::error("NoticeController::createNotice - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Update notice
     */
    public function updateNotice(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'type' => 'sometimes|in:notice,announcement,event,holiday,urgent',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'target_roles' => 'nullable|array',
            'target_classes' => 'nullable|array',
            'publish_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
            'attachment_url' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->noticeService->updateNotice($id, $validator->validated());
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("NoticeController::updateNotice - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Delete notice
     */
    public function deleteNotice(int $id)
    {
        try {
            $result = $this->noticeService->deleteNotice($id);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("NoticeController::deleteNotice - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Mark notice as read
     */
    public function markAsRead(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'reader_id' => 'required|integer',
            'reader_type' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();
            $result = $this->noticeService->markAsRead($id, $data['reader_id'], $data['reader_type']);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("NoticeController::markAsRead - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Toggle notice active status
     */
    public function toggleActive(int $id)
    {
        try {
            $result = $this->noticeService->toggleActive($id);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("NoticeController::toggleActive - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get read count for notice
     */
    public function getReadCount(int $id)
    {
        try {
            $result = $this->noticeService->getReadCount($id);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("NoticeController::getReadCount - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }
}


