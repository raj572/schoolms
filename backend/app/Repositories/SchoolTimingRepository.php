<?php

namespace App\Repositories;

use App\Models\SchoolTiming;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

class SchoolTimingRepository
{
    /**
     * Create a new timing
     */
    public function create(array $data): ?SchoolTiming
    {
        try {
            return SchoolTiming::create($data);
        } catch (QueryException $e) {
            Log::error('Error creating school timing: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Find timing by ID
     */
    public function findById(int $id): ?SchoolTiming
    {
        try {
            return SchoolTiming::find($id);
        } catch (QueryException $e) {
            Log::error('Error finding timing by ID: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Update timing
     */
    public function update(int $id, array $data): ?SchoolTiming
    {
        try {
            $timing = SchoolTiming::find($id);
            if ($timing) {
                $timing->update($data);
                return $timing->fresh();
            }
            return null;
        } catch (QueryException $e) {
            Log::error('Error updating timing: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete timing
     */
    public function delete(int $id): bool
    {
        try {
            $timing = SchoolTiming::find($id);
            if ($timing) {
                return $timing->delete();
            }
            return false;
        } catch (QueryException $e) {
            Log::error('Error deleting timing: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all timings for a school
     */
    public function getBySchoolId(int $schoolId): Collection
    {
        try {
            return SchoolTiming::where('school_id', $schoolId)
                ->orderBy('order')
                ->get();
        } catch (QueryException $e) {
            Log::error('Error fetching timings: ' . $e->getMessage());
            return collect();
        }
    }

    /**
     * Delete all timings for a school
     */
    public function deleteBySchoolId(int $schoolId): bool
    {
        try {
            return SchoolTiming::where('school_id', $schoolId)->delete();
        } catch (QueryException $e) {
            Log::error('Error deleting timings for school: ' . $e->getMessage());
            return false;
        }
    }
}

