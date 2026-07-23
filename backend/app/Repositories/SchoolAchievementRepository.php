<?php

namespace App\Repositories;

use App\Models\SchoolAchievement;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

class SchoolAchievementRepository
{
    /**
     * Create a new achievement
     */
    public function create(array $data): ?SchoolAchievement
    {
        try {
            return SchoolAchievement::create($data);
        } catch (QueryException $e) {
            Log::error('Error creating school achievement: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Find achievement by ID
     */
    public function findById(int $id): ?SchoolAchievement
    {
        try {
            return SchoolAchievement::find($id);
        } catch (QueryException $e) {
            Log::error('Error finding achievement by ID: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Update achievement
     */
    public function update(int $id, array $data): ?SchoolAchievement
    {
        try {
            $achievement = SchoolAchievement::find($id);
            if ($achievement) {
                $achievement->update($data);
                return $achievement->fresh();
            }
            return null;
        } catch (QueryException $e) {
            Log::error('Error updating achievement: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete achievement
     */
    public function delete(int $id): bool
    {
        try {
            $achievement = SchoolAchievement::find($id);
            if ($achievement) {
                return $achievement->delete();
            }
            return false;
        } catch (QueryException $e) {
            Log::error('Error deleting achievement: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all achievements for a school
     */
    public function getBySchoolId(int $schoolId): Collection
    {
        try {
            return SchoolAchievement::where('school_id', $schoolId)
                ->orderBy('year', 'desc')
                ->get();
        } catch (QueryException $e) {
            Log::error('Error fetching achievements: ' . $e->getMessage());
            return collect();
        }
    }

    /**
     * Get achievements by school ID and year
     */
    public function getBySchoolIdAndYear(int $schoolId, string $year): Collection
    {
        try {
            return SchoolAchievement::where('school_id', $schoolId)
                ->where('year', $year)
                ->get();
        } catch (QueryException $e) {
            Log::error('Error fetching achievements by year: ' . $e->getMessage());
            return collect();
        }
    }

    /**
     * Get achievements by school ID and category
     */
    public function getBySchoolIdAndCategory(int $schoolId, string $category): Collection
    {
        try {
            return SchoolAchievement::where('school_id', $schoolId)
                ->where('category', $category)
                ->orderBy('year', 'desc')
                ->get();
        } catch (QueryException $e) {
            Log::error('Error fetching achievements by category: ' . $e->getMessage());
            return collect();
        }
    }
}

