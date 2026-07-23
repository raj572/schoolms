<?php

namespace App\Repositories;

use App\Models\StudentExamMark;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * StudentExamMarkRepository
 *
 * Handles database operations for StudentExamMark model
 */
class StudentExamMarkRepository
{
    /**
     * Get marks for an exam schedule
     */
    public function getByExamSchedule(int $examScheduleId): Collection
    {
        return StudentExamMark::where('exam_schedule_id', $examScheduleId)
            ->with(['student', 'studentDetails', 'enteredByTeacher'])
            ->get();
    }

    /**
     * Get student's marks for an exam
     */
    public function getStudentMarks(int $studentId, int $examScheduleId): ?StudentExamMark
    {
        return StudentExamMark::where('student_id', $studentId)
            ->where('exam_schedule_id', $examScheduleId)
            ->with(['examSchedule.subject'])
            ->first();
    }

    /**
     * Get all marks for a student across all exams
     */
    public function getStudentAllMarks(int $studentId, int $schoolId): Collection
    {
        return StudentExamMark::where('student_id', $studentId)
            ->whereHas('examSchedule', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })
            ->with(['examSchedule.exam', 'examSchedule.subject'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Create or update student marks
     */
    public function upsert(array $data): StudentExamMark
    {
        return DB::transaction(function () use ($data) {
            return StudentExamMark::updateOrCreate(
                [
                    'exam_schedule_id' => $data['exam_schedule_id'],
                    'student_id' => $data['student_id'],
                ],
                $data
            );
        });
    }

    /**
     * Bulk insert/update marks
     */
    public function bulkUpsert(array $marks): bool
    {
        return DB::transaction(function () use ($marks) {
            foreach ($marks as $mark) {
                StudentExamMark::updateOrCreate(
                    [
                        'exam_schedule_id' => $mark['exam_schedule_id'],
                        'student_id' => $mark['student_id'],
                    ],
                    $mark
                );
            }
            return true;
        });
    }

    /**
     * Calculate grade based on percentage
     */
    public function calculateGrade(float $percentage): string
    {
        if ($percentage >= 90) return 'A+';
        if ($percentage >= 80) return 'A';
        if ($percentage >= 70) return 'B+';
        if ($percentage >= 60) return 'B';
        if ($percentage >= 50) return 'C+';
        if ($percentage >= 40) return 'C';
        return 'F';
    }

    /**
     * Get exam report for a student
     */
    public function getStudentExamReport(int $studentId, int $examId): array
    {
        $marks = StudentExamMark::whereHas('examSchedule', function ($query) use ($examId) {
            $query->where('exam_id', $examId);
        })
            ->where('student_id', $studentId)
            ->with(['examSchedule.subject'])
            ->get();

        $totalMarks = $marks->sum('marks_obtained');
        $totalPossible = $marks->sum('marks_total');
        $percentage = $totalPossible > 0 ? ($totalMarks / $totalPossible) * 100 : 0;

        return [
            'marks' => $marks,
            'total_marks' => $totalMarks,
            'total_possible' => $totalPossible,
            'percentage' => round($percentage, 2),
            'grade' => $this->calculateGrade($percentage),
        ];
    }

    /**
     * Get all marks for a student in an exam
     */
    public function getByStudent(int $studentId, int $examId): Collection
    {
        return StudentExamMark::where('student_id', $studentId)
            ->whereHas('examSchedule', function ($query) use ($examId) {
                $query->where('exam_id', $examId);
            })
            ->with(['examSchedule.subject'])
            ->get();
    }
}


