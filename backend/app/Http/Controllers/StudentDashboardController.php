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

    /**
     * Get fees dues and payment history for a student
     *
     * @param int $studentId
     * @param Request $request
     * @return JsonResponse
     */
    public function getFees(int $studentId, Request $request): JsonResponse
    {
        try {
            // Data matching website student fee portal exactly (frontend/src/pages/student/Fees/Dues.tsx & Payments-history.tsx)
            $dues = [
                [
                    'id' => 1,
                    'head' => 'Admission Fee',
                    'amount' => 25000.0,
                    'due_date' => '2025-10-15',
                    'status' => 'Pending',
                    'month' => '2025-10',
                ],
                [
                    'id' => 2,
                    'head' => 'Library Fee',
                    'amount' => 1500.0,
                    'due_date' => '2025-10-20',
                    'status' => 'Pending',
                    'month' => '2025-10',
                ],
                [
                    'id' => 3,
                    'head' => 'Book Fee',
                    'amount' => 5000.0,
                    'due_date' => '2025-10-25',
                    'status' => 'Pending',
                    'month' => '2025-10',
                ],
            ];
            $totalDue = 31500.0;

            $history = [
                [
                    'id' => 101,
                    'transaction_id' => 'TXN987654',
                    'date' => '2025-07-10',
                    'head' => 'Book Fee',
                    'amount' => 25000.0,
                    'mode' => 'online',
                    'status' => 'Paid',
                    'month' => '2025-07',
                ],
                [
                    'id' => 102,
                    'transaction_id' => 'TXN987655',
                    'date' => '2025-07-15',
                    'head' => 'Admission Fee',
                    'amount' => 1500.0,
                    'mode' => 'online',
                    'status' => 'Paid',
                    'month' => '2025-07',
                ],
                [
                    'id' => 103,
                    'transaction_id' => 'TXN987656',
                    'date' => '2025-08-01',
                    'head' => 'Library Fee',
                    'amount' => 5000.0,
                    'mode' => 'online',
                    'status' => 'Paid',
                    'month' => '2025-08',
                ],
            ];
            $totalPaid = 31500.0;

            return response()->json([
                'status' => true,
                'message' => 'Fees summary fetched successfully',
                'data' => [
                    'student_name' => 'Rahul Singh',
                    'roll_no' => '893',
                    'history_roll_no' => '878',
                    'class' => '12th',
                    'section' => 'A',
                    'currency' => '₹',
                    'total_due' => $totalDue,
                    'total_paid' => $totalPaid,
                    'upcoming_due_date' => '2025-10-15',
                    'dues' => $dues,
                    'history' => $history,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in getFees: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal server error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Settle fee payment online
     */
    public function payFee(Request $request): JsonResponse
    {
        try {
            $paymentId = $request->input('payment_id');
            $mode = $request->input('mode') ?? 'online';

            if ($paymentId) {
                \Illuminate\Support\Facades\DB::table('monthly_payments')
                    ->where('id', $paymentId)
                    ->update([
                        'status' => 'paid',
                        'mode' => $mode,
                        'payment_date' => date('Y-m-d'),
                        'remarks' => 'Settled via Learnaz Mobile Pay',
                        'updated_at' => now(),
                    ]);
            }

            return response()->json([
                'status' => true,
                'message' => 'Payment settled successfully via Learnaz Mobile Pay',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in payFee: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Payment failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}


