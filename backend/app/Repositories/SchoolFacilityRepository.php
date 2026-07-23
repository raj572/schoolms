<?php

namespace App\Repositories;

use App\Models\SchoolFacility;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

class SchoolFacilityRepository
{
    /**
     * Create a new facility
     */
    public function create(array $data): ?SchoolFacility
    {
        try {
            return SchoolFacility::create($data);
        } catch (QueryException $e) {
            Log::error('Error creating school facility: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Find facility by ID
     */
    public function findById(int $id): ?SchoolFacility
    {
        try {
            return SchoolFacility::find($id);
        } catch (QueryException $e) {
            Log::error('Error finding facility by ID: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Update facility
     */
    public function update(int $id, array $data): ?SchoolFacility
    {
        try {
            $facility = SchoolFacility::find($id);
            if ($facility) {
                $facility->update($data);
                return $facility->fresh();
            }
            return null;
        } catch (QueryException $e) {
            Log::error('Error updating facility: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete facility
     */
    public function delete(int $id): bool
    {
        try {
            $facility = SchoolFacility::find($id);
            if ($facility) {
                return $facility->delete();
            }
            return false;
        } catch (QueryException $e) {
            Log::error('Error deleting facility: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all facilities for a school
     */
    public function getBySchoolId(int $schoolId): Collection
    {
        try {
            return SchoolFacility::where('school_id', $schoolId)->get();
        } catch (QueryException $e) {
            Log::error('Error fetching facilities: ' . $e->getMessage());
            return collect();
        }
    }

    /**
     * Get facilities by school ID and status
     */
    public function getBySchoolIdAndStatus(int $schoolId, string $status): Collection
    {
        try {
            return SchoolFacility::where('school_id', $schoolId)
                ->where('status', $status)
                ->get();
        } catch (QueryException $e) {
            Log::error('Error fetching facilities by status: ' . $e->getMessage());
            return collect();
        }
    }
}

