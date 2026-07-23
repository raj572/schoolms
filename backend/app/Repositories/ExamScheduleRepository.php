<?php

namespace App\Repositories;

use App\Models\ExamSchedule;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * ExamScheduleRepository
 *
 * Handles database operations for ExamSchedule model
 */
class ExamScheduleRepository
{
    /**
     * Get all schedules for an exam
     */
    public function getByExam(int $examId): Collection
    {
        return ExamSchedule::where('exam_id', $examId)
            ->with(['schoolClass', 'subject', 'marks'])
            ->orderBy('exam_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();
    }

    /**
     * Get schedules for a specific class
     */
    public function getByClass(int $examId, int $classId): Collection
    {
        return ExamSchedule::where('exam_id', $examId)
            ->where('class_id', $classId)
            ->with(['subject', 'marks'])
            ->orderBy('exam_date', 'asc')
            ->get();
    }

    /**
     * Find schedule by ID
     */
    public function findById(int $id): ?ExamSchedule
    {
        return ExamSchedule::with(['exam', 'schoolClass', 'subject', 'marks'])
            ->find($id);
    }

    /**
     * Create exam schedule
     */
    public function create(array $data): ExamSchedule
    {
        return DB::transaction(function () use ($data) {
            return ExamSchedule::create($data);
        });
    }

    /**
     * Bulk create exam schedules
     */
    public function bulkCreate(array $schedules): bool
    {
        return DB::transaction(function () use ($schedules) {
            foreach ($schedules as $schedule) {
                ExamSchedule::create($schedule);
            }
            return true;
        });
    }

    /**
     * Update exam schedule
     */
    public function update(int $id, array $data): bool
    {
        return DB::transaction(function () use ($id, $data) {
            $schedule = ExamSchedule::findOrFail($id);
            return $schedule->update($data);
        });
    }

    /**
     * Delete exam schedule
     */
    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $schedule = ExamSchedule::findOrFail($id);
            return $schedule->delete();
        });
    }

    /**
     * Get schedules by date range
     */
    public function getByDateRange(int $schoolId, string $startDate, string $endDate): Collection
    {
        return ExamSchedule::where('school_id', $schoolId)
            ->whereBetween('exam_date', [$startDate, $endDate])
            ->with(['exam', 'schoolClass', 'subject'])
            ->orderBy('exam_date', 'asc')
            ->get();
    }

    /**
     * Get student's exam schedule
     */
    public function getStudentSchedule(int $examId, int $classId, int $schoolId): Collection
    {
        return ExamSchedule::where('exam_id', $examId)
            ->where('class_id', $classId)
            ->where('school_id', $schoolId)
            ->with(['subject'])
            ->orderBy('exam_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();
    }

    /**
     * Find schedule by exam, class, and subject
     */
    public function findByExamClassSubject(int $examId, int $classId, int $subjectId): ?ExamSchedule
    {
        return ExamSchedule::where('exam_id', $examId)
            ->where('class_id', $classId)
            ->where('subject_id', $subjectId)
            ->with(['schoolClass', 'subject'])
            ->first();
    }
}


