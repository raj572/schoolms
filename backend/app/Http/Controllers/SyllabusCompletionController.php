<?php

namespace App\Http\Controllers;

use App\Services\SyllabusCompletionService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SyllabusCompletionController extends Controller
{
    private SyllabusCompletionService $syllabusCompletionService;

    public function __construct(SyllabusCompletionService $syllabusCompletionService)
    {
        $this->syllabusCompletionService = $syllabusCompletionService;
    }

    /**
     * Get all completions for a teacher
     */
    public function getTeacherCompletion(Request $request)
    {
        try {
            // Extract user from JWT token
            $authHeader = $request->header('Authorization');
            if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - No valid token provided',
                ], 401);
            }

            $token = substr($authHeader, 7);
            $verification = \App\Helpers\JWTHelper::verifyToken($token);

            if (!$verification['success']) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - Invalid token',
                ], 401);
            }

            $payload = $verification['data'];
            $teacherId = $payload->user_id ?? null;  // JWT stores user_id, not teacher_id
            $schoolId = $payload->school_id ?? null;

            if (!$teacherId || !$schoolId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid token data',
                ], 401);
            }

            $result = $this->syllabusCompletionService->getTeacherCompletion($teacherId, $schoolId);
            $statusCode = $result['status'] ? 200 : 400;

            return response()->json($result, $statusCode);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch completions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get specific completion
     */
    public function getCompletion(Request $request, $classId, $subjectId)
    {
        try {
            // Extract user from JWT token
            $authHeader = $request->header('Authorization');
            if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - No valid token provided',
                ], 401);
            }

            $token = substr($authHeader, 7);
            $verification = \App\Helpers\JWTHelper::verifyToken($token);

            if (!$verification['success']) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - Invalid token',
                ], 401);
            }

            $payload = $verification['data'];
            $teacherId = $payload->user_id ?? null;  // JWT stores user_id, not teacher_id
            $schoolId = $payload->school_id ?? null;

            if (!$teacherId || !$schoolId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid token data',
                ], 401);
            }

            $result = $this->syllabusCompletionService->getCompletionByClass(
                $teacherId,
                (int) $classId,
                (int) $subjectId,
                $schoolId
            );

            $statusCode = $result['status'] ? 200 : 404;

            return response()->json($result, $statusCode);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch completion',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update completion
     */
    public function updateCompletion(Request $request)
    {
        try {
            // Extract user from JWT token
            $authHeader = $request->header('Authorization');
            if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - No valid token provided',
                ], 401);
            }

            $token = substr($authHeader, 7);
            $verification = \App\Helpers\JWTHelper::verifyToken($token);

            if (!$verification['success']) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - Invalid token',
                ], 401);
            }

            $payload = $verification['data'];
            $teacherId = $payload->user_id ?? null;  // JWT stores user_id, not teacher_id
            $schoolId = $payload->school_id ?? null;

            if (!$teacherId || !$schoolId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid token data',
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'class_id' => 'required|integer|exists:school_class,id',
                'subject_id' => 'required|integer|exists:school_subjects,id',
                'total_chapters' => 'required|integer|min:0',
                'completed_chapters' => 'required|integer|min:0',
                'remarks' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $data = array_merge($validator->validated(), [
                'teacher_id' => $teacherId,
                'school_id' => $schoolId,
            ]);

            $result = $this->syllabusCompletionService->updateCompletion($data);
            $statusCode = $result['status'] ? 200 : 400;

            return response()->json($result, $statusCode);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update completion',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get completion history
     */
    public function getHistory(Request $request, $classId, $subjectId)
    {
        try {
            // Extract user from JWT token
            $authHeader = $request->header('Authorization');
            if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - No valid token provided',
                ], 401);
            }

            $token = substr($authHeader, 7);
            $verification = \App\Helpers\JWTHelper::verifyToken($token);

            if (!$verification['success']) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - Invalid token',
                ], 401);
            }

            $payload = $verification['data'];
            $teacherId = $payload->user_id ?? null;  // JWT stores user_id, not teacher_id
            $schoolId = $payload->school_id ?? null;

            if (!$teacherId || !$schoolId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid token data',
                ], 401);
            }

            $result = $this->syllabusCompletionService->getCompletionHistory(
                $teacherId,
                (int) $classId,
                (int) $subjectId,
                $schoolId
            );

            $statusCode = $result['status'] ? 200 : 404;

            return response()->json($result, $statusCode);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch history',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get syllabus completion for a specific teacher (for principal view)
     */
    public function getTeacherCompletionForPrincipal(Request $request, $teacherId)
    {
        try {
            // Extract user from JWT token
            $authHeader = $request->header('Authorization');
            if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - No valid token provided',
                ], 401);
            }

            $token = substr($authHeader, 7);
            $verification = \App\Helpers\JWTHelper::verifyToken($token);

            if (!$verification['success']) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - Invalid token',
                ], 401);
            }

            $payload = $verification['data'];
            $schoolId = $payload->school_id ?? null;

            if (!$schoolId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid token data',
                ], 401);
            }

            $result = $this->syllabusCompletionService->getTeacherCompletionForPrincipal((int) $teacherId, $schoolId);
            $statusCode = $result['status'] ? 200 : 400;

            return response()->json($result, $statusCode);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch teacher completion',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get principal overview
     */
    public function getOverview(Request $request)
    {
        try {
            // Extract user from JWT token
            $authHeader = $request->header('Authorization');
            if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - No valid token provided',
                ], 401);
            }

            $token = substr($authHeader, 7);
            $verification = \App\Helpers\JWTHelper::verifyToken($token);

            if (!$verification['success']) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - Invalid token',
                ], 401);
            }

            $payload = $verification['data'];
            $schoolId = $payload->school_id ?? null;

            if (!$schoolId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid token data',
                ], 401);
            }

            $result = $this->syllabusCompletionService->getPrincipalOverview($schoolId);
            $statusCode = $result['status'] ? 200 : 400;

            return response()->json($result, $statusCode);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch overview',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get principal detailed view
     */
    public function getDetailedView(Request $request)
    {
        try {
            // Extract user from JWT token
            $authHeader = $request->header('Authorization');
            if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - No valid token provided',
                ], 401);
            }

            $token = substr($authHeader, 7);
            $verification = \App\Helpers\JWTHelper::verifyToken($token);

            if (!$verification['success']) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - Invalid token',
                ], 401);
            }

            $payload = $verification['data'];
            $schoolId = $payload->school_id ?? null;

            if (!$schoolId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid token data',
                ], 401);
            }

            $filters = [];
            if ($request->has('teacher_id')) {
                $filters['teacher_id'] = $request->teacher_id;
            }
            if ($request->has('class_id')) {
                $filters['class_id'] = $request->class_id;
            }
            if ($request->has('subject_id')) {
                $filters['subject_id'] = $request->subject_id;
            }

            $result = $this->syllabusCompletionService->getPrincipalDetailedView($schoolId, $filters);
            $statusCode = $result['status'] ? 200 : 400;

            return response()->json($result, $statusCode);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch detailed view',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

