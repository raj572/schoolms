<?php

namespace App\Http\Controllers;

use App\Services\StudentDashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StudentDashboardController extends Controller
{
    protected StudentDashboardService $service;

    public function __construct(StudentDashboardService $service)
    {
        $this->service = $service;
    }

    /**
     * Get complete dashboard data for a student
     *
     * @param int $studentId
     * @param Request $request
     * @return JsonResponse
     */
    public function getDashboard(int $studentId, Request $request): JsonResponse
    {
        try {
            $schoolId = $request->input('school_id');

            if (!$schoolId) {
                return response()->json([
                    'status' => false,
                    'message' => 'School ID is required',
                ], 400);
            }

            $result = $this->service->getDashboardData($studentId, $schoolId);

            if (!$result['status']) {
                return response()->json($result, 404);
            }

            return response()->json($result, 200);
        } catch (\Exception $e) {
            Log::error('Error in getDashboard: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal server error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get student info
     *
     * @param int $studentId
     * @return JsonResponse
     */
    public function getStudentInfo(int $studentId): JsonResponse
    {
        try {
            $result = $this->service->getStudentInfo($studentId);

            if (!$result['status']) {
                return response()->json($result, 404);
            }

            return response()->json($result, 200);
        } catch (\Exception $e) {
            Log::error('Error in getStudentInfo: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal server error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get today's classes for a student
     *
     * @param int $studentId
     * @param Request $request
     * @return JsonResponse
     */
    public function getTodayClasses(int $studentId, Request $request): JsonResponse
    {
        try {
            $schoolId = $request->input('school_id');

            if (!$schoolId) {
                return response()->json([
                    'status' => false,
                    'message' => 'School ID is required',
                ], 400);
            }

            $result = $this->service->getTodayClasses($studentId, $schoolId);

            if (!$result['status']) {
                return response()->json($result, 404);
            }

            return response()->json($result, 200);
        } catch (\Exception $e) {
            Log::error('Error in getTodayClasses: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal server error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get syllabus progress for a student
     *
     * @param int $studentId
     * @param Request $request
     * @return JsonResponse
     */
    public function getSyllabusProgress(int $studentId, Request $request): JsonResponse
    {
        try {
            $schoolId = $request->input('school_id');

            if (!$schoolId) {
                return response()->json([
                    'status' => false,
                    'message' => 'School ID is required',
                ], 400);
            }

            $result = $this->service->getSyllabusProgress($studentId, $schoolId);

            if (!$result['status']) {
                return response()->json($result, 404);
            }

            return response()->json($result, 200);
        } catch (\Exception $e) {
            Log::error('Error in getSyllabusProgress: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal server error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

