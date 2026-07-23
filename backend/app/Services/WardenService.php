<?php

namespace App\Services;

use App\Models\User;
use App\Models\HostelBuilding;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class WardenService
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
        $upper    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lower    = 'abcdefghijklmnopqrstuvwxyz';
        $numbers  = '0123456789';
        $symbols  = '!@#$%^&*()-_=+?';

        // Ensure at least one of each type
        $password = '';
        $password .= $upper[random_int(0, strlen($upper) - 1)];
        $password .= $lower[random_int(0, strlen($lower) - 1)];
        $password .= $numbers[random_int(0, strlen($numbers) - 1)];
        $password .= $symbols[random_int(0, strlen($symbols) - 1)];

        // Fill remaining length with all characters mixed
        $all = $upper . $lower . $numbers . $symbols;
        for ($i = strlen($password); $i < $length; $i++) {
            $password .= $all[random_int(0, strlen($all) - 1)];
        }

        // Shuffle to avoid predictable sequence
        return str_shuffle($password);
    }

    /**
     * Get all wardens for a school
     */
    public function getWardensBySchool(int $schoolId)
    {
        return User::where('role', 'warden')
            ->where('school_id', $schoolId)
            ->with(['school:id,name,school_code'])
            ->orderBy('full_name', 'asc')
            ->get();
    }

    /**
     * Get paginated wardens with search and filters
     */
    public function getPaginatedWardens($perPage = 10, $page = 1, $search = '', $status = null, int $schoolId)
    {
        $query = User::where('role', 'warden')
            ->where('school_id', $schoolId)
            ->with(['school:id,name,school_code']);

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
     * Get warden by ID
     */
    public function getWardenById($id, int $schoolId)
    {
        return User::where('role', 'warden')
            ->where('school_id', $schoolId)
            ->with(['school:id,name,school_code'])
            ->find($id);
    }

    /**
     * Get unassigned wardens (not assigned to any building)
     */
    public function getUnassignedWardens(int $schoolId)
    {
        $assignedWardenIds = HostelBuilding::where('school_id', $schoolId)
            ->whereNotNull('warden_id')
            ->pluck('warden_id')
            ->toArray();

        return User::where('role', 'warden')
            ->where('school_id', $schoolId)
            ->whereNotIn('id', $assignedWardenIds)
            ->orderBy('full_name', 'asc')
            ->get();
    }

    /**
     * Create a new warden
     */
    public function createWarden(array $data, int $schoolId)
    {
        DB::beginTransaction();
        try {
            // Validate required fields
            if (empty($data['full_name']) || empty($data['email']) || empty($data['phone']) || empty($data['username'])) {
                throw new Exception('Missing required fields: full_name, email, phone, or username');
            }

            // Generate password
            $plainPassword = $this->generatePassword();

            // Create warden user
            $warden = User::create([
                'full_name' => $data['full_name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'username' => $data['username'],
                'password' => Hash::make($plainPassword),
                'role' => 'warden',
                'status' => $data['status'] ?? 'active',
                'assignment_status' => 'assigned', // Wardens are always assigned to a school
                'school_id' => $schoolId,
                'registration_status' => 'active',
                'email_verified' => true,
                'email_verified_at' => now(),
            ]);

            // Refresh to ensure all attributes are loaded
            $warden->refresh();

            // Send credentials email (wrap in try-catch to not fail creation if email fails)
            try {
                $this->sendWardenCredentialsEmail($warden, $plainPassword);
            } catch (Exception $emailException) {
                // Log email error but don't fail the creation
                Log::error('Failed to send warden credentials email: ' . $emailException->getMessage());
            }

            DB::commit();

            // Load school relationship
            return $warden->fresh(['school']);
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Failed to create warden: ' . $e->getMessage());
        }
    }

    /**
     * Update warden
     */
    public function updateWarden($id, array $data, int $schoolId)
    {
        DB::beginTransaction();
        try {
            $warden = User::where('role', 'warden')
                ->where('school_id', $schoolId)
                ->find($id);

            if (!$warden) {
                return null;
            }

            $warden->update($data);

            DB::commit();

            return $warden->fresh(['school']);
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Failed to update warden: ' . $e->getMessage());
        }
    }

    /**
     * Delete warden
     */
    public function deleteWarden($id, int $schoolId)
    {
        DB::beginTransaction();
        try {
            $warden = User::where('role', 'warden')
                ->where('school_id', $schoolId)
                ->find($id);

            if (!$warden) {
                return null;
            }

            // Check if warden is assigned to any building
            $building = HostelBuilding::where('warden_id', $id)->first();
            if ($building) {
                throw new Exception('Cannot delete warden. Warden is assigned to a building. Please unassign first.');
            }

            $warden->delete();

            DB::commit();

            return true;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Failed to delete warden: ' . $e->getMessage());
        }
    }

    /**
     * Assign warden to building
     */
    public function assignWardenToBuilding(int $wardenId, int $buildingId, int $schoolId)
    {
        DB::beginTransaction();
        try {
            $warden = User::where('role', 'warden')
                ->where('school_id', $schoolId)
                ->find($wardenId);

            $building = HostelBuilding::where('id', $buildingId)
                ->where('school_id', $schoolId)
                ->first();

            if (!$warden || !$building) {
                throw new Exception('Warden or Building not found');
            }

            // Unassign warden from previous building if assigned
            $previousBuilding = HostelBuilding::where('warden_id', $wardenId)
                ->where('id', '!=', $buildingId)
                ->first();

            if ($previousBuilding) {
                $previousBuilding->update(['warden_id' => null]);
            }

            // Assign to new building
            $building->update(['warden_id' => $wardenId]);

            DB::commit();

            return $building->fresh(['warden']);
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Failed to assign warden: ' . $e->getMessage());
        }
    }

    /**
     * Unassign warden from building
     */
    public function unassignWardenFromBuilding(int $buildingId, int $schoolId)
    {
        DB::beginTransaction();
        try {
            $building = HostelBuilding::where('id', $buildingId)
                ->where('school_id', $schoolId)
                ->first();

            if (!$building) {
                throw new Exception('Building not found');
            }

            $building->update(['warden_id' => null]);

            DB::commit();

            return $building->fresh(['warden']);
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Failed to unassign warden: ' . $e->getMessage());
        }
    }

    /**
     * Toggle warden status
     */
    public function toggleStatus($id, int $schoolId)
    {
        $warden = User::where('role', 'warden')
            ->where('school_id', $schoolId)
            ->find($id);

        if (!$warden) {
            return null;
        }

        $newStatus = $warden->status === 'active' ? 'inactive' : 'active';
        $warden->update(['status' => $newStatus]);

        return $warden->fresh(['school']);
    }

    /**
     * Reset warden password
     */
    public function resetPassword($id, int $schoolId)
    {
        DB::beginTransaction();
        try {
            $warden = User::where('role', 'warden')
                ->where('school_id', $schoolId)
                ->find($id);

            if (!$warden) {
                return null;
            }

            // Generate new password
            $plainPassword = $this->generatePassword();
            $warden->update(['password' => Hash::make($plainPassword)]);

            // Send new password email
            $this->sendPasswordResetEmail($warden, $plainPassword);

            DB::commit();

            return $warden->fresh(['school']);
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Failed to reset password: ' . $e->getMessage());
        }
    }

    /**
     * Send warden credentials email
     */
    private function sendWardenCredentialsEmail($warden, $plainPassword)
    {
        if (!$warden || !$plainPassword) {
            throw new Exception('Warden or password is missing for email');
        }

        $loginUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/login';
        $subject = 'Welcome to School Management System - Your Warden Credentials';

        $fullName = $warden->full_name ?? 'Warden';
        $email = $warden->email ?? '';
        $username = $warden->username ?? '';

        $message = "Dear {$fullName},\n\n";
        $message .= "Welcome to the School Management System!\n\n";
        $message .= "You have been registered as a Warden. Here are your login credentials:\n\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "📧 Email: {$email}\n";
        $message .= "👤 Username: {$username}\n";
        $message .= "🔑 Password: {$plainPassword}\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

        // Safely get school information
        if ($warden->school_id) {
            try {
                $school = \App\Models\School::find($warden->school_id);
                if ($school && isset($school->name)) {
                    $schoolName = $school->name ?? 'N/A';
                    $schoolCode = $school->school_code ?? 'N/A';
                    $message .= "🏫 Assigned School: {$schoolName}\n";
                    $message .= "📍 School Code: {$schoolCode}\n\n";
                }
            } catch (Exception $e) {
                // If school lookup fails, continue without school info
                Log::warning('Could not load school info for warden email: ' . $e->getMessage());
            }
        }

        $message .= "🌐 Login URL: {$loginUrl}\n\n";
        $message .= "⚠️ IMPORTANT: Please change your password after your first login for security purposes.\n\n";
        $message .= "If you have any questions or need assistance, please contact the principal.\n\n";
        $message .= "Best regards,\n";
        $message .= "School Management System Team";

        if (empty($email)) {
            throw new Exception('Warden email is empty, cannot send credentials email');
        }

        $this->emailService->sendRaw($email, $subject, $message);
    }

    /**
     * Send password reset email
     */
    private function sendPasswordResetEmail($warden, $plainPassword)
    {
        if (!$warden || !$plainPassword) {
            throw new Exception('Warden or password is missing for email');
        }

        $loginUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/login';
        $subject = 'Password Reset - School Management System';

        $fullName = $warden->full_name ?? 'Warden';
        $email = $warden->email ?? '';
        $username = $warden->username ?? '';

        $message = "Dear {$fullName},\n\n";
        $message .= "Your password has been reset successfully.\n\n";
        $message .= "Here are your new login credentials:\n\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "📧 Email: {$email}\n";
        $message .= "👤 Username: {$username}\n";
        $message .= "🔑 New Password: {$plainPassword}\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        $message .= "🌐 Login URL: {$loginUrl}\n\n";
        $message .= "⚠️ IMPORTANT: Please change your password after logging in.\n\n";
        $message .= "If you did not request this password reset, please contact the principal immediately.\n\n";
        $message .= "Best regards,\n";
        $message .= "School Management System Team";

        if (empty($email)) {
            throw new Exception('Warden email is empty, cannot send password reset email');
        }

        $this->emailService->sendRaw($email, $subject, $message);
    }
}

