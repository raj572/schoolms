<?php

namespace App\Services;

use App\Repositories\TransportAssignmentRepository;
use App\Repositories\SchoolBusRepository;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TransportService
{
    protected TransportAssignmentRepository $assignmentRepository;
    protected SchoolBusRepository $busRepository;

    public function __construct(
        TransportAssignmentRepository $assignmentRepository,
        SchoolBusRepository $busRepository
    ) {
        $this->assignmentRepository = $assignmentRepository;
        $this->busRepository = $busRepository;
    }

    // ==================== Transport Statistics ====================

    /**
     * Get transport statistics for a school
     */
    public function getTransportStatistics(int $schoolId): array
    {
        try {
            $buses = $this->busRepository->getAllBySchool($schoolId);
            $assignments = $this->assignmentRepository->getActiveBySchool($schoolId);

            $totalBuses = $buses->count();
            $activeRoutes = $buses->pluck('route_name')->unique()->count();
            $studentsUsingTransport = $assignments->count();
            $totalCapacity = $buses->sum('capacity');
            $utilizedCapacity = $buses->sum(function ($bus) {
                return $this->assignmentRepository->countActiveStudentsByBus($bus->id);
            });

            return [
                'status' => true,
                'message' => 'Transport statistics fetched successfully',
                'data' => [
                    'totalBuses' => $totalBuses,
                    'activeRoutes' => $activeRoutes,
                    'studentsUsingTransport' => $studentsUsingTransport,
                    'totalCapacity' => $totalCapacity,
                    'utilizedCapacity' => $utilizedCapacity,
                ],
            ];
        } catch (Exception $e) {
            Log::error("Error fetching transport statistics: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch transport statistics',
                'error' => $e->getMessage(),
            ];
        }
    }

    // ==================== Bus Management ====================

    /**
     * Get all buses for a school with student counts
     */
    public function getAllBuses(int $schoolId): array
    {
        try {
            $buses = $this->busRepository->getWithStudentCount($schoolId);

            return [
                'status' => true,
                'message' => 'Buses fetched successfully',
                'data' => $buses->toArray(),
            ];
        } catch (Exception $e) {
            Log::error("Error fetching buses: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch buses',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get a single bus with details
     */
    public function getBus(int $busId): array
    {
        try {
            $bus = $this->busRepository->findById($busId);

            if (!$bus) {
                return [
                    'status' => false,
                    'message' => 'Bus not found',
                ];
            }

            $students = $this->assignmentRepository->getActiveByBus($busId);

            return [
                'status' => true,
                'message' => 'Bus details fetched successfully',
                'data' => [
                    'bus' => $bus,
                    'students' => $students,
                    'available_capacity' => $bus->getAvailableCapacity(),
                ],
            ];
        } catch (Exception $e) {
            Log::error("Error fetching bus: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch bus details',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create a new bus
     */
    public function createBus(array $data): array
    {
        try {
            $bus = $this->busRepository->create($data);

            return [
                'status' => true,
                'message' => 'Bus created successfully',
                'data' => $bus,
            ];
        } catch (Exception $e) {
            Log::error("Error creating bus: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to create bus',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update a bus
     */
    public function updateBus(int $busId, array $data): array
    {
        try {
            $updated = $this->busRepository->update($busId, $data);

            if (!$updated) {
                return [
                    'status' => false,
                    'message' => 'Failed to update bus',
                ];
            }

            return [
                'status' => true,
                'message' => 'Bus updated successfully',
                'data' => $updated,
            ];
        } catch (Exception $e) {
            Log::error("Error updating bus: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update bus',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a bus
     */
    public function deleteBus(int $busId): array
    {
        try {
            $deleted = $this->busRepository->delete($busId);

            if (!$deleted) {
                return [
                    'status' => false,
                    'message' => 'Failed to delete bus',
                ];
            }

            return [
                'status' => true,
                'message' => 'Bus deleted successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error deleting bus: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to delete bus',
                'error' => $e->getMessage(),
            ];
        }
    }

    // ==================== Transport Assignment ====================

    /**
     * Get all transport assignments
     */
    public function getAllAssignments(int $schoolId): array
    {
        try {
            $assignments = $this->assignmentRepository->getActiveBySchool($schoolId);

            return [
                'status' => true,
                'message' => 'Transport assignments fetched successfully',
                'data' => $assignments->toArray(),
            ];
        } catch (Exception $e) {
            Log::error("Error fetching assignments: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch assignments',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get students on a bus
     */
    public function getStudentsOnBus(int $busId): array
    {
        try {
            $students = $this->assignmentRepository->getActiveByBus($busId);

            return [
                'status' => true,
                'message' => 'Students fetched successfully',
                'data' => $students->toArray(),
            ];
        } catch (Exception $e) {
            Log::error("Error fetching students on bus: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch students',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Assign student to transport
     */
    public function assignStudentToTransport(array $data): array
    {
        try {
            DB::beginTransaction();

            // Check if student already has active assignment
            if ($this->assignmentRepository->hasActiveAssignment($data['student_details_id'])) {
                DB::rollBack();
                return [
                    'status' => false,
                    'message' => 'Student already has an active transport assignment',
                ];
            }

            // Check bus capacity
            $bus = $this->busRepository->findById($data['bus_id']);
            if (!$bus) {
                DB::rollBack();
                return [
                    'status' => false,
                    'message' => 'Bus not found',
                ];
            }

            $currentCount = $this->assignmentRepository->countActiveStudentsByBus($data['bus_id']);
            if ($currentCount >= $bus->capacity) {
                DB::rollBack();
                return [
                    'status' => false,
                    'message' => 'Bus has reached maximum capacity',
                ];
            }

            $assignment = $this->assignmentRepository->create($data);

            DB::commit();

            return [
                'status' => true,
                'message' => 'Student assigned to transport successfully',
                'data' => $assignment,
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Error assigning student to transport: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to assign student to transport',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update transport assignment
     */
    public function updateAssignment(int $assignmentId, array $data): array
    {
        try {
            $updated = $this->assignmentRepository->update($assignmentId, $data);

            if (!$updated) {
                return [
                    'status' => false,
                    'message' => 'Failed to update assignment',
                ];
            }

            return [
                'status' => true,
                'message' => 'Assignment updated successfully',
                'data' => $updated,
            ];
        } catch (Exception $e) {
            Log::error("Error updating assignment: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update assignment',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Remove transport assignment
     */
    public function removeAssignment(int $assignmentId): array
    {
        try {
            $deleted = $this->assignmentRepository->delete($assignmentId);

            if (!$deleted) {
                return [
                    'status' => false,
                    'message' => 'Failed to remove assignment',
                ];
            }

            return [
                'status' => true,
                'message' => 'Assignment removed successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error removing assignment: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to remove assignment',
                'error' => $e->getMessage(),
            ];
        }
    }
}

