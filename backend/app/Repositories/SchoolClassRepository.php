<?php

namespace App\Repositories;

use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Collection;

class SchoolClassRepository
{
  /**
   * Get all classes
   */
  public function all(): Collection
  {
    return SchoolClass::all();
  }

  /**
   * Find a class by ID
   */
  public function find(int $id): ?SchoolClass
  {
    return SchoolClass::find($id);
  }

  /**
   * Create a new class
   */
  public function create(array $data): SchoolClass
  {
    return SchoolClass::create($data);
  }

  /**
   * Update an existing class
   */
  public function update(int $id, array $data): ?SchoolClass
  {
    $class = SchoolClass::find($id);
    if ($class) {
      $class->update($data);
    }
    return $class;
  }

  /**
   * Delete a class
   */
  public function delete(int $id): bool
  {
    $class = SchoolClass::find($id);
    if ($class) {
      return (bool) $class->delete();
    }
    return false;
  }
}
