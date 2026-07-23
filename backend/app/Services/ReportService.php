<?php

namespace App\Services;

use App\Models\StudentAttendanceRecord;
use App\Models\TeacherAttendanceRecord;
use App\Models\MonthlyPayment;
use App\Models\StudentExamMark;
use App\Models\ExamSchedule;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\SchoolClass;
use App\Models\Exam;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Exception;

class ReportService
{
    /**
     * Get comprehensive report data for principal dashboard
     */
    public function getReportData($schoolId, $startDate, $endDate): array
    {
        try {
            $start = Carbon::parse($startDate);
            $end = Carbon::parse($endDate);

            $attendanceData = $this->getAttendanceTrends($schoolId, $start, $end);
            $feeCollectionData = $this->getFeeCollectionStats($schoolId, $start, $end);
            $performanceData = $this->getPerformanceMetrics($schoolId, $start, $end);
            $summaryStats = $this->getSummaryStats($schoolId);

            return [
                'status' => true,
                'message' => 'Report data fetched successfully',
                'data' => [
                    'summary' => $summaryStats,
                    'attendance' => $attendanceData,
                    'feeCollection' => $feeCollectionData,
                    'performance' => $performanceData,
                    'dateRange' => [
                        'start' => $startDate,
                        'end' => $endDate,
                    ],
                ],
                'error' => null,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching report data: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch report data',
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get attendance trends for students and teachers
     */
    public function getAttendanceTrends($schoolId, $start, $end): array
    {
        try {
            // Student attendance trends
            $studentAttendanceRecords = StudentAttendanceRecord::where('school_id', $schoolId)
                ->whereBetween('attendance_date', [$start, $end])
                ->selectRaw('DATE(attendance_date) as date, status, COUNT(*) as count')
                ->groupBy('date', 'status')
                ->orderBy('date')
                ->get();

            $studentData = [];
            foreach ($studentAttendanceRecords as $record) {
                $dateKey = $record->date;
                if (!isset($studentData[$dateKey])) {
                    $studentData[$dateKey] = ['present' => 0, 'absent' => 0, 'late' => 0];
                }
                $studentData[$dateKey][$record->status] = $record->count;
            }

            // Format for chart
            $monthlyAttendance = [];
            foreach ($studentData as $date => $data) {
                $parsedDate = Carbon::parse($date);
                $monthKey = $parsedDate->format('M Y');
                
                if (!isset($monthlyAttendance[$monthKey])) {
                    $monthlyAttendance[$monthKey] = ['present' => 0, 'absent' => 0, 'late' => 0, 'total' => 0];
                }
                
                $monthlyAttendance[$monthKey]['present'] += $data['present'];
                $monthlyAttendance[$monthKey]['absent'] += $data['absent'];
                $monthlyAttendance[$monthKey]['late'] += $data['late'];
                $monthlyAttendance[$monthKey]['total'] += $data['present'] + $data['absent'] + $data['late'];
            }

            // Format data for Recharts
            $chartData = [];
            foreach ($monthlyAttendance as $month => $data) {
                $total = $data['total'];
                $presentPercentage = $total > 0 ? ($data['present'] / $total) * 100 : 0;
                
                $chartData[] = [
                    'month' => $month,
                    'attendance' => round($presentPercentage, 1),
                    'present' => $data['present'],
                    'absent' => $data['absent'],
                ];
            }

            // Calculate average attendance
            $avgAttendance = count($chartData) > 0 
                ? round(array_sum(array_column($chartData, 'attendance')) / count($chartData), 1) 
                : 0;

            // Teacher attendance trends
            $teacherAttendanceRecords = TeacherAttendanceRecord::where('school_id', $schoolId)
                ->whereBetween('attendance_date', [$start, $end])
                ->selectRaw('DATE(attendance_date) as date, status, COUNT(*) as count')
                ->groupBy('date', 'status')
                ->orderBy('date')
                ->get();

            $teacherData = [];
            foreach ($teacherAttendanceRecords as $record) {
                $dateKey = $record->date;
                if (!isset($teacherData[$dateKey])) {
                    $teacherData[$dateKey] = ['present' => 0, 'absent' => 0];
                }
                $teacherData[$dateKey][$record->status] = $record->count;
            }

            $teacherMonthlyAttendance = [];
            foreach ($teacherData as $date => $data) {
                $parsedDate = Carbon::parse($date);
                $monthKey = $parsedDate->format('M Y');
                
                if (!isset($teacherMonthlyAttendance[$monthKey])) {
                    $teacherMonthlyAttendance[$monthKey] = ['present' => 0, 'absent' => 0, 'total' => 0];
                }
                
                $teacherMonthlyAttendance[$monthKey]['present'] += $data['present'];
                $teacherMonthlyAttendance[$monthKey]['absent'] += $data['absent'];
                $teacherMonthlyAttendance[$monthKey]['total'] += $data['present'] + $data['absent'];
            }

            $teacherChartData = [];
            foreach ($teacherMonthlyAttendance as $month => $data) {
                $total = $data['total'];
                $presentPercentage = $total > 0 ? ($data['present'] / $total) * 100 : 0;
                
                $teacherChartData[] = [
                    'month' => $month,
                    'attendance' => round($presentPercentage, 1),
                ];
            }

            $teacherAvgAttendance = count($teacherChartData) > 0 
                ? round(array_sum(array_column($teacherChartData, 'attendance')) / count($teacherChartData), 1) 
                : 0;

            return [
                'studentAttendance' => [
                    'data' => array_values($chartData),
                    'average' => $avgAttendance,
                ],
                'teacherAttendance' => [
                    'data' => array_values($teacherChartData),
                    'average' => $teacherAvgAttendance,
                ],
            ];
        } catch (Exception $e) {
            Log::error("Error fetching attendance trends: " . $e->getMessage());
            return [
                'studentAttendance' => ['data' => [], 'average' => 0],
                'teacherAttendance' => ['data' => [], 'average' => 0],
            ];
        }
    }

    /**
     * Get fee collection statistics
     */
    public function getFeeCollectionStats($schoolId, $start, $end): array
    {
        try {
            // Get fee payments within date range
            $payments = MonthlyPayment::where('school_id', $schoolId)
                ->whereBetween('created_at', [$start, $end])
                ->get();

            // Calculate totals
            $totalAmount = $payments->sum('total_amount');
            $paidAmount = $payments->where('status', 'paid')->sum('total_amount');
            $dueAmount = $payments->where('status', 'due')->sum('total_amount');

            // Calculate percentages
            $collectionPercentage = $totalAmount > 0 
                ? round(($paidAmount / $totalAmount) * 100, 1) 
                : 0;

            // Monthly breakdown
            $monthlyData = [];
            foreach ($payments as $payment) {
                $month = Carbon::parse($payment->created_at)->format('M Y');
                
                if (!isset($monthlyData[$month])) {
                    $monthlyData[$month] = ['paid' => 0, 'due' => 0];
                }
                
                if ($payment->status === 'paid') {
                    $monthlyData[$month]['paid'] += $payment->total_amount;
                } else {
                    $monthlyData[$month]['due'] += $payment->total_amount;
                }
            }

            // Format for pie chart
            $pieChartData = [
                ['name' => 'Collected', 'value' => round($paidAmount, 0)],
                ['name' => 'Pending', 'value' => round($dueAmount, 0)],
            ];

            return [
                'total' => round($totalAmount, 2),
                'paid' => round($paidAmount, 2),
                'due' => round($dueAmount, 2),
                'collectionRate' => $collectionPercentage,
                'pieChartData' => $pieChartData,
                'monthlyData' => array_values(array_map(function ($month, $data) {
                    return [
                        'month' => $month,
                        'paid' => round($data['paid'], 2),
                        'due' => round($data['due'], 2),
                    ];
                }, array_keys($monthlyData), $monthlyData)),
            ];
        } catch (Exception $e) {
            Log::error("Error fetching fee collection stats: " . $e->getMessage());
            return [
                'total' => 0,
                'paid' => 0,
                'due' => 0,
                'collectionRate' => 0,
                'pieChartData' => [],
                'monthlyData' => [],
            ];
        }
    }

    /**
     * Get performance metrics (exam results, grades, etc.)
     */
    public function getPerformanceMetrics($schoolId, $start, $end): array
    {
        try {
            // Get all exam marks within date range
            $examMarks = StudentExamMark::whereHas('examSchedule', function ($query) use ($schoolId, $start, $end) {
                $query->where('school_id', $schoolId)
                    ->whereBetween('exam_date', [$start, $end]);
            })->get();

            // Calculate average marks by subject
            $subjectMarks = [];
            foreach ($examMarks as $mark) {
                if ($mark->marks_total > 0 && $mark->marks_obtained !== null) {
                    $percentage = ($mark->marks_obtained / $mark->marks_total) * 100;
                    
                    // You might need to get subject from exam schedule
                    // For now, using a general approach
                    $key = 'Overall Performance';
                    
                    if (!isset($subjectMarks[$key])) {
                        $subjectMarks[$key] = ['total' => 0, 'count' => 0];
                    }
                    
                    $subjectMarks[$key]['total'] += $percentage;
                    $subjectMarks[$key]['count']++;
                }
            }

            // Format for chart
            $chartData = [];
            foreach ($subjectMarks as $subject => $data) {
                $average = $data['count'] > 0 ? $data['total'] / $data['count'] : 0;
                $chartData[] = [
                    'name' => $subject,
                    'average' => round($average, 1),
                    'students' => $data['count'],
                ];
            }

            // Get total students who appeared for exams
            $totalStudents = $examMarks->unique('student_id')->count();
            
            // Get passing students (assuming 35% as passing criteria)
            $passingMarks = $examMarks->filter(function ($mark) {
                if ($mark->marks_total > 0 && $mark->marks_obtained !== null) {
                    $percentage = ($mark->marks_obtained / $mark->marks_total) * 100;
                    return $percentage >= 35;
                }
                return false;
            });

            $passRate = $examMarks->count() > 0 
                ? round(($passingMarks->count() / $examMarks->count()) * 100, 1) 
                : 0;

            return [
                'totalStudents' => $totalStudents,
                'averagePerformance' => count($chartData) > 0 
                    ? round(array_sum(array_column($chartData, 'average')) / count($chartData), 1) 
                    : 0,
                'passRate' => $passRate,
                'subjectWiseData' => array_values($chartData),
            ];
        } catch (Exception $e) {
            Log::error("Error fetching performance metrics: " . $e->getMessage());
            return [
                'totalStudents' => 0,
                'averagePerformance' => 0,
                'passRate' => 0,
                'subjectWiseData' => [],
            ];
        }
    }

    /**
     * Get summary statistics
     */
    public function getSummaryStats($schoolId): array
    {
        try {
            $totalStudents = Student::where('school_id', $schoolId)->count();
            $totalTeachers = Teacher::where('school_id', $schoolId)->count();
            $totalClasses = SchoolClass::where('school_id', $schoolId)->where('status', 'active')->count();

            // Get recent attendance for average calculation
            $recentAttendanceRecords = StudentAttendanceRecord::where('school_id', $schoolId)
                ->whereBetween('attendance_date', [Carbon::now()->subDays(30), Carbon::now()])
                ->get();
            
            $totalRecords = $recentAttendanceRecords->count();
            $presentCount = $recentAttendanceRecords->where('status', 'present')->count();
            
            $avgAttendance = $totalRecords > 0 
                ? round(($presentCount / $totalRecords) * 100, 1) 
                : 0;

            // Get fee collection percentage
            $totalPayments = MonthlyPayment::where('school_id', $schoolId)->get();
            $totalFeeAmount = $totalPayments->sum('total_amount');
            $paidFeeAmount = $totalPayments->where('status', 'paid')->sum('total_amount');
            
            $feeCollectionRate = $totalFeeAmount > 0 
                ? round(($paidFeeAmount / $totalFeeAmount) * 100, 1) 
                : 0;

            return [
                'totalStudents' => $totalStudents,
                'totalTeachers' => $totalTeachers,
                'classCount' => $totalClasses,
                'avgAttendance' => $avgAttendance,
                'feeCollectionRate' => $feeCollectionRate,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching summary stats: " . $e->getMessage());
            return [
                'totalStudents' => 0,
                'totalTeachers' => 0,
                'classCount' => 0,
                'avgAttendance' => 0,
                'feeCollectionRate' => 0,
            ];
        }
    }
}
