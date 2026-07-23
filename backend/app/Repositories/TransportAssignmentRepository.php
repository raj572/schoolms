<?php

namespace App\Repositories;

use App\Models\TransportAssignment;
use Illuminate\Database\Eloquent\Collection;

class TransportAssignmentRepository
{
    /**
     * Get all transport assignments for a school
     */
    public function getAllBySchool(int $schoolId): Collection
    {
        return TransportAssignment::where('school_id', $schoolId)
            ->with(['bus', 'studentDetails'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get active transport assignments for a school
     */
    public function getActiveBySchool(int $schoolId): Collection
    {
        return TransportAssignment::where('school_id', $schoolId)
            ->where('status', 'active')
            ->with(['bus', 'studentDetails'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get transport assignment by ID
     */
    public function findById(int $id): ?TransportAssignment
    {
        return TransportAssignment::with(['bus', 'studentDetails', 'school'])
            ->find($id);
    }

    /**
     * Get transport assignment by student
     */
    public function getByStudent(int $studentId): ?TransportAssignment
    {
        return TransportAssignment::where('student_details_id', $studentId)
            ->where('status', 'active')
            ->with(['bus', 'school'])
            ->first();
    }

    /**
     * Get all transport assignments for a bus
     */
    public function getByBus(int $busId): Collection
    {
        return TransportAssignment::where('bus_id', $busId)
            ->with(['studentDetails', 'school'])
            ->orderBy('pickup_time', 'asc')
            ->get();
    }

    /**
     * Get active transport assignments for a bus
     */
    public function getActiveByBus(int $busId): Collection
    {
        return TransportAssignment::where('bus_id', $busId)
            ->where('status', 'active')
            ->with(['studentDetails'])
            ->orderBy('pickup_time', 'asc')
            ->get();
    }

    /**
     * Count active students on a bus
     */
    public function countActiveStudentsByBus(int $busId): int
    {
        return TransportAssignment::where('bus_id', $busId)
            ->where('status', 'active')
            ->count();
    }

    /**
     * Create a new transport assignment
     */
    public function create(array $data): TransportAssignment
    {
        return TransportAssignment::create($data);
    }

    /**
     * Update a transport assignment
     */
    public function update(int $id, array $data): bool
    {
        $assignment = TransportAssignment::find($id);
        if ($assignment) {
            return $assignment->update($data);
        }
        return false;
    }

    /**
     * Delete/deactivate a transport assignment
     */
    public function delete(int $id): bool
    {
        $assignment = TransportAssignment::find($id);
        if ($assignment) {
            return $assignment->delete();
        }
        return false;
    }

    /**
     * Check if student already has active transport assignment
     */
    public function hasActiveAssignment(int $studentId): bool
    {
        return TransportAssignment::where('student_details_id', $studentId)
            ->where('status', 'active')
            ->exists();
    }
}

