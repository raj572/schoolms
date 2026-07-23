<?php

namespace App\Repositories;

use App\Models\School;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log as FacadesLog;
use Illuminate\Support\Collection;

class SchoolRepository
{

  /**
   * Create a new school
   */
  public function create(array $data): ?School
  {
    try {
      return School::create($data);
    } catch (QueryException $e) {
      FacadesLog::error('Error creating school entry: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Find school by ID
   */
  public function findById(int $id): ?School
  {
    try {
      return School::find($id);
    } catch (QueryException $e) {
      FacadesLog::error('Error finding school by ID: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Find school by school code
   */
  public function findBySchoolCode(string $schoolCode): ?School
  {
    try {
      return School::where('school_code', $schoolCode)->first();
    } catch (QueryException $e) {
      FacadesLog::error('Error finding school by code: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Update school
   */
  public function update(int $id, array $data): ?School
  {
    try {
      $school = School::find($id);
      if ($school) {
        $school->update($data);
        return $school->fresh();
      }
      return null;
    } catch (QueryException $e) {
      FacadesLog::error('Error updating school: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Delete school
   */
  public function delete(int $id): bool
  {
    try {
      $school = School::find($id);
      if ($school) {
        return $school->delete();
      }
      return false;
    } catch (QueryException $e) {
      FacadesLog::error('Error deleting school: ' . $e->getMessage());
      return false;
    }
  }

  /**
   * Get all schools with optional filters
   */
  public function getAll(array $filters = []): Collection
  {
    try {
      $query = School::query();

      // Filter by administrator_id (for administrator access control)
      if (isset($filters['administrator_id'])) {
        $query->where('administrator_id', $filters['administrator_id']);
      }

      if (isset($filters['status'])) {
        $query->where('status', $filters['status']);
      }

      if (isset($filters['board'])) {
        $query->where('board', $filters['board']);
      }

      if (isset($filters['city'])) {
        $query->where('city', $filters['city']);
      }

      if (isset($filters['state'])) {
        $query->where('state', $filters['state']);
      }

      return $query->get();
    } catch (QueryException $e) {
      FacadesLog::error('Error fetching schools: ' . $e->getMessage());
      return collect();
    }
  }

  /**
   * Get paginated schools
   */
  public function getPaginated(int $perPage = 15, array $filters = [])
  {
    try {
      $query = School::query();

      // Filter by administrator_id (for administrator access control)
      if (isset($filters['administrator_id'])) {
        $query->where('administrator_id', $filters['administrator_id']);
      }

      if (isset($filters['status'])) {
        $query->where('status', $filters['status']);
      }

      if (isset($filters['board'])) {
        $query->where('board', $filters['board']);
      }

      if (isset($filters['search'])) {
        $query->where(function($q) use ($filters) {
          $q->where('name', 'like', '%' . $filters['search'] . '%')
            ->orWhere('school_code', 'like', '%' . $filters['search'] . '%')
            ->orWhere('email', 'like', '%' . $filters['search'] . '%');
        });
      }

      return $query->paginate($perPage);
    } catch (QueryException $e) {
      FacadesLog::error('Error fetching paginated schools: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Update school logo
   */
  public function updateLogo(int $id, string $logoPath): ?School
  {
    try {
      $school = School::find($id);
      if ($school) {
        $school->update(['logo_path' => $logoPath]);
        return $school->fresh();
      }
      return null;
    } catch (QueryException $e) {
      FacadesLog::error('Error updating school logo: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Update principal signature
   */
  public function updatePrincipalSignature(int $id, string $signaturePath): ?School
  {
    try {
      $school = School::find($id);
      if ($school) {
        $school->update(['principal_sign_path' => $signaturePath]);
        return $school->fresh();
      }
      return null;
    } catch (QueryException $e) {
      FacadesLog::error('Error updating principal signature: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Get active schools
   */
  public function getActiveSchools(?int $administratorId = null): Collection
  {
    try {
      $query = School::where('status', 'active');

      // Filter by administrator_id if provided
      if ($administratorId) {
        $query->where('administrator_id', $administratorId);
      }

      return $query->get();
    } catch (QueryException $e) {
      FacadesLog::error('Error fetching active schools: ' . $e->getMessage());
      return collect();
    }
  }

  /**
   * Check if school code exists
   */
  public function schoolCodeExists(string $schoolCode, ?int $excludeId = null): bool
  {
    try {
      $query = School::where('school_code', $schoolCode);

      if ($excludeId) {
        $query->where('id', '!=', $excludeId);
      }

      return $query->exists();
    } catch (QueryException $e) {
      FacadesLog::error('Error checking school code existence: ' . $e->getMessage());
      return false;
    }
  }

}
