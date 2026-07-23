<?php

namespace App\Http\Controllers;

use App\Services\ExamService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * StudentExamController
 *
 * Handles HTTP requests for student exam-related operations
 */
class StudentExamController extends Controller
{
    protected ExamService $examService;

    public function __construct(ExamService $examService)
    {
        $this->examService = $examService;
    }

    /**
     * Get exams for a student's class
     *
     * @param int $studentId
     * @param int $schoolId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStudentExams(int $studentId, int $schoolId)
    {
        try {
            // Get student's class details
            $studentDetails = DB::table('student_details')
                ->where('id', $studentId)
                ->where('school_id', $schoolId)
                ->first();

            if (!$studentDetails) {
                return response()->json([
                    'status' => false,
                    'message' => 'Student not found',
                    'data' => []
                ], 404);
            }

            // Find the school_class id based on class and section
            $schoolClass = DB::table('school_class')
                ->where('school_id', $schoolId)
                ->where('class', $studentDetails->class)
                ->where('section', $studentDetails->section)
                ->first();

            if (!$schoolClass) {
                return response()->json([
                    'status' => false,
                    'message' => 'Class information not found',
                    'data' => []
                ], 404);
            }

            $classId = $schoolClass->id;

            // Get all exams for the school
            $examsResult = $this->examService->getAllExams($schoolId);

            if (!$examsResult['status']) {
                return response()->json($examsResult, 400);
            }

            $exams = $examsResult['data'];

            // For each exam, check if there are schedules for this student's class
            $studentExams = [];
            foreach ($exams as $exam) {
                $schedulesResult = $this->examService->getExamSchedules($exam->id, $classId);

                if ($schedulesResult['status'] && !empty($schedulesResult['data'])) {
                    // This exam has schedules for the student's class
                    $studentExams[] = $exam;
                }
            }

            // Sort by start date (most recent first) and limit to 10
            usort($studentExams, function($a, $b) {
                return strtotime($b->start_date) - strtotime($a->start_date);
            });

            $studentExams = array_slice($studentExams, 0, 10);

            return response()->json([
                'status' => true,
                'message' => 'Student exams fetched successfully',
                'data' => $studentExams,
            ], 200);

        } catch (Exception $e) {
            Log::error("StudentExamController::getStudentExams - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get exam schedules for a student's class
     *
     * @param int $studentId
     * @param int $examId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStudentExamSchedules(int $studentId, int $examId)
    {
        try {
            // Get student's class details
            $studentDetails = DB::table('student_details')
                ->where('id', $studentId)
                ->first();

            if (!$studentDetails) {
                return response()->json([
                    'status' => false,
                    'message' => 'Student not found',
                    'data' => []
                ], 404);
            }

            // Find the school_class id based on class and section
            $schoolClass = DB::table('school_class')
                ->where('school_id', $studentDetails->school_id)
                ->where('class', $studentDetails->class)
                ->where('section', $studentDetails->section)
                ->first();

            if (!$schoolClass) {
                return response()->json([
                    'status' => false,
                    'message' => 'Class information not found',
                    'data' => []
                ], 404);
            }

            $classId = $schoolClass->id;

            // Get schedules for this exam and student's class
            $result = $this->examService->getExamSchedules($examId, $classId);

            return response()->json($result, $result['status'] ? 200 : 400);

        } catch (Exception $e) {
            Log::error("StudentExamController::getStudentExamSchedules - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get student's exam marks
     *
     * @param int $studentId
     * @param int $schoolId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStudentMarks(int $studentId, int $schoolId)
    {
        try {
            $result = $this->examService->getStudentMarks($studentId, $schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("StudentExamController::getStudentMarks - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get student's report card for a specific exam
     *
     * @param int $studentId
     * @param int $examId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStudentReportCard(int $studentId, int $examId)
    {
        try {
            // Get student details
            $studentDetails = DB::table('student_details')
                ->join('students', 'student_details.student_id', '=', 'students.id')
                ->where('student_details.id', $studentId)
                ->select('student_details.*', 'students.full_name', 'students.roll_number')
                ->first();

            if (!$studentDetails) {
                return response()->json([
                    'status' => false,
                    'message' => 'Student not found'
                ], 404);
            }

            // Get exam details
            $examResult = $this->examService->getExamById($examId);
            if (!$examResult['status']) {
                return response()->json($examResult, 404);
            }

            // Get student's marks for this exam
            $marksResult = $this->examService->getStudentMarks($studentId, $studentDetails->school_id);

            if (!$marksResult['status']) {
                return response()->json($marksResult, 400);
            }

            // Filter marks for this specific exam
            $examMarks = array_filter($marksResult['data'], function($mark) use ($examId) {
                return isset($mark->exam_id) && $mark->exam_id == $examId;
            });

            return response()->json([
                'status' => true,
                'message' => 'Report card generated successfully',
                'data' => [
                    'student' => $studentDetails,
                    'exam' => $examResult['data'],
                    'marks' => array_values($examMarks),
                ]
            ], 200);

        } catch (Exception $e) {
            Log::error("StudentExamController::getStudentReportCard - " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

