<?php

namespace App\Repositories;

use App\Models\HostelBuilding;
use App\Models\HostelRoom;
use App\Models\HostelAllocation;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * HostelRepository
 *
 * Handles database operations for Hostel models
 */
class HostelRepository
{
    // ==================== Hostel Buildings ====================

    /**
     * Get all hostel buildings for a school
     */
    public function getAllBuildings(int $schoolId): Collection
    {
        return HostelBuilding::where('school_id', $schoolId)
            ->with(['warden:id,full_name,email,phone'])
            ->withCount('rooms')
            ->orderBy('building_name', 'asc')
            ->get();
    }

    /**
     * Find building by ID
     */
    public function findBuildingById(int $id): ?HostelBuilding
    {
        return HostelBuilding::with(['rooms', 'warden:id,full_name,email,phone'])->find($id);
    }

    /**
     * Create hostel building
     */
    public function createBuilding(array $data): HostelBuilding
    {
        return DB::transaction(function () use ($data) {
            return HostelBuilding::create($data);
        });
    }

    /**
     * Update hostel building
     */
    public function updateBuilding(int $id, array $data): bool
    {
        return DB::transaction(function () use ($id, $data) {
            $building = HostelBuilding::findOrFail($id);
            return $building->update($data);
        });
    }

    /**
     * Delete hostel building
     */
    public function deleteBuilding(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $building = HostelBuilding::findOrFail($id);

            // Check if building has rooms
            if ($building->rooms()->count() > 0) {
                throw new \Exception('Cannot delete building with existing rooms');
            }

            return $building->delete();
        });
    }

    // ==================== Hostel Rooms ====================

    /**
     * Get all rooms for a building
     */
    public function getRoomsByBuilding(int $buildingId): Collection
    {
        return HostelRoom::where('hostel_building_id', $buildingId)
            ->withCount('activeAllocations')
            ->orderBy('room_number', 'asc')
            ->get();
    }

    /**
     * Get all rooms for a school
     */
    public function getAllRooms(int $schoolId): Collection
    {
        return HostelRoom::where('school_id', $schoolId)
            ->with(['hostelBuilding'])
            ->withCount('activeAllocations')
            ->orderBy('room_number', 'asc')
            ->get();
    }

    /**
     * Get available rooms
     */
    public function getAvailableRooms(int $schoolId): Collection
    {
        return HostelRoom::where('school_id', $schoolId)
            ->where('status', 'available')
            ->whereRaw('occupied_beds < capacity')
            ->with(['hostelBuilding'])
            ->get();
    }

    /**
     * Find room by ID
     */
    public function findRoomById(int $id): ?HostelRoom
    {
        return HostelRoom::with(['hostelBuilding', 'activeAllocations.studentDetails'])
            ->find($id);
    }

    /**
     * Create hostel room
     */
    public function createRoom(array $data): HostelRoom
    {
        return DB::transaction(function () use ($data) {
            return HostelRoom::create($data);
        });
    }

    /**
     * Update hostel room
     */
    public function updateRoom(int $id, array $data): bool
    {
        return DB::transaction(function () use ($id, $data) {
            $room = HostelRoom::findOrFail($id);
            return $room->update($data);
        });
    }

    /**
     * Delete hostel room
     */
    public function deleteRoom(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $room = HostelRoom::findOrFail($id);

            // Check if room has active allocations
            if ($room->activeAllocations()->count() > 0) {
                throw new \Exception('Cannot delete room with active allocations');
            }

            return $room->delete();
        });
    }

    // ==================== Hostel Allocations ====================

    /**
     * Get all allocations for a school
     */
    public function getAllAllocations(int $schoolId, bool $includeInactive = true): Collection
    {
        $query = HostelAllocation::where('school_id', $schoolId)
            ->with([
                'hostelRoom.hostelBuilding',
                'studentDetails',
            ]);
        
        if ($includeInactive === false) {
            $query->where('status', 'active');
        }
        
        return $query->orderBy('allocation_date', 'desc')->get();
    }

    /**
     * Get active allocations
     */
    public function getActiveAllocations(int $schoolId): Collection
    {
        return HostelAllocation::where('school_id', $schoolId)
            ->where('status', 'active')
            ->with(['hostelRoom.hostelBuilding', 'studentDetails'])
            ->get();
    }

    /**
     * Get student's allocation
     */
    public function getStudentAllocation(int $studentId): ?HostelAllocation
    {
        return HostelAllocation::where('student_id', $studentId)
            ->where('status', 'active')
            ->with(['hostelRoom.hostelBuilding'])
            ->first();
    }

    /**
     * Allocate room to student
     */
    public function allocateRoom(array $data): HostelAllocation
    {
        return DB::transaction(function () use ($data) {
            $room = HostelRoom::findOrFail($data['hostel_room_id']);

            // Check if room has available beds
            if (!$room->hasAvailableBeds()) {
                throw new \Exception('Room is full');
            }

            // Check if student already has active allocation
            $existingAllocation = $this->getStudentAllocation($data['student_id']);
            if ($existingAllocation) {
                throw new \Exception('Student already has an active hostel allocation');
            }

            // Create allocation
            $allocation = HostelAllocation::create($data);

            // Increment occupied beds
            $room->increment('occupied_beds');

            // Update room status if full
            if ($room->occupied_beds >= $room->capacity) {
                $room->update(['status' => 'full']);
            }

            return $allocation;
        });
    }

    /**
     * Vacate room
     */
    public function vacateRoom(int $allocationId, ?string $remarks = null): bool
    {
        return DB::transaction(function () use ($allocationId, $remarks) {
            $allocation = HostelAllocation::findOrFail($allocationId);

            if ($allocation->status !== 'active') {
                throw new \Exception('Allocation is not active');
            }

            // Update allocation
            $allocation->update([
                'status' => 'vacated',
                'vacate_date' => now(),
                'remarks' => $remarks,
            ]);

            // Decrement occupied beds
            $room = $allocation->hostelRoom;
            $room->decrement('occupied_beds');

            // Update room status if it was full
            if ($room->status === 'full' && $room->occupied_beds < $room->capacity) {
                $room->update(['status' => 'available']);
            }

            return true;
        });
    }

    /**
     * Transfer student to another room
     */
    public function transferRoom(int $allocationId, int $newRoomId, ?string $remarks = null): HostelAllocation
    {
        return DB::transaction(function () use ($allocationId, $newRoomId, $remarks) {
            // Vacate current room
            $this->vacateRoom($allocationId, $remarks);

            // Get allocation data
            $oldAllocation = HostelAllocation::findOrFail($allocationId);

            // Create new allocation
            return $this->allocateRoom([
                'hostel_room_id' => $newRoomId,
                'student_id' => $oldAllocation->student_id,
                'student_details_id' => $oldAllocation->student_details_id,
                'school_id' => $oldAllocation->school_id,
                'allocation_date' => now(),
                'monthly_fee' => $oldAllocation->monthly_fee,
                'status' => 'active',
                'remarks' => "Transferred from Room #{$oldAllocation->hostelRoom->room_number}",
            ]);
        });
    }
}


