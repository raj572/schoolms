<?php

namespace App\Repositories;

use App\Models\Exam;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Exception;

/**
 * ExamRepository
 *
 * Handles database operations for Exam model
 */
class ExamRepository
{
    /**
     * Get all exams for a school
     */
    public function getAllBySchool(int $schoolId): Collection
    {
        return Exam::where('school_id', $schoolId)
            ->with(['schedules.subject', 'schedules.schoolClass'])
            ->orderBy('start_date', 'desc')
            ->get();
    }

    /**
     * Find exam by ID
     */
    public function findById(int $id): ?Exam
    {
        return Exam::with(['schedules.subject', 'schedules.schoolClass', 'schedules.marks'])
            ->find($id);
    }

    /**
     * Create a new exam
     */
    public function create(array $data): Exam
    {
        return DB::transaction(function () use ($data) {
            return Exam::create($data);
        });
    }

    /**
     * Update an exam
     */
    public function update(int $id, array $data): bool
    {
        return DB::transaction(function () use ($id, $data) {
            $exam = Exam::findOrFail($id);
            return $exam->update($data);
        });
    }

    /**
     * Delete an exam
     */
    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $exam = Exam::findOrFail($id);
            return $exam->delete();
        });
    }

    /**
     * Get upcoming exams for a school
     */
    public function getUpcoming(int $schoolId, int $limit = 5): Collection
    {
        return Exam::where('school_id', $schoolId)
            ->where('start_date', '>=', now())
            ->where('status', 'scheduled')
            ->orderBy('start_date', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get active/ongoing exams
     */
    public function getActive(int $schoolId): Collection
    {
        return Exam::where('school_id', $schoolId)
            ->where('status', 'ongoing')
            ->with(['schedules'])
            ->get();
    }
}


