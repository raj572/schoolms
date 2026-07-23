<?php

namespace App\Repositories;

use App\Models\SchoolSubject;
use Illuminate\Database\Eloquent\Collection;

class SchoolSubjectRepository
{
  /**
   * Get all subjects for a specific school.
   */
  public function getAllBySchoolId(int $school_id): Collection
  {
    return SchoolSubject::where('school_id', $school_id)
      ->orderBy('subject_name', 'asc')
      ->get();
  }

  /**
   * Find a subject by its ID.
   */
  public function findById(int $id): ?SchoolSubject
  {
    return SchoolSubject::find($id);
  }

  /**
   * Create a new subject.
   */
  public function create(array $data): SchoolSubject
  {
    return SchoolSubject::create($data);
  }

  /**
   * Update an existing subject.
   */
  public function update(int $id, array $data): ?SchoolSubject
  {
    $subject = SchoolSubject::find($id);
    if ($subject) {
      $subject->update($data);
    }
    return $subject;
  }

  /**
   * Delete a subject by its ID.
   */
  public function delete(int $id): bool
  {
    $subject = SchoolSubject::find($id);
    if ($subject) {
      return (bool) $subject->delete();
    }
    return false;
  }

  /**
   * Check if a subject already exists for the same school.
   */
  public function existsByName(int $school_id, string $subject_name): bool
  {
    return SchoolSubject::where('school_id', $school_id)
      ->where('subject_name', $subject_name)
      ->exists();
  }
}
