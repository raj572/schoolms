<?php

namespace App\Http\Controllers;

use App\Services\ExamService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * ExamController
 *
 * Handles HTTP requests for exam management
 */
class ExamController extends Controller
{
    protected ExamService $examService;

    public function __construct(ExamService $examService)
    {
        $this->examService = $examService;
    }

    /**
     * Get all exams for a school
     */
    public function getAllExams(int $schoolId)
    {
        try {
            $result = $this->examService->getAllExams($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::getAllExams - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get exam by ID
     */
    public function getExam(int $id)
    {
        try {
            $result = $this->examService->getExamById($id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("ExamController::getExam - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Create exam
     */
    public function createExam(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_id' => 'required|exists:schools,id',
            'exam_name' => 'required|string|max:255',
            'exam_type' => 'nullable|string|max:100',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->examService->createExam($validator->validated());
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::createExam - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Update exam
     */
    public function updateExam(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'exam_name' => 'sometimes|string|max:255',
            'exam_type' => 'nullable|string|max:100',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:scheduled,ongoing,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->examService->updateExam($id, $validator->validated());
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::updateExam - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Delete exam
     */
    public function deleteExam(int $id)
    {
        try {
            $result = $this->examService->deleteExam($id);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::deleteExam - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Create exam schedule
     */
    public function createSchedule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'exam_id' => 'required|exists:exams,id',
            'school_id' => 'required|exists:schools,id',
            'class_id' => 'required|exists:school_class,id',
            'subject_id' => 'required|exists:school_subjects,id',
            'exam_date' => 'required|date',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s|after:start_time',
            'total_marks' => 'required|integer|min:1',
            'passing_marks' => 'required|integer|min:1|lte:total_marks',
            'room_number' => 'nullable|string|max:50',
            'instructions' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->examService->createSchedule($validator->validated());
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::createSchedule - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get exam schedules
     */
    public function getSchedules(Request $request, int $examId)
    {
        try {
            $classId = $request->query('class_id');
            $result = $this->examService->getExamSchedules($examId, $classId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::getSchedules - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Update exam schedule
     */
    public function updateSchedule(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'class_id' => 'sometimes|exists:school_class,id',
            'subject_id' => 'sometimes|exists:school_subjects,id',
            'exam_date' => 'sometimes|date',
            'start_time' => 'sometimes|date_format:H:i:s',
            'end_time' => 'sometimes|date_format:H:i:s|after:start_time',
            'total_marks' => 'sometimes|integer|min:1',
            'passing_marks' => 'sometimes|integer|min:1|lte:total_marks',
            'room_number' => 'nullable|string|max:50',
            'instructions' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->examService->updateSchedule($id, $validator->validated());
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::updateSchedule - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Delete exam schedule
     */
    public function deleteSchedule(int $id)
    {
        try {
            $result = $this->examService->deleteSchedule($id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("ExamController::deleteSchedule - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Bulk update exam schedules (update existing, create new)
     */
    public function bulkUpdateSchedules(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'exam_id' => 'required|exists:exams,id',
            'schedules' => 'required|array|min:1',
            'schedules.*.id' => 'nullable|exists:exam_schedules,id',
            'schedules.*.school_id' => 'required|exists:schools,id',
            'schedules.*.class_id' => 'required|exists:school_class,id',
            'schedules.*.subject_id' => 'required|exists:school_subjects,id',
            'schedules.*.exam_date' => 'required|date',
            'schedules.*.start_time' => 'required|date_format:H:i:s',
            'schedules.*.end_time' => 'required|date_format:H:i:s',
            'schedules.*.total_marks' => 'required|integer|min:1',
            'schedules.*.passing_marks' => 'required|integer|min:1|lte:schedules.*.total_marks',
            'schedules.*.room_number' => 'nullable|string|max:50',
            'schedules.*.instructions' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $validated = $validator->validated();
            $result = $this->examService->bulkUpdateSchedules(
                $validated['exam_id'],
                $validated['schedules']
            );
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::bulkUpdateSchedules - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Enter marks
     */
    public function enterMarks(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'exam_schedule_id' => 'required|exists:exam_schedules,id',
            'student_id' => 'required|exists:students,id',
            'student_details_id' => 'required|exists:student_details,id',
            'marks_obtained' => 'nullable|numeric|min:0',
            'marks_total' => 'required|numeric|min:1',
            'remarks' => 'nullable|string',
            'status' => 'sometimes|in:pending,submitted,absent',
            'entered_by' => 'required|exists:teachers,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->examService->enterMarks($validator->validated());
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::enterMarks - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Bulk enter marks
     */
    public function bulkEnterMarks(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'marks' => 'required|array|min:1',
            'marks.*.exam_schedule_id' => 'required|exists:exam_schedules,id',
            'marks.*.student_id' => 'required|exists:students,id',
            'marks.*.student_details_id' => 'required|exists:student_details,id',
            'marks.*.marks_obtained' => 'nullable|numeric|min:0',
            'marks.*.marks_total' => 'required|numeric|min:1',
            'marks.*.remarks' => 'nullable|string',
            'teacher_id' => 'required|exists:teachers,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();
            $result = $this->examService->bulkEnterMarks($data['marks'], $data['teacher_id']);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::bulkEnterMarks - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get marks for exam schedule
     */
    public function getScheduleMarks(int $examScheduleId)
    {
        try {
            $result = $this->examService->getExamScheduleMarks($examScheduleId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::getScheduleMarks - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get student exam report
     */
    public function getStudentReport(int $studentId, int $examId)
    {
        try {
            $result = $this->examService->getStudentExamReport($studentId, $examId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::getStudentReport - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get student all marks
     */
    public function getStudentMarks(int $studentId, int $schoolId)
    {
        try {
            $result = $this->examService->getStudentAllMarks($studentId, $schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::getStudentMarks - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get all subjects for a school
     */
    public function getSubjects(int $schoolId)
    {
        try {
            $subjects = \App\Models\SchoolSubject::where('school_id', $schoolId)->get();
            return response()->json([
                'status' => true,
                'data' => $subjects,
            ]);
        } catch (Exception $e) {
            Log::error("ExamController::getSubjects - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get all classes for a school
     */
    public function getClasses(int $schoolId)
    {
        try {
            $classes = \App\Models\SchoolClass::where('school_id', $schoolId)->get();
            return response()->json([
                'status' => true,
                'data' => $classes,
            ]);
        } catch (Exception $e) {
            Log::error("ExamController::getClasses - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Bulk create exam schedules
     */
    public function bulkCreateSchedules(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'exam_id' => 'required|exists:exams,id',
            'schedules' => 'required|array|min:1',
            'schedules.*.school_id' => 'required|exists:schools,id',
            'schedules.*.class_id' => 'required|exists:school_class,id',
            'schedules.*.subject_id' => 'required|exists:school_subjects,id',
            'schedules.*.exam_date' => 'required|date',
            'schedules.*.start_time' => 'required',
            'schedules.*.end_time' => 'required',
            'schedules.*.total_marks' => 'required|integer|min:1',
            'schedules.*.passing_marks' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();
            foreach ($data['schedules'] as &$schedule) {
                $schedule['exam_id'] = $data['exam_id'];
            }
            $result = $this->examService->bulkCreateSchedules($data['schedules']);
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::bulkCreateSchedules - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get students for an exam schedule
     */
    public function getScheduleStudents(int $scheduleId)
    {
        try {
            $schedule = \App\Models\ExamSchedule::with('schoolClass')->findOrFail($scheduleId);

            if (!$schedule->schoolClass) {
                return response()->json([
                    'status' => false,
                    'message' => 'Class not found for this schedule',
                ], 404);
            }

            $students = \App\Models\StudentDetails::where('school_id', $schedule->school_id)
                ->where('class', $schedule->schoolClass->class)
                ->where('section', $schedule->schoolClass->section)
                ->where('status', 'studying')
                ->get();

            return response()->json([
                'status' => true,
                'data' => $students,
            ]);
        } catch (Exception $e) {
            Log::error("ExamController::getScheduleStudents - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Bulk enter marks for a schedule
     */
    public function bulkEnterMarksForSchedule(Request $request, int $scheduleId)
    {
        $validator = Validator::make($request->all(), [
            'marks' => 'required|array|min:1',
            'marks.*.student_id' => 'required|exists:students,id',
            'marks.*.student_details_id' => 'required|exists:student_details,id',
            'marks.*.marks_obtained' => 'nullable|numeric|min:0',
            'marks.*.remarks' => 'nullable|string',
            'marks.*.status' => 'sometimes|in:pending,submitted,absent',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $schedule = \App\Models\ExamSchedule::findOrFail($scheduleId);
            $data = $validator->validated();

            // Add exam_schedule_id and marks_total to each mark
            foreach ($data['marks'] as &$mark) {
                $mark['exam_schedule_id'] = $scheduleId;
                $mark['marks_total'] = $schedule->total_marks;
            }

            // Get entered_by ID - use authenticated user ID or null
            // For principals, this will be null as they don't have teacher records
            $enteredBy = auth()->id() ?? null;

            $result = $this->examService->bulkEnterMarks($data['marks'], $enteredBy);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::bulkEnterMarksForSchedule - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Generate report card
     */
    public function generateReportCard(int $examId, int $studentId)
    {
        try {
            $exam = \App\Models\Exam::findOrFail($examId);
            $studentDetails = \App\Models\StudentDetails::findOrFail($studentId);

            // Get all marks for this student in this exam
            $marks = \App\Models\StudentExamMark::whereHas('examSchedule', function ($query) use ($examId) {
                $query->where('exam_id', $examId);
            })
            ->where('student_details_id', $studentId)
            ->with(['examSchedule.subject'])
            ->get();

            $reportData = [
                'exam' => $exam,
                'student' => $studentDetails,
                'marks' => [],
                'total_obtained' => 0,
                'total_possible' => 0,
                'percentage' => 0,
                'grade' => 'F',
            ];

            foreach ($marks as $mark) {
                $subjectMarks = [
                    'subject' => $mark->examSchedule->subject->subject_name,
                    'marks_obtained' => $mark->marks_obtained ?? 0,
                    'marks_total' => $mark->marks_total,
                    'percentage' => $mark->marks_total > 0 ? ($mark->marks_obtained ?? 0) / $mark->marks_total * 100 : 0,
                    'grade' => $mark->grade ?? 'F',
                ];
                $reportData['marks'][] = $subjectMarks;
                $reportData['total_obtained'] += $mark->marks_obtained ?? 0;
                $reportData['total_possible'] += $mark->marks_total;
            }

            $reportData['percentage'] = $reportData['total_possible'] > 0
                ? ($reportData['total_obtained'] / $reportData['total_possible']) * 100
                : 0;

            // Calculate overall grade
            $reportData['grade'] = $this->examService->calculateGrade($reportData['percentage']);

            return response()->json([
                'status' => true,
                'data' => $reportData,
            ]);
        } catch (Exception $e) {
            Log::error("ExamController::generateReportCard - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get students for exam+class combination
     */
    public function getExamClassStudents(int $examId, int $classId)
    {
        try {
            $result = $this->examService->getExamClassStudents($examId, $classId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::getExamClassStudents - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get all schedules for a student in an exam
     */
    public function getStudentSchedules(int $examId, int $classId, int $studentId)
    {
        try {
            $result = $this->examService->getStudentSchedules($examId, $classId, $studentId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::getStudentSchedules - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Student-wise marks entry (one student, multiple subjects)
     */
    public function studentWiseMarksEntry(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'student_details_id' => 'required|exists:student_details,id',
            'marks' => 'required|array|min:1',
            'marks.*.exam_schedule_id' => 'required|exists:exam_schedules,id',
            'marks.*.marks_obtained' => 'nullable|numeric|min:0',
            'marks.*.remarks' => 'nullable|string',
            'marks.*.status' => 'sometimes|in:pending,submitted,absent',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();

            // Get entered_by ID - use authenticated user ID or null
            // For principals, this will be null as they don't have teacher records
            $enteredBy = auth()->id() ?? null;

            $result = $this->examService->enterStudentWiseMarks(
                $data['student_id'],
                $data['student_details_id'],
                $data['marks'],
                $enteredBy
            );
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::studentWiseMarksEntry - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * CSV import marks
     */
    public function csvImportMarks(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'csv_file' => 'required|file|mimes:csv,txt|max:5120', // 5MB max
            'exam_id' => 'required|exists:exams,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('csv_file');
            $examId = $request->input('exam_id');

            // Get entered_by ID - use authenticated user ID or null
            // For principals, this will be null as they don't have teacher records
            $enteredBy = auth()->id() ?? null;

            $result = $this->examService->importMarksFromCSV($file, $examId, $enteredBy);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::csvImportMarks - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Download CSV template
     */
    public function downloadCsvTemplate(int $examId)
    {
        try {
            $result = $this->examService->generateCsvTemplate($examId);

            if (!$result['status']) {
                return response()->json($result, 400);
            }

            return response()->json([
                'status' => true,
                'data' => $result['data'],
            ]);
        } catch (Exception $e) {
            Log::error("ExamController::downloadCsvTemplate - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get exam statistics
     */
    public function getExamStats(int $schoolId)
    {
        try {
            $result = $this->examService->getExamStats($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::getExamStats - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get student results with search/filter
     */
    public function getStudentResults(Request $request, int $schoolId)
    {
        try {
            $examId = $request->query('exam_id') ? (int)$request->query('exam_id') : null;
            $classId = $request->query('class_id') ? (int)$request->query('class_id') : null;
            $search = $request->query('search');
            
            $result = $this->examService->getStudentResults($schoolId, $examId, $classId, $search);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::getStudentResults - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get exam results with calculated statistics
     */
    public function getExamResults(int $schoolId)
    {
        try {
            $result = $this->examService->getExamResults($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("ExamController::getExamResults - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }
}


