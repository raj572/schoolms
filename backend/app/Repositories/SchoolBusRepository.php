<?php

namespace App\Repositories;

use App\Models\SchoolBus;
use Illuminate\Database\Eloquent\Collection;

class SchoolBusRepository
{
  /**
   * Get all buses for a specific school.
   *
   * @param int $schoolId
   * @return Collection
   */
  public function getAllBySchool(int $schoolId): Collection
  {
    return SchoolBus::where('school_id', $schoolId)->get();
  }

  /**
   * Find a bus by its ID.
   *
   * @param int $id
   * @return SchoolBus|null
   */
  public function findById(int $id): ?SchoolBus
  {
    return SchoolBus::find($id);
  }

  /**
   * Create a new school bus record.
   *
   * @param array $data
   * @return SchoolBus
   */
  public function create(array $data): SchoolBus
  {
    return SchoolBus::create($data);
  }

  /**
   * Update an existing school bus record.
   *
   * @param int $id
   * @param array $data
   * @return SchoolBus|null
   */
  public function update(int $id, array $data): ?SchoolBus
  {
    $bus = $this->findById($id);
    if ($bus) {
      $bus->update($data);
    }
    return $bus;
  }

  /**
   * Delete a school bus record by its ID.
   *
   * @param int $id
   * @return bool
   */
  public function delete(int $id): bool
  {
    $bus = $this->findById($id);
    if ($bus) {
      return $bus->delete();
    }
    return false;
  }

  /**
   * Get all buses with student count for a school.
   *
   * @param int $schoolId
   * @return Collection
   */
  public function getWithStudentCount(int $schoolId): Collection
  {
    return SchoolBus::where('school_id', $schoolId)
      ->withCount(['activeTransportAssignments as student_count'])
      ->get();
  }

  /**
   * Get buses with available capacity.
   *
   * @param int $schoolId
   * @return Collection
   */
  public function getAvailableBuses(int $schoolId): Collection
  {
    return SchoolBus::where('school_id', $schoolId)
      ->where('status', 'active')
      ->withCount(['activeTransportAssignments as student_count'])
      ->get()
      ->filter(function ($bus) {
        return $bus->student_count < $bus->capacity;
      });
  }
}
