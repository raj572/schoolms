<?php

namespace App\Services;

use App\Repositories\ExamRepository;
use App\Repositories\ExamScheduleRepository;
use App\Repositories\StudentExamMarkRepository;
use Exception;
use Illuminate\Support\Facades\Log;

/**
 * ExamService
 *
 * Handles business logic for exam management
 */
class ExamService
{
    protected ExamRepository $examRepository;
    protected ExamScheduleRepository $examScheduleRepository;
    protected StudentExamMarkRepository $studentExamMarkRepository;

    public function __construct(
        ExamRepository $examRepository,
        ExamScheduleRepository $examScheduleRepository,
        StudentExamMarkRepository $studentExamMarkRepository
    ) {
        $this->examRepository = $examRepository;
        $this->examScheduleRepository = $examScheduleRepository;
        $this->studentExamMarkRepository = $studentExamMarkRepository;
    }

    /**
     * Get all exams for a school
     */
    public function getAllExams(int $schoolId): array
    {
        try {
            $exams = $this->examRepository->getAllBySchool($schoolId);

            return [
                'status' => true,
                'message' => 'Exams fetched successfully',
                'data' => $exams,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching exams: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch exams',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get exam by ID
     */
    public function getExamById(int $id): array
    {
        try {
            $exam = $this->examRepository->findById($id);

            if (!$exam) {
                return [
                    'status' => false,
                    'message' => 'Exam not found',
                ];
            }

            return [
                'status' => true,
                'message' => 'Exam fetched successfully',
                'data' => $exam,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching exam: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch exam',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create new exam
     */
    public function createExam(array $data): array
    {
        try {
            $exam = $this->examRepository->create($data);

            return [
                'status' => true,
                'message' => 'Exam created successfully',
                'data' => $exam,
            ];
        } catch (Exception $e) {
            Log::error("Error creating exam: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to create exam',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update exam
     */
    public function updateExam(int $id, array $data): array
    {
        try {
            $updated = $this->examRepository->update($id, $data);

            if (!$updated) {
                return [
                    'status' => false,
                    'message' => 'Failed to update exam',
                ];
            }

            return [
                'status' => true,
                'message' => 'Exam updated successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error updating exam: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update exam',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete exam
     */
    public function deleteExam(int $id): array
    {
        try {
            $deleted = $this->examRepository->delete($id);

            if (!$deleted) {
                return [
                    'status' => false,
                    'message' => 'Failed to delete exam',
                ];
            }

            return [
                'status' => true,
                'message' => 'Exam deleted successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error deleting exam: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to delete exam',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create exam schedule
     */
    public function createSchedule(array $data): array
    {
        try {
            $schedule = $this->examScheduleRepository->create($data);

            return [
                'status' => true,
                'message' => 'Exam schedule created successfully',
                'data' => $schedule,
            ];
        } catch (Exception $e) {
            Log::error("Error creating exam schedule: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to create exam schedule',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Bulk create exam schedules
     */
    public function bulkCreateSchedules(array $schedules): array
    {
        try {
            // Create schedules one by one to get IDs
            $createdSchedules = [];
            foreach ($schedules as $schedule) {
                $createdSchedule = $this->examScheduleRepository->create($schedule);
                $createdSchedules[] = $createdSchedule;
            }

            return [
                'status' => true,
                'message' => 'Exam schedules created successfully',
                'data' => $createdSchedules,
            ];
        } catch (Exception $e) {
            Log::error("Error creating exam schedules: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to create exam schedules',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get exam schedules
     */
    public function getExamSchedules(int $examId, ?int $classId = null): array
    {
        try {
            if ($classId) {
                $schedules = $this->examScheduleRepository->getByClass($examId, $classId);
            } else {
                $schedules = $this->examScheduleRepository->getByExam($examId);
            }

            // Add total student count for each schedule
            $schedules = $schedules->map(function ($schedule) {
                $class = $schedule->schoolClass;
                if ($class) {
                    // Count students in this class/section
                    $studentCount = \App\Models\StudentDetails::where('school_id', $schedule->school_id)
                        ->where('class', $class->class)
                        ->where('section', $class->section)
                        ->where('status', 'studying')
                        ->count();

                    $schedule->total_students = $studentCount;
                }
                return $schedule;
            });

            return [
                'status' => true,
                'message' => 'Exam schedules fetched successfully',
                'data' => $schedules,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching exam schedules: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch exam schedules',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update exam schedule
     */
    public function updateSchedule(int $id, array $data): array
    {
        try {
            $schedule = $this->examScheduleRepository->findById($id);

            if (!$schedule) {
                return [
                    'status' => false,
                    'message' => 'Exam schedule not found',
                ];
            }

            $this->examScheduleRepository->update($id, $data);

            // Reload the schedule with relations
            $updatedSchedule = $this->examScheduleRepository->findById($id);

            return [
                'status' => true,
                'message' => 'Exam schedule updated successfully',
                'data' => $updatedSchedule,
            ];
        } catch (Exception $e) {
            Log::error("Error updating exam schedule: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update exam schedule',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete exam schedule
     */
    public function deleteSchedule(int $id): array
    {
        try {
            $schedule = $this->examScheduleRepository->findById($id);

            if (!$schedule) {
                return [
                    'status' => false,
                    'message' => 'Exam schedule not found',
                ];
            }

            $this->examScheduleRepository->delete($id);

            return [
                'status' => true,
                'message' => 'Exam schedule deleted successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error deleting exam schedule: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to delete exam schedule',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Bulk update exam schedules (update existing, create new, optionally delete removed)
     */
    public function bulkUpdateSchedules(int $examId, array $schedules): array
    {
        try {
            $updatedSchedules = [];
            $createdSchedules = [];

            // Get all existing schedule IDs for this exam
            $existingSchedules = $this->examScheduleRepository->getByExam($examId);
            $existingIds = $existingSchedules->pluck('id')->toArray();
            $submittedIds = [];

            // Process each schedule
            foreach ($schedules as $schedule) {
                // Add exam_id to schedule
                $schedule['exam_id'] = $examId;

                if (isset($schedule['id']) && !empty($schedule['id'])) {
                    // Update existing schedule
                    $scheduleId = $schedule['id'];
                    $submittedIds[] = $scheduleId;

                    // Remove id from data before update
                    unset($schedule['id']);

                    $this->examScheduleRepository->update($scheduleId, $schedule);
                    $updatedSchedule = $this->examScheduleRepository->findById($scheduleId);
                    $updatedSchedules[] = $updatedSchedule;
                } else {
                    // Create new schedule
                    unset($schedule['id']); // Remove null/empty id
                    $newSchedule = $this->examScheduleRepository->create($schedule);
                    $createdSchedules[] = $newSchedule;
                }
            }

            // Delete schedules that were removed (no longer in submitted list)
            $deletedCount = 0;
            foreach ($existingIds as $existingId) {
                if (!in_array($existingId, $submittedIds)) {
                    $this->examScheduleRepository->delete($existingId);
                    $deletedCount++;
                }
            }

            // Fetch all updated schedules for the exam
            $allSchedules = $this->examScheduleRepository->getByExam($examId);

            return [
                'status' => true,
                'message' => 'Exam schedules updated successfully',
                'data' => $allSchedules,
                'summary' => [
                    'created' => count($createdSchedules),
                    'updated' => count($updatedSchedules),
                    'deleted' => $deletedCount,
                    'total' => $allSchedules->count(),
                ],
            ];
        } catch (Exception $e) {
            Log::error("Error bulk updating exam schedules: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update exam schedules',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Enter/Update student marks
     */
    public function enterMarks(array $data): array
    {
        try {
            // Calculate grade if marks are provided
            if (isset($data['marks_obtained']) && isset($data['marks_total'])) {
                $percentage = ($data['marks_obtained'] / $data['marks_total']) * 100;
                $data['grade'] = $this->studentExamMarkRepository->calculateGrade($percentage);
            }

            $data['entered_at'] = now();
            $data['status'] = 'submitted';

            $mark = $this->studentExamMarkRepository->upsert($data);

            return [
                'status' => true,
                'message' => 'Marks entered successfully',
                'data' => $mark,
            ];
        } catch (Exception $e) {
            Log::error("Error entering marks: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to enter marks',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Bulk enter marks
     */
    public function bulkEnterMarks(array $marks, ?int $teacherId): array
    {
        try {
            // Process each mark entry
            foreach ($marks as &$mark) {
                if (isset($mark['marks_obtained']) && isset($mark['marks_total'])) {
                    if ($mark['marks_obtained'] !== null && $mark['marks_total'] > 0) {
                        $percentage = ($mark['marks_obtained'] / $mark['marks_total']) * 100;
                        $mark['grade'] = $this->studentExamMarkRepository->calculateGrade($percentage);
                    }
                }
                $mark['entered_by'] = $teacherId; // Can be null for principals
                $mark['entered_at'] = now();
                if (!isset($mark['status']) || $mark['status'] === 'pending') {
                    $mark['status'] = isset($mark['marks_obtained']) && $mark['marks_obtained'] !== null ? 'submitted' : 'pending';
                }
            }

            $created = $this->studentExamMarkRepository->bulkUpsert($marks);

            if (!$created) {
                return [
                    'status' => false,
                    'message' => 'Failed to enter marks',
                ];
            }

            return [
                'status' => true,
                'message' => 'Marks entered successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error entering bulk marks: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to enter marks',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get marks for an exam schedule
     */
    public function getExamScheduleMarks(int $examScheduleId): array
    {
        try {
            $marks = $this->studentExamMarkRepository->getByExamSchedule($examScheduleId);

            return [
                'status' => true,
                'message' => 'Marks fetched successfully',
                'data' => $marks,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching marks: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch marks',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get student's exam report
     */
    public function getStudentExamReport(int $studentId, int $examId): array
    {
        try {
            $report = $this->studentExamMarkRepository->getStudentExamReport($studentId, $examId);

            return [
                'status' => true,
                'message' => 'Report generated successfully',
                'data' => $report,
            ];
        } catch (Exception $e) {
            Log::error("Error generating report: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to generate report',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get all marks for a student
     */
    public function getStudentMarks(int $studentId, int $schoolId): array
    {
        try {
            $marks = $this->studentExamMarkRepository->getStudentAllMarks($studentId, $schoolId);

            return [
                'status' => true,
                'message' => 'Student marks fetched successfully',
                'data' => $marks,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching student marks: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch student marks',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get student's all marks
     */
    public function getStudentAllMarks(int $studentId, int $schoolId): array
    {
        try {
            $marks = $this->studentExamMarkRepository->getStudentAllMarks($studentId, $schoolId);

            return [
                'status' => true,
                'message' => 'Marks fetched successfully',
                'data' => $marks,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching student marks: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch marks',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Calculate grade based on percentage
     */
    public function calculateGrade(float $percentage): string
    {
        return $this->studentExamMarkRepository->calculateGrade($percentage);
    }

    /**
     * Get students for exam+class combination
     */
    public function getExamClassStudents(int $examId, int $classId): array
    {
        try {
            // Get the exam and class details
            $exam = $this->examRepository->findById($examId);
            if (!$exam) {
                return [
                    'status' => false,
                    'message' => 'Exam not found',
                ];
            }

            $class = \App\Models\SchoolClass::find($classId);
            if (!$class) {
                return [
                    'status' => false,
                    'message' => 'Class not found',
                ];
            }

            // Get students from that class
            $students = \App\Models\StudentDetails::where('school_id', $exam->school_id)
                ->where('class', $class->class)
                ->where('section', $class->section)
                ->where('status', 'studying')
                ->with('student')
                ->get();

            return [
                'status' => true,
                'message' => 'Students fetched successfully',
                'data' => $students,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching exam class students: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch students',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get all schedules for a student in an exam
     */
    public function getStudentSchedules(int $examId, int $classId, int $studentId): array
    {
        try {
            // Get student details
            $studentDetails = \App\Models\StudentDetails::find($studentId);
            if (!$studentDetails) {
                return [
                    'status' => false,
                    'message' => 'Student not found',
                ];
            }

            // Get all schedules for this exam and class
            $schedules = $this->examScheduleRepository->getByClass($examId, $classId);

            // Get existing marks for this student
            $existingMarks = $this->studentExamMarkRepository->getByStudent($studentDetails->student_id, $examId);

            // Map existing marks by schedule_id
            $marksMap = [];
            foreach ($existingMarks as $mark) {
                $marksMap[$mark->exam_schedule_id] = $mark;
            }

            // Attach existing marks to schedules
            $schedulesWithMarks = $schedules->map(function ($schedule) use ($marksMap, $studentDetails) {
                $existingMark = $marksMap[$schedule->id] ?? null;

                return [
                    'id' => $schedule->id,
                    'exam_id' => $schedule->exam_id,
                    'subject_id' => $schedule->subject_id,
                    'subject_name' => $schedule->subject->subject_name ?? 'Unknown',
                    'exam_date' => $schedule->exam_date,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'total_marks' => $schedule->total_marks,
                    'passing_marks' => $schedule->passing_marks,
                    'existing_mark' => $existingMark ? [
                        'marks_obtained' => $existingMark->marks_obtained,
                        'grade' => $existingMark->grade,
                        'remarks' => $existingMark->remarks,
                        'status' => $existingMark->status,
                    ] : null,
                ];
            });

            return [
                'status' => true,
                'message' => 'Schedules fetched successfully',
                'data' => [
                    'student' => $studentDetails,
                    'schedules' => $schedulesWithMarks,
                ],
            ];
        } catch (Exception $e) {
            Log::error("Error fetching student schedules: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch schedules',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Enter marks student-wise (one student, multiple subjects)
     */
    public function enterStudentWiseMarks(int $studentId, int $studentDetailsId, array $marks, ?int $enteredBy): array
    {
        try {
            // Prepare marks data
            $preparedMarks = [];
            foreach ($marks as $mark) {
                // Get schedule to get total marks
                $schedule = $this->examScheduleRepository->findById($mark['exam_schedule_id']);
                if (!$schedule) {
                    continue;
                }

                $markData = [
                    'exam_schedule_id' => $mark['exam_schedule_id'],
                    'student_id' => $studentId,
                    'student_details_id' => $studentDetailsId,
                    'marks_obtained' => $mark['marks_obtained'] ?? null,
                    'marks_total' => $schedule->total_marks,
                    'remarks' => $mark['remarks'] ?? null,
                    'status' => $mark['status'] ?? 'submitted',
                    'entered_by' => $enteredBy,
                    'entered_at' => now(),
                ];

                // Calculate grade if marks are provided
                if (isset($mark['marks_obtained']) && $mark['marks_obtained'] !== null) {
                    $percentage = ($mark['marks_obtained'] / $schedule->total_marks) * 100;
                    $markData['grade'] = $this->studentExamMarkRepository->calculateGrade($percentage);
                }

                $preparedMarks[] = $markData;
            }

            // Bulk upsert
            $result = $this->studentExamMarkRepository->bulkUpsert($preparedMarks);

            if (!$result) {
                return [
                    'status' => false,
                    'message' => 'Failed to enter marks',
                ];
            }

            return [
                'status' => true,
                'message' => 'Marks entered successfully for student',
            ];
        } catch (Exception $e) {
            Log::error("Error entering student-wise marks: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to enter marks',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Import marks from CSV file
     */
    public function importMarksFromCSV($file, int $examId, ?int $enteredBy): array
    {
        try {
            // Parse CSV
            $csvData = array_map('str_getcsv', file($file->getRealPath()));
            $header = array_shift($csvData); // Remove header row

            // Validate header
            $expectedHeaders = ['class_name', 'subject_name', 'roll_no', 'student_name', 'marks_obtained', 'status', 'remarks'];
            if (count(array_intersect($expectedHeaders, $header)) !== count($expectedHeaders)) {
                return [
                    'status' => false,
                    'message' => 'Invalid CSV format. Required columns: ' . implode(', ', $expectedHeaders),
                ];
            }

            // Get exam details
            $exam = $this->examRepository->findById($examId);
            if (!$exam) {
                return [
                    'status' => false,
                    'message' => 'Exam not found',
                ];
            }

            // Get all schedules for this exam once
            $examSchedules = $this->examScheduleRepository->getByExam($examId);

            // Build a lookup map for faster access
            $scheduleMap = [];
            foreach ($examSchedules as $examSchedule) {
                $className = $examSchedule->schoolClass->class_name ?? null;
                $subjectName = $examSchedule->subject->subject_name ?? null;
                if ($className && $subjectName) {
                    $key = $className . '|' . $subjectName;
                    $scheduleMap[$key] = $examSchedule;
                }
            }

            $preparedMarks = [];
            $errors = [];
            $successCount = 0;

            foreach ($csvData as $index => $row) {
                $rowNum = $index + 2; // +2 because array is 0-indexed and we removed header

                if (count($row) < count($header)) {
                    $errors[] = "Row $rowNum: Insufficient columns";
                    continue;
                }

                $rowData = array_combine($header, $row);

                // Find schedule using the lookup map
                $className = trim($rowData['class_name']);
                $subjectName = trim($rowData['subject_name']);
                $lookupKey = $className . '|' . $subjectName;

                $schedule = $scheduleMap[$lookupKey] ?? null;

                if (!$schedule) {
                    $errors[] = "Row $rowNum: Class '{$className}' with subject '{$subjectName}' not found in exam schedules";
                    continue;
                }

                $class = $schedule->schoolClass;

                // Find student
                $studentDetails = \App\Models\StudentDetails::where('school_id', $exam->school_id)
                    ->where('class', $class->class)
                    ->where('section', $class->section)
                    ->where('roll_no', trim($rowData['roll_no']))
                    ->where('status', 'studying')
                    ->first();

                if (!$studentDetails) {
                    $errors[] = "Row $rowNum: Student with roll number '{$rowData['roll_no']}' not found";
                    continue;
                }

                // Prepare mark data
                $marksObtained = trim($rowData['marks_obtained']) !== '' ? floatval($rowData['marks_obtained']) : null;
                $status = in_array(strtolower(trim($rowData['status'])), ['absent', 'submitted'])
                    ? strtolower(trim($rowData['status']))
                    : 'submitted';

                $markData = [
                    'exam_schedule_id' => $schedule->id,
                    'student_id' => $studentDetails->student_id,
                    'student_details_id' => $studentDetails->id,
                    'marks_obtained' => $marksObtained,
                    'marks_total' => $schedule->total_marks,
                    'remarks' => trim($rowData['remarks'] ?? ''),
                    'status' => $status,
                    'entered_by' => $enteredBy,
                    'entered_at' => now(),
                ];

                // Calculate grade
                if ($marksObtained !== null && $schedule->total_marks > 0) {
                    $percentage = ($marksObtained / $schedule->total_marks) * 100;
                    $markData['grade'] = $this->studentExamMarkRepository->calculateGrade($percentage);
                }

                $preparedMarks[] = $markData;
                $successCount++;
            }

            // Bulk upsert prepared marks
            if (!empty($preparedMarks)) {
                $this->studentExamMarkRepository->bulkUpsert($preparedMarks);
            }

            return [
                'status' => true,
                'message' => "CSV import completed. $successCount records processed.",
                'data' => [
                    'success_count' => $successCount,
                    'error_count' => count($errors),
                    'errors' => $errors,
                ],
            ];
        } catch (Exception $e) {
            Log::error("Error importing CSV: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to import CSV',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate CSV template for marks entry
     */
    public function generateCsvTemplate(int $examId): array
    {
        try {
            $exam = $this->examRepository->findById($examId);
            if (!$exam) {
                return [
                    'status' => false,
                    'message' => 'Exam not found',
                ];
            }

            // Get all schedules for this exam
            $schedules = $this->examScheduleRepository->getByExam($examId);

            $csvData = [];
            $csvData[] = ['class_name', 'subject_name', 'roll_no', 'student_name', 'marks_obtained', 'status', 'remarks'];

            foreach ($schedules as $schedule) {
                $class = $schedule->schoolClass;
                $subject = $schedule->subject;

                // Get students for this class
                $students = \App\Models\StudentDetails::where('school_id', $exam->school_id)
                    ->where('class', $class->class)
                    ->where('section', $class->section)
                    ->where('status', 'studying')
                    ->orderBy('roll_no')
                    ->get();

                foreach ($students as $student) {
                    $csvData[] = [
                        $class->class_name,
                        $subject->subject_name,
                        $student->roll_no,
                        $student->candidate_name,
                        '', // marks_obtained (to be filled)
                        'submitted', // status (default)
                        '', // remarks (optional)
                    ];
                }
            }

            return [
                'status' => true,
                'message' => 'CSV template generated',
                'data' => $csvData,
            ];
        } catch (Exception $e) {
            Log::error("Error generating CSV template: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to generate template',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get exam statistics for a school
     */
    public function getExamStats(int $schoolId): array
    {
        try {
            // Get all exams for the school
            $exams = $this->examRepository->getAllBySchool($schoolId);
            $now = now();

            // Count upcoming and completed exams
            $upcomingExams = $exams->filter(function ($exam) use ($now) {
                return new \DateTime($exam->end_date) >= $now && $exam->status === 'scheduled';
            })->count();

            $completedExams = $exams->filter(function ($exam) use ($now) {
                return $exam->status === 'completed' || new \DateTime($exam->end_date) < $now;
            })->count();

            // Calculate average score and pass rate from actual marks
            $allMarks = \App\Models\StudentExamMark::whereHas('examSchedule', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })
            ->whereNotNull('marks_obtained')
            ->where('marks_total', '>', 0)
            ->get();

            $averageScore = 0;
            $passRate = 0;

            if ($allMarks->count() > 0) {
                // Calculate average percentage score
                $totalPercentage = 0;
                $passedCount = 0;

                foreach ($allMarks as $mark) {
                    $percentage = ($mark->marks_obtained / $mark->marks_total) * 100;
                    $totalPercentage += $percentage;

                    // Check if passed based on schedule passing_marks
                    $schedule = $mark->examSchedule;
                    if ($schedule && $schedule->passing_marks) {
                        $percentageRequired = ($schedule->passing_marks / $schedule->total_marks) * 100;
                        if ($percentage >= $percentageRequired) {
                            $passedCount++;
                        }
                    } else {
                        // Default 40% if no passing marks defined
                        if ($percentage >= 40) {
                            $passedCount++;
                        }
                    }
                }

                $averageScore = round($totalPercentage / $allMarks->count(), 1);
                $passRate = round(($passedCount / $allMarks->count()) * 100, 1);
            }

            return [
                'status' => true,
                'message' => 'Exam statistics fetched successfully',
                'data' => [
                    'upcomingExams' => $upcomingExams,
                    'completedExams' => $completedExams,
                    'averageScore' => $averageScore,
                    'passRate' => $passRate,
                ],
            ];
        } catch (Exception $e) {
            Log::error("Error fetching exam stats: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch exam statistics',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get student exam results with search/filter
     */
    public function getStudentResults(int $schoolId, ?int $examId = null, ?int $classId = null, ?string $search = null): array
    {
        try {
            $query = \App\Models\StudentExamMark::whereHas('examSchedule', function ($q) use ($schoolId, $examId) {
                $q->where('school_id', $schoolId);
                if ($examId) {
                    $q->where('exam_id', $examId);
                }
            })
            ->with([
                'studentDetails.student',
                'examSchedule.subject',
                'examSchedule.schoolClass',
                'examSchedule.exam',
            ]);

            // Apply class filter by class_id
            if ($classId) {
                $query->whereHas('examSchedule.schoolClass', function ($q) use ($classId) {
                    $q->where('id', $classId);
                });
            }

            // Apply search filter
            if ($search) {
                $query->whereHas('studentDetails', function ($q) use ($search) {
                    $q->where('candidate_name', 'like', "%{$search}%")
                      ->orWhere('roll_no', 'like', "%{$search}%");
                });
            }

            $marks = $query->get();

            // Transform data for display
            $results = $marks->map(function ($mark) {
                $student = $mark->studentDetails;
                $schedule = $mark->examSchedule;
                $class = $schedule->schoolClass ?? null;
                
                // Determine pass/fail status
                $status = 'Fail';
                if ($mark->marks_obtained !== null && $schedule->passing_marks) {
                    $percentage = ($mark->marks_obtained / $mark->marks_total) * 100;
                    $requiredPercentage = ($schedule->passing_marks / $schedule->total_marks) * 100;
                    $status = $percentage >= $requiredPercentage ? 'Pass' : 'Fail';
                } elseif ($mark->marks_obtained === null) {
                    $status = 'Pending';
                }

                return [
                    'studentId' => $mark->student_id,
                    'studentDetailsId' => $mark->student_details_id,
                    'name' => $student->candidate_name ?? 'Unknown',
                    'rollNo' => $student->roll_no ?? '',
                    'grade' => $class ? "Class {$class->class}" . ($class->section ? "-{$class->section}" : '') : 'N/A',
                    'subject' => $schedule->subject->subject_name ?? 'Unknown',
                    'marks' => $mark->marks_obtained ?? 0,
                    'grade_obtained' => $mark->grade ?? 'N/A',
                    'status' => $status,
                    'examName' => $schedule->exam->exam_name ?? 'Unknown',
                ];
            })->toArray();

            return [
                'status' => true,
                'message' => 'Student results fetched successfully',
                'data' => $results,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching student results: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch student results',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get exam results with calculated statistics
     */
    public function getExamResults(int $schoolId): array
    {
        try {
            $exams = $this->examRepository->getAllBySchool($schoolId);
            $now = now();

            // Filter completed exams
            $completedExams = $exams->filter(function ($exam) use ($now) {
                return $exam->status === 'completed' || new \DateTime($exam->end_date) < $now;
            });

            $results = [];

            foreach ($completedExams as $exam) {
                // Get all schedules for this exam
                $schedules = $this->examScheduleRepository->getByExam($exam->id);
                
                // Get all marks for this exam
                $examMarks = \App\Models\StudentExamMark::whereHas('examSchedule', function ($query) use ($exam) {
                    $query->where('exam_id', $exam->id);
                })
                ->whereNotNull('marks_obtained')
                ->where('marks_total', '>', 0)
                ->get();

                // Aggregate classes and subjects from schedules
                $classes = $schedules->pluck('schoolClass')
                    ->filter()
                    ->unique('id')
                    ->map(function ($class) {
                        return "Class {$class->class}" . ($class->section ? "-{$class->section}" : '');
                    })
                    ->values()
                    ->toArray();

                $subjects = $schedules->pluck('subject')
                    ->filter()
                    ->unique('id')
                    ->pluck('subject_name')
                    ->values()
                    ->toArray();

                $grade = count($classes) > 3 ? 'All Classes' : implode(', ', $classes);
                if (empty($grade)) {
                    $grade = 'All Grades';
                }

                // Calculate statistics
                $totalStudents = $examMarks->unique('student_id')->count();
                $avgScore = 0;
                $passRate = 0;

                if ($examMarks->count() > 0) {
                    // Calculate average score
                    $totalPercentage = 0;
                    foreach ($examMarks as $mark) {
                        $percentage = ($mark->marks_obtained / $mark->marks_total) * 100;
                        $totalPercentage += $percentage;
                    }
                    $avgScore = round($totalPercentage / $examMarks->count(), 1);

                    // Calculate pass rate
                    $passedCount = 0;
                    foreach ($examMarks as $mark) {
                        $schedule = $mark->examSchedule;
                        if ($schedule && $schedule->passing_marks) {
                            $percentage = ($mark->marks_obtained / $mark->marks_total) * 100;
                            $requiredPercentage = ($schedule->passing_marks / $schedule->total_marks) * 100;
                            if ($percentage >= $requiredPercentage) {
                                $passedCount++;
                            }
                        } else {
                            // Default 40% if no passing marks
                            $percentage = ($mark->marks_obtained / $mark->marks_total) * 100;
                            if ($percentage >= 40) {
                                $passedCount++;
                            }
                        }
                    }
                    $passRate = round(($passedCount / $examMarks->count()) * 100, 1);
                }

                $results[] = [
                    'examId' => $exam->id,
                    'title' => $exam->exam_name,
                    'grade' => $grade,
                    'totalStudents' => $totalStudents,
                    'avgScore' => $avgScore,
                    'passRate' => $passRate,
                    'status' => ucfirst($exam->status),
                    'date' => date('Y-m-d', strtotime($exam->end_date)),
                ];
            }

            return [
                'status' => true,
                'message' => 'Exam results fetched successfully',
                'data' => $results,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching exam results: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch exam results',
                'error' => $e->getMessage(),
            ];
        }
    }
}


