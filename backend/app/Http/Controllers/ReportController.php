<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use App\Services\ReportExportService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Exception;

class ReportController extends Controller
{
    protected $reportService;
    protected $exportService;

    public function __construct(ReportService $reportService, ReportExportService $exportService)
    {
        $this->reportService = $reportService;
        $this->exportService = $exportService;
    }

    /**
     * Get authenticated user from JWT token
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
     * Get comprehensive report data
     * POST /api/principal/reports/data
     */
    public function getReportData(Request $request)
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);

            if (!$authUser || !$authUser->school_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized or school not found',
                ], 401);
            }

            // Validate input
            $validated = $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
            ]);

            $result = $this->reportService->getReportData(
                $authUser->school_id,
                $validated['start_date'],
                $validated['end_date']
            );

            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("Error fetching report data: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch report data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export report in various formats
     * POST /api/principal/reports/export
     */
    public function exportReport(Request $request)
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);

            if (!$authUser || !$authUser->school_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized or school not found',
                ], 401);
            }

            // Validate input
            $validated = $request->validate([
                'report_type' => 'required|in:attendance,financial,performance',
                'format' => 'required|in:pdf,excel,csv',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
            ]);

            // Get report data
            $data = $this->reportService->getReportData(
                $authUser->school_id,
                $validated['start_date'],
                $validated['end_date']
            );

            if (!$data['status']) {
                return response()->json($data, 400);
            }

            // Export based on format
            $exportResult = null;
            
            switch ($validated['format']) {
                case 'pdf':
                    $exportResult = $this->exportService->exportToPDF(
                        $authUser->school_id,
                        $validated['report_type'],
                        $data['data'],
                        $validated['start_date'],
                        $validated['end_date']
                    );
                    
                    if ($exportResult['status']) {
                        return Response::make($exportResult['content'], 200, [
                            'Content-Type' => 'application/pdf',
                            'Content-Disposition' => 'attachment; filename="' . $exportResult['filename'] . '"',
                        ]);
                    }
                    break;

                case 'excel':
                case 'csv':
                    $exportResult = $validated['format'] === 'excel'
                        ? $this->exportService->exportToExcel(
                            $authUser->school_id,
                            $validated['report_type'],
                            $data['data'],
                            $validated['start_date'],
                            $validated['end_date']
                        )
                        : $this->exportService->exportToCSV(
                            $authUser->school_id,
                            $validated['report_type'],
                            $data['data'],
                            $validated['start_date'],
                            $validated['end_date']
                        );
                    
                    if ($exportResult['status']) {
                        return response()->download(
                            $exportResult['filePath'],
                            $exportResult['filename']
                        );
                    }
                    break;
            }

            if (!$exportResult || !$exportResult['status']) {
                return response()->json([
                    'status' => false,
                    'message' => 'Failed to export report',
                    'error' => $exportResult['error'] ?? 'Unknown error',
                ], 500);
            }

        } catch (Exception $e) {
            Log::error("Error exporting report: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to export report',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get attendance trends
     * GET /api/principal/reports/attendance-trends/{school_id}
     */
    public function getAttendanceTrends(Request $request, $school_id)
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);

            // Verify user has access to this school
            if (!$authUser || ($authUser->school_id != $school_id && $authUser->role !== 'administrator')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $startDate = $request->input('start_date', now()->subMonths(6)->format('Y-m-d'));
            $endDate = $request->input('end_date', now()->format('Y-m-d'));

            $start = \Carbon\Carbon::parse($startDate);
            $end = \Carbon\Carbon::parse($endDate);

            $result = $this->reportService->getAttendanceTrends($school_id, $start, $end);

            return response()->json([
                'status' => true,
                'message' => 'Attendance trends fetched successfully',
                'data' => $result,
            ]);
        } catch (Exception $e) {
            Log::error("Error fetching attendance trends: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch attendance trends',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get fee collection statistics
     * GET /api/principal/reports/fee-collection/{school_id}
     */
    public function getFeeCollectionStats(Request $request, $school_id)
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);

            // Verify user has access to this school
            if (!$authUser || ($authUser->school_id != $school_id && $authUser->role !== 'administrator')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $startDate = $request->input('start_date', now()->subMonths(6)->format('Y-m-d'));
            $endDate = $request->input('end_date', now()->format('Y-m-d'));

            $start = \Carbon\Carbon::parse($startDate);
            $end = \Carbon\Carbon::parse($endDate);

            $result = $this->reportService->getFeeCollectionStats($school_id, $start, $end);

            return response()->json([
                'status' => true,
                'message' => 'Fee collection stats fetched successfully',
                'data' => $result,
            ]);
        } catch (Exception $e) {
            Log::error("Error fetching fee collection stats: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch fee collection stats',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get performance metrics
     * GET /api/principal/reports/performance-metrics/{school_id}
     */
    public function getPerformanceMetrics(Request $request, $school_id)
    {
        try {
            $authUser = $this->getAuthenticatedUser($request);

            // Verify user has access to this school
            if (!$authUser || ($authUser->school_id != $school_id && $authUser->role !== 'administrator')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $startDate = $request->input('start_date', now()->subMonths(6)->format('Y-m-d'));
            $endDate = $request->input('end_date', now()->format('Y-m-d'));

            $start = \Carbon\Carbon::parse($startDate);
            $end = \Carbon\Carbon::parse($endDate);

            $result = $this->reportService->getPerformanceMetrics($school_id, $start, $end);

            return response()->json([
                'status' => true,
                'message' => 'Performance metrics fetched successfully',
                'data' => $result,
            ]);
        } catch (Exception $e) {
            Log::error("Error fetching performance metrics: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch performance metrics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
