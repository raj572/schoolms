<?php

namespace App\Services;

use App\Repositories\StudentDashboardRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class StudentDashboardService
{
    protected StudentDashboardRepository $repository;

    public function __construct(StudentDashboardRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get complete dashboard data for a student
     */
    public function getDashboardData(int $studentId, int $schoolId): array
    {
        try {
            // Get student info
            $studentInfo = $this->getStudentInfo($studentId);

            if (!$studentInfo['status']) {
                return $studentInfo;
            }

            // Get class details
            $classDetails = $this->repository->getStudentClassDetails($studentId);

            if (!$classDetails) {
                return [
                    'status' => false,
                    'message' => 'Student class information not found',
                ];
            }

            $classId = $classDetails->class_id;

            // Get today's classes
            $dayOfWeek = Carbon::now()->format('l'); // Monday, Tuesday, etc.
            $todayClasses = $this->repository->getTodayClassesForClass($classId, $dayOfWeek, $schoolId);
            $todayClassesData = $this->formatTodayClasses($todayClasses);

            // Get syllabus completion
            $syllabusCompletion = $this->repository->getSyllabusCompletionForClass($classId, $schoolId);
            $syllabusData = $this->formatSyllabusCompletion($syllabusCompletion);

            // Calculate stats
            $stats = $this->calculateStats($todayClassesData, $syllabusData);

            return [
                'status' => true,
                'message' => 'Dashboard data fetched successfully',
                'data' => [
                    'student_info' => $studentInfo['data'],
                    'class_details' => [
                        'class_id' => $classDetails->class_id,
                        'class' => $classDetails->class,
                        'section' => $classDetails->section,
                        'room_no' => $classDetails->room_no,
                        'teacher_in_charge' => $classDetails->teacher_in_charge,
                    ],
                    'stats' => $stats,
                    'todays_classes' => $todayClassesData,
                    'syllabus_completion' => $syllabusData,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Error in getDashboardData: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Error fetching dashboard data: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get student info
     */
    public function getStudentInfo(int $studentId): array
    {
        try {
            $student = $this->repository->getStudentWithDetails($studentId);

            if (!$student) {
                return [
                    'status' => false,
                    'message' => 'Student not found',
                ];
            }

            $detail = $student->detail;

            return [
                'status' => true,
                'message' => 'Student info fetched successfully',
                'data' => [
                    'id' => $student->id,
                    'name' => $detail ? $detail->candidate_name : $student->username,
                    'class' => $detail ? $detail->class : $student->class,
                    'section' => $detail ? $detail->section : null,
                    'roll_no' => $detail ? $detail->roll_no : null,
                    'email' => $student->email,
                    'status' => $student->status,
                    'phone' => $detail ? $detail->phone : null,
                    'gender' => $detail ? $detail->gender : null,
                    'dob' => $detail ? $detail->dob : null,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Error fetching student info: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Error fetching student info: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get today's classes for a student
     */
    public function getTodayClasses(int $studentId, int $schoolId): array
    {
        try {
            $classDetails = $this->repository->getStudentClassDetails($studentId);

            if (!$classDetails) {
                return [
                    'status' => false,
                    'message' => 'Student class not found',
                ];
            }

            $dayOfWeek = Carbon::now()->format('l');
            $classes = $this->repository->getTodayClassesForClass($classDetails->class_id, $dayOfWeek, $schoolId);
            $formattedClasses = $this->formatTodayClasses($classes);

            return [
                'status' => true,
                'message' => 'Today\'s classes fetched successfully',
                'data' => $formattedClasses,
            ];
        } catch (\Exception $e) {
            Log::error('Error fetching today\'s classes: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Error fetching today\'s classes: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get syllabus progress for a student
     */
    public function getSyllabusProgress(int $studentId, int $schoolId): array
    {
        try {
            $classDetails = $this->repository->getStudentClassDetails($studentId);

            if (!$classDetails) {
                return [
                    'status' => false,
                    'message' => 'Student class not found',
                ];
            }

            $syllabusCompletion = $this->repository->getSyllabusCompletionForClass($classDetails->class_id, $schoolId);
            $formattedData = $this->formatSyllabusCompletion($syllabusCompletion);

            return [
                'status' => true,
                'message' => 'Syllabus progress fetched successfully',
                'data' => $formattedData,
            ];
        } catch (\Exception $e) {
            Log::error('Error fetching syllabus progress: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Error fetching syllabus progress: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Format today's classes with current/next indicators
     */
    private function formatTodayClasses($classes): array
    {
        $now = Carbon::now();
        $currentTime = $now->format('H:i:s');
        $formattedClasses = [];
        $nextClassFound = false;

        foreach ($classes as $class) {
            $isCurrent = $currentTime >= $class->start_time && $currentTime < $class->end_time;
            $isNext = !$nextClassFound && $currentTime < $class->start_time;

            if ($isNext) {
                $nextClassFound = true;
            }

            $formattedClasses[] = [
                'id' => $class->id,
                'subject_id' => $class->subject_id,
                'subject_name' => $class->subject_name,
                'teacher_name' => $class->teacher_name,
                'start_time' => Carbon::parse($class->start_time)->format('H:i'),
                'end_time' => Carbon::parse($class->end_time)->format('H:i'),
                'room_no' => $class->room_no,
                'is_current' => $isCurrent,
                'is_next' => $isNext,
            ];
        }

        return $formattedClasses;
    }

    /**
     * Format syllabus completion data
     */
    private function formatSyllabusCompletion($syllabusData): array
    {
        $formatted = [];

        foreach ($syllabusData as $subject) {
            $formatted[] = [
                'subject_id' => $subject->subject_id,
                'subject_name' => $subject->subject_name,
                'total_chapters' => $subject->total_chapters,
                'completed_chapters' => $subject->completed_chapters,
                'percentage' => (float) $subject->percentage,
                'last_updated' => $subject->last_updated,
                'remarks' => $subject->remarks,
                'teacher_name' => $subject->teacher_name,
            ];
        }

        return $formatted;
    }

    /**
     * Calculate dashboard statistics
     */
    private function calculateStats(array $todayClasses, array $syllabusData): array
    {
        $totalSubjects = count($syllabusData);
        $classesToday = count($todayClasses);

        // Calculate average syllabus completion
        $totalPercentage = 0;
        foreach ($syllabusData as $subject) {
            $totalPercentage += $subject['percentage'];
        }
        $averageSyllabusCompletion = $totalSubjects > 0 ? round($totalPercentage / $totalSubjects, 2) : 0;

        // Find next class time
        $nextClassTime = null;
        foreach ($todayClasses as $class) {
            if ($class['is_next'] || $class['is_current']) {
                $nextClassTime = $class['start_time'];
                break;
            }
        }

        return [
            'total_subjects' => $totalSubjects,
            'classes_today' => $classesToday,
            'average_syllabus_completion' => $averageSyllabusCompletion,
            'next_class_time' => $nextClassTime,
        ];
    }
}

