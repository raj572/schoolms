<?php

namespace App\Services;

use App\Models\User;
use App\Models\School;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class PrincipalService
{
    protected $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

    /**
     * Generate a strong random password
     */
    private function generatePassword(int $length = 12): string
    {
        return Str::password($length, true, true, true, false);
    }

    /**
     * Get all principals (filtered by administrator if provided)
     */
    public function getAllPrincipals(?int $administratorId = null)
    {
        $query = User::where('role', 'principal')
            ->with(['school:id,name,school_code,email,phone,status,administrator_id']);

        // Filter by administrator_id - show only principals created by this administrator
        if ($administratorId) {
            $query->where('administrator_id', $administratorId);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get paginated principals with search and filters
     */
    public function getPaginatedPrincipals($perPage = 10, $page = 1, $search = '', $status = null, ?int $administratorId = null)
    {
        $query = User::where('role', 'principal')
            ->with(['school:id,name,school_code,email,phone,status,administrator_id']);

        // Filter by administrator_id - show only principals created by this administrator
        if ($administratorId) {
            $query->where('administrator_id', $administratorId);
        }

        // Search filter
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($status !== null) {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get principal by ID (with administrator check)
     */
    public function getPrincipalById($id, ?int $administratorId = null)
    {
        $query = User::where('role', 'principal')
            ->with(['school:id,name,school_code,email,phone,status,address,city,state,administrator_id']);

        // Filter by administrator_id - only show principals created by this administrator
        if ($administratorId) {
            $query->where('administrator_id', $administratorId);
        }

        return $query->find($id);
    }

    /**
     * Get unassigned principals (not assigned to any school)
     * Note: For administrators, this doesn't filter since unassigned principals can be assigned later
     */
    public function getUnassignedPrincipals(?int $administratorId = null)
    {
        return User::where('role', 'principal')
            ->where(function ($q) {
                $q->whereNull('school_id')->orWhere('school_id', 0);
            })
            ->orderBy('full_name', 'asc')
            ->get();
    }

    /**
     * Create a new principal
     */
    public function createPrincipal(array $data, ?int $administratorId = null)
    {
        DB::beginTransaction();
        try {
            // Generate password
            $plainPassword = $this->generatePassword();

            // Determine assignment_status based on school_id
            $assignmentStatus = !empty($data['school_id']) ? 'assigned' : 'unassigned';

            // Create principal user (email verification disabled - auto-verified)
            $principal = User::create([
                'full_name' => $data['full_name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'username' => $data['username'],
                'password' => Hash::make($plainPassword),
                'role' => 'principal',
                'status' => $data['status'] ?? 'active',
                'assignment_status' => $assignmentStatus,
                'school_id' => $data['school_id'] ?? null,
                'administrator_id' => $administratorId, // Link to administrator
                'registration_status' => 'active',
                'email_verified' => true, // Auto-verified - no email verification required
                'email_verified_at' => now(),
            ]);

            // If school is assigned, update school's principal info and set assignment_status
            if (!empty($data['school_id'])) {
                $this->updateSchoolPrincipalInfo($data['school_id'], $principal);
            }

            // Send credentials email
            $this->sendPrincipalCredentialsEmail($principal, $plainPassword);

            DB::commit();

            // Don't return plain password in response
            return $principal->fresh(['school']);
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Failed to create principal: ' . $e->getMessage());
        }
    }

    /**
     * Update principal
     */
    public function updatePrincipal($id, array $data)
    {
        DB::beginTransaction();
        try {
            $principal = User::where('role', 'principal')->find($id);

            if (!$principal) {
                return null;
            }

            // Track if school assignment changed
            $oldSchoolId = $principal->school_id;
            $newSchoolId = $data['school_id'] ?? null;

            // Update assignment_status based on school_id
            if (isset($data['school_id'])) {
                $data['assignment_status'] = $data['school_id'] ? 'assigned' : 'unassigned';
            }

            // Update principal
            $principal->update($data);

            // Handle school assignment changes
            if ($oldSchoolId != $newSchoolId) {
                // Clear old school's principal info
                if ($oldSchoolId) {
                    $this->clearSchoolPrincipalInfo($oldSchoolId);
                }

                // Update new school's principal info
                if ($newSchoolId) {
                    $this->updateSchoolPrincipalInfo($newSchoolId, $principal);
                }
            } else if ($newSchoolId) {
                // Just update the school's principal info with latest data
                $this->updateSchoolPrincipalInfo($newSchoolId, $principal);
            }

            DB::commit();

            return $principal->fresh(['school']);
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Failed to update principal: ' . $e->getMessage());
        }
    }

    /**
     * Delete principal
     */
    public function deletePrincipal($id)
    {
        DB::beginTransaction();
        try {
            $principal = User::where('role', 'principal')->find($id);

            if (!$principal) {
                return null;
            }

            // Clear school's principal info if assigned
            if ($principal->school_id) {
                $this->clearSchoolPrincipalInfo($principal->school_id);
            }

            $principal->delete();

            DB::commit();

            return true;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Failed to delete principal: ' . $e->getMessage());
        }
    }

    /**
     * Assign principal to school
     */
    public function assignPrincipalToSchool($principalId, $schoolId)
    {
        DB::beginTransaction();
        try {
            $principal = User::where('role', 'principal')->find($principalId);
            $school = School::find($schoolId);

            if (!$principal || !$school) {
                throw new Exception('Principal or School not found');
            }

            // Check if school already has a principal
            $existingPrincipal = User::where('role', 'principal')
                ->where('school_id', $schoolId)
                ->where('id', '!=', $principalId)
                ->first();

            if ($existingPrincipal) {
                // Unassign existing principal
                $existingPrincipal->update(['school_id' => null]);
            }

            // Assign new principal
            $principal->update(['school_id' => $schoolId]);

            // Update school's principal info
            $this->updateSchoolPrincipalInfo($schoolId, $principal);

            DB::commit();

            return $principal->fresh(['school']);
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Failed to assign principal: ' . $e->getMessage());
        }
    }

    /**
     * Unassign principal from school
     */
    public function unassignPrincipalFromSchool($principalId)
    {
        DB::beginTransaction();
        try {
            $principal = User::where('role', 'principal')->find($principalId);

            if (!$principal) {
                throw new Exception('Principal not found');
            }

            $schoolId = $principal->school_id;

            // Clear school's principal info
            if ($schoolId) {
                $this->clearSchoolPrincipalInfo($schoolId);
            }

            // Unassign principal
            $principal->update(['school_id' => null]);

            DB::commit();

            return $principal->fresh(['school']);
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Failed to unassign principal: ' . $e->getMessage());
        }
    }

    /**
     * Toggle principal status
     */
    public function toggleStatus($id)
    {
        $principal = User::where('role', 'principal')->find($id);

        if (!$principal) {
            return null;
        }

        $newStatus = $principal->status === 'active' ? 'inactive' : 'active';
        $principal->update(['status' => $newStatus]);

        return $principal->fresh(['school']);
    }

    /**
     * Reset principal password
     */
    public function resetPassword($id)
    {
        DB::beginTransaction();
        try {
            $principal = User::where('role', 'principal')->find($id);

            if (!$principal) {
                return null;
            }

            // Generate new password
            $plainPassword = $this->generatePassword();
            $principal->update(['password' => Hash::make($plainPassword)]);

            // Send new password email
            $this->sendPasswordResetEmail($principal, $plainPassword);

            DB::commit();

            return $principal->fresh(['school']);
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Failed to reset password: ' . $e->getMessage());
        }
    }

    /**
     * Resend credentials to principal
     */
    public function resendCredentials($id)
    {
        try {
            $principal = User::where('role', 'principal')->find($id);

            if (!$principal) {
                return false;
            }

            // Generate new password
            $plainPassword = $this->generatePassword();
            $principal->update(['password' => Hash::make($plainPassword)]);

            // Send credentials email
            $this->sendPrincipalCredentialsEmail($principal, $plainPassword);

            return true;
        } catch (Exception $e) {
            throw new Exception('Failed to resend credentials: ' . $e->getMessage());
        }
    }

    /**
     * Update school's principal information
     */
    private function updateSchoolPrincipalInfo($schoolId, $principal)
    {
        $school = School::find($schoolId);

        if ($school) {
            $school->update([
                'principal_name' => $principal->full_name,
                'principal_email' => $principal->email,
                'principal_phone' => $principal->phone,
            ]);
        }
    }

    /**
     * Clear school's principal information
     */
    private function clearSchoolPrincipalInfo($schoolId)
    {
        $school = School::find($schoolId);

        if ($school) {
            $school->update([
                'principal_name' => null,
                'principal_email' => null,
                'principal_phone' => null,
            ]);
        }
    }

    /**
     * Send principal credentials email
     */
    private function sendPrincipalCredentialsEmail($principal, $plainPassword)
    {
        $loginUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/login';

        $subject = 'Welcome to School Management System - Your Principal Credentials';

        $message = "Dear {$principal->full_name},\n\n";
        $message .= "Welcome to the School Management System!\n\n";
        $message .= "You have been registered as a Principal. Here are your login credentials:\n\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "📧 Email: {$principal->email}\n";
        $message .= "👤 Username: {$principal->username}\n";
        $message .= "🔑 Password: {$plainPassword}\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

        if ($principal->school_id) {
            $school = School::find($principal->school_id);
            if ($school) {
                $message .= "🏫 Assigned School: {$school->name}\n";
                $message .= "📍 School Code: {$school->school_code}\n\n";
            }
        }

        $message .= "🌐 Login URL: {$loginUrl}\n\n";
        $message .= "⚠️ IMPORTANT: Please change your password after your first login for security purposes.\n\n";
        $message .= "If you have any questions or need assistance, please contact the administrator.\n\n";
        $message .= "Best regards,\n";
        $message .= "School Management System Team";

        $this->emailService->sendRaw($principal->email, $subject, $message);
    }

    /**
     * Send password reset email
     */
    private function sendPasswordResetEmail($principal, $plainPassword)
    {
        $loginUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/login';

        $subject = 'Password Reset - School Management System';

        $message = "Dear {$principal->full_name},\n\n";
        $message .= "Your password has been reset successfully.\n\n";
        $message .= "Here are your new login credentials:\n\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "📧 Email: {$principal->email}\n";
        $message .= "👤 Username: {$principal->username}\n";
        $message .= "🔑 New Password: {$plainPassword}\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        $message .= "🌐 Login URL: {$loginUrl}\n\n";
        $message .= "⚠️ IMPORTANT: Please change your password after logging in.\n\n";
        $message .= "If you did not request this password reset, please contact the administrator immediately.\n\n";
        $message .= "Best regards,\n";
        $message .= "School Management System Team";

        $this->emailService->sendRaw($principal->email, $subject, $message);
    }
}

