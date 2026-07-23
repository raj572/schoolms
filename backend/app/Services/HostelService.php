<?php

namespace App\Services;

use App\Repositories\HostelRepository;
use Exception;
use Illuminate\Support\Facades\Log;

/**
 * HostelService
 *
 * Handles business logic for hostel management
 */
class HostelService
{
    protected HostelRepository $hostelRepository;

    public function __construct(HostelRepository $hostelRepository)
    {
        $this->hostelRepository = $hostelRepository;
    }

    // ==================== Statistics ====================

    /**
     * Get hostel statistics for a school
     */
    public function getStatistics(int $schoolId): array
    {
        try {
            $allRooms = $this->hostelRepository->getAllRooms($schoolId);
            $totalRooms = $allRooms->count();
            
            // Count occupied rooms (rooms with active allocations)
            $occupiedRooms = 0;
            $totalStudents = 0;
            $totalRevenue = 0;
            
            foreach ($allRooms as $room) {
                $activeCount = $room->active_allocations_count ?? 0;
                if ($activeCount > 0) {
                    $occupiedRooms++;
                }
            }
            
            // Get active allocations for revenue calculation
            $activeAllocations = $this->hostelRepository->getActiveAllocations($schoolId);
            foreach ($activeAllocations as $allocation) {
                $totalStudents++;
                $totalRevenue += $allocation->monthly_fee ?? 0;
            }
            
            $vacantRooms = $totalRooms - $occupiedRooms;
            $occupancyRate = $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100, 1) : 0;
            
            return [
                'status' => true,
                'message' => 'Statistics fetched successfully',
                'data' => [
                    'totalRooms' => $totalRooms,
                    'occupiedRooms' => $occupiedRooms,
                    'vacantRooms' => $vacantRooms,
                    'occupancyRate' => $occupancyRate,
                    'totalStudents' => $totalStudents,
                    'totalRevenue' => $totalRevenue,
                ],
            ];
        } catch (Exception $e) {
            Log::error("Error fetching hostel statistics: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch hostel statistics',
                'error' => $e->getMessage(),
            ];
        }
    }

    // ==================== Building Management ====================

    /**
     * Get all buildings
     */
    public function getAllBuildings(int $schoolId): array
    {
        try {
            $buildings = $this->hostelRepository->getAllBuildings($schoolId);

            return [
                'status' => true,
                'message' => 'Hostel buildings fetched successfully',
                'data' => $buildings,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching buildings: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch hostel buildings',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get building by ID
     */
    public function getBuildingById(int $id): array
    {
        try {
            $building = $this->hostelRepository->findBuildingById($id);

            if (!$building) {
                return [
                    'status' => false,
                    'message' => 'Hostel building not found',
                ];
            }

            return [
                'status' => true,
                'message' => 'Hostel building fetched successfully',
                'data' => $building,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching building: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch hostel building',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create building
     */
    public function createBuilding(array $data): array
    {
        try {
            $building = $this->hostelRepository->createBuilding($data);

            return [
                'status' => true,
                'message' => 'Hostel building created successfully',
                'data' => $building,
            ];
        } catch (Exception $e) {
            Log::error("Error creating building: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to create hostel building',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update building
     */
    public function updateBuilding(int $id, array $data): array
    {
        try {
            $updated = $this->hostelRepository->updateBuilding($id, $data);

            if (!$updated) {
                return [
                    'status' => false,
                    'message' => 'Failed to update hostel building',
                ];
            }

            return [
                'status' => true,
                'message' => 'Hostel building updated successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error updating building: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update hostel building',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete building
     */
    public function deleteBuilding(int $id): array
    {
        try {
            $deleted = $this->hostelRepository->deleteBuilding($id);

            if (!$deleted) {
                return [
                    'status' => false,
                    'message' => 'Failed to delete hostel building',
                ];
            }

            return [
                'status' => true,
                'message' => 'Hostel building deleted successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error deleting building: " . $e->getMessage());
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // ==================== Room Management ====================

    /**
     * Get all rooms
     */
    public function getAllRooms(int $schoolId, ?int $buildingId = null): array
    {
        try {
            if ($buildingId) {
                $rooms = $this->hostelRepository->getRoomsByBuilding($buildingId);
            } else {
                $rooms = $this->hostelRepository->getAllRooms($schoolId);
            }

            return [
                'status' => true,
                'message' => 'Rooms fetched successfully',
                'data' => $rooms,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching rooms: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch rooms',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get available rooms
     */
    public function getAvailableRooms(int $schoolId): array
    {
        try {
            $rooms = $this->hostelRepository->getAvailableRooms($schoolId);

            return [
                'status' => true,
                'message' => 'Available rooms fetched successfully',
                'data' => $rooms,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching available rooms: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch available rooms',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get room by ID
     */
    public function getRoomById(int $id): array
    {
        try {
            $room = $this->hostelRepository->findRoomById($id);

            if (!$room) {
                return [
                    'status' => false,
                    'message' => 'Room not found',
                ];
            }

            return [
                'status' => true,
                'message' => 'Room fetched successfully',
                'data' => $room,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching room: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch room',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create room
     */
    public function createRoom(array $data): array
    {
        try {
            $room = $this->hostelRepository->createRoom($data);

            return [
                'status' => true,
                'message' => 'Room created successfully',
                'data' => $room,
            ];
        } catch (Exception $e) {
            Log::error("Error creating room: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to create room',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update room
     */
    public function updateRoom(int $id, array $data): array
    {
        try {
            $updated = $this->hostelRepository->updateRoom($id, $data);

            if (!$updated) {
                return [
                    'status' => false,
                    'message' => 'Failed to update room',
                ];
            }

            return [
                'status' => true,
                'message' => 'Room updated successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error updating room: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update room',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete room
     */
    public function deleteRoom(int $id): array
    {
        try {
            $deleted = $this->hostelRepository->deleteRoom($id);

            if (!$deleted) {
                return [
                    'status' => false,
                    'message' => 'Failed to delete room',
                ];
            }

            return [
                'status' => true,
                'message' => 'Room deleted successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error deleting room: " . $e->getMessage());
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // ==================== Allocation Management ====================

    /**
     * Get all allocations
     */
    public function getAllAllocations(int $schoolId, bool $activeOnly = false): array
    {
        try {
            if ($activeOnly) {
                $allocations = $this->hostelRepository->getActiveAllocations($schoolId);
            } else {
                $allocations = $this->hostelRepository->getAllAllocations($schoolId);
            }

            // Format the response to ensure all relationships are properly included
            $formattedAllocations = $allocations->map(function ($allocation) {
                return [
                    'id' => $allocation->id,
                    'hostel_room_id' => $allocation->hostel_room_id,
                    'student_id' => $allocation->student_id,
                    'student_details_id' => $allocation->student_details_id,
                    'school_id' => $allocation->school_id,
                    'allocation_date' => $allocation->allocation_date,
                    'vacate_date' => $allocation->vacate_date,
                    'monthly_fee' => $allocation->monthly_fee,
                    'status' => $allocation->status,
                    'remarks' => $allocation->remarks,
                    'hostel_room' => $allocation->hostelRoom ? [
                        'id' => $allocation->hostelRoom->id,
                        'hostel_building_id' => $allocation->hostelRoom->hostel_building_id,
                        'school_id' => $allocation->hostelRoom->school_id,
                        'room_number' => $allocation->hostelRoom->room_number,
                        'floor' => $allocation->hostelRoom->floor,
                        'block_wing' => $allocation->hostelRoom->block_wing,
                        'room_type' => $allocation->hostelRoom->room_type,
                        'capacity' => $allocation->hostelRoom->capacity,
                        'occupied_beds' => $allocation->hostelRoom->occupied_beds,
                        'monthly_fee' => $allocation->hostelRoom->monthly_fee,
                        'facilities' => $allocation->hostelRoom->facilities,
                        'status' => $allocation->hostelRoom->status,
                        'hostel_building' => $allocation->hostelRoom->hostelBuilding ? [
                            'id' => $allocation->hostelRoom->hostelBuilding->id,
                            'building_name' => $allocation->hostelRoom->hostelBuilding->building_name,
                            'building_type' => $allocation->hostelRoom->hostelBuilding->building_type,
                            'warden_name' => $allocation->hostelRoom->hostelBuilding->warden_name,
                            'warden_contact' => $allocation->hostelRoom->hostelBuilding->warden_contact,
                            'address' => $allocation->hostelRoom->hostelBuilding->address,
                            'total_rooms' => $allocation->hostelRoom->hostelBuilding->total_rooms,
                            'status' => $allocation->hostelRoom->hostelBuilding->status,
                        ] : null,
                    ] : null,
                    'student_details' => $allocation->studentDetails ? [
                        'id' => $allocation->studentDetails->id,
                        'candidate_name' => $allocation->studentDetails->candidate_name,
                        'class' => $allocation->studentDetails->class,
                        'section' => $allocation->studentDetails->secction,
                        'father_name' => $allocation->studentDetails->father_name,
                        'mother_name' => $allocation->studentDetails->mother_name,
                        'phone' => $allocation->studentDetails->phone,
                        'email' => $allocation->studentDetails->email,
                    ] : null,
                ];
            });

            return [
                'status' => true,
                'message' => 'Allocations fetched successfully',
                'data' => $formattedAllocations,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching allocations: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch allocations',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get student allocation
     */
    public function getStudentAllocation(int $studentId): array
    {
        try {
            $allocation = $this->hostelRepository->getStudentAllocation($studentId);

            if (!$allocation) {
                return [
                    'status' => false,
                    'message' => 'No active hostel allocation found for this student',
                ];
            }

            return [
                'status' => true,
                'message' => 'Allocation fetched successfully',
                'data' => $allocation,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching student allocation: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch allocation',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Allocate room to student
     */
    public function allocateRoom(array $data): array
    {
        try {
            $allocation = $this->hostelRepository->allocateRoom($data);

            return [
                'status' => true,
                'message' => 'Room allocated successfully',
                'data' => $allocation,
            ];
        } catch (Exception $e) {
            Log::error("Error allocating room: " . $e->getMessage());
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Vacate room
     */
    public function vacateRoom(int $allocationId, ?string $remarks = null): array
    {
        try {
            $vacated = $this->hostelRepository->vacateRoom($allocationId, $remarks);

            if (!$vacated) {
                return [
                    'status' => false,
                    'message' => 'Failed to vacate room',
                ];
            }

            return [
                'status' => true,
                'message' => 'Room vacated successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error vacating room: " . $e->getMessage());
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Transfer student to another room
     */
    public function transferRoom(int $allocationId, int $newRoomId, ?string $remarks = null): array
    {
        try {
            $allocation = $this->hostelRepository->transferRoom($allocationId, $newRoomId, $remarks);

            return [
                'status' => true,
                'message' => 'Student transferred successfully',
                'data' => $allocation,
            ];
        } catch (Exception $e) {
            Log::error("Error transferring room: " . $e->getMessage());
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Sync hostel fees to monthly payments for students with active allocations
     */
    public function syncHostelFeesToMonthlyPayments(int $schoolId): array
    {
        try {
            $activeAllocations = $this->hostelRepository->getActiveAllocations($schoolId);
            $syncedCount = 0;
            
            foreach ($activeAllocations as $allocation) {
                // Get current month
                $currentMonth = now()->format('Y-m');
                
                // Check if monthly payment exists
                $monthlyPayment = \App\Models\MonthlyPayment::where('student_details_id', $allocation->student_details_id)
                    ->where('month', $currentMonth)
                    ->first();
                
                if ($monthlyPayment) {
                    // Check if hostel fee line item already exists
                    $existingHostelFee = $monthlyPayment->items()
                        ->where('label', 'Hostel Fee')
                        ->first();
                    
                    if (!$existingHostelFee) {
                        // Add hostel fee as a line item
                        $monthlyPayment->items()->create([
                            'service_id' => null,
                            'label' => 'Hostel Fee',
                            'amount' => $allocation->monthly_fee,
                        ]);
                        
                        // Update total amount
                        $monthlyPayment->increment('total_amount', $allocation->monthly_fee);
                        $syncedCount++;
                    }
                }
            }
            
            return [
                'status' => true,
                'message' => "Hostel fees synced successfully. {$syncedCount} payments updated.",
                'data' => ['synced_count' => $syncedCount],
            ];
        } catch (Exception $e) {
            Log::error("Error syncing hostel fees: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to sync hostel fees',
                'error' => $e->getMessage(),
            ];
        }
    }
}


