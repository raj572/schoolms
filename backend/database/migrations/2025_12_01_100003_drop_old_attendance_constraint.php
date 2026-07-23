<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop ONLY the old constraint uq_student_date.
     * The new constraint uq_student_date_period should already exist.
     */
    public function up(): void
    {
        // Force drop old constraint - multiple attempts with different methods
        $dropped = false;
        
        // Method 1: Standard ALTER TABLE DROP INDEX
        try {
            DB::statement('ALTER TABLE student_attendance_records DROP INDEX uq_student_date');
            $dropped = true;
            Log::info('Successfully dropped old constraint uq_student_date');
        } catch (\Exception $e) {
            // Method 2: DROP INDEX syntax
            try {
                DB::statement('DROP INDEX uq_student_date ON student_attendance_records');
                $dropped = true;
                Log::info('Successfully dropped old constraint uq_student_date (method 2)');
            } catch (\Exception $e2) {
                // Method 3: Check if it actually exists
                $indexes = DB::select("SHOW INDEX FROM student_attendance_records WHERE Key_name = 'uq_student_date'");
                if (empty($indexes)) {
                    $dropped = true;
                    Log::info('Old constraint uq_student_date does not exist');
                } else {
                    Log::warning('Could not drop uq_student_date: ' . $e2->getMessage());
                    // Try one more time with raw connection
                    try {
                        DB::connection()->getPdo()->exec('ALTER TABLE student_attendance_records DROP INDEX uq_student_date');
                        $dropped = true;
                        Log::info('Successfully dropped old constraint uq_student_date (raw PDO)');
                    } catch (\Exception $e3) {
                        Log::error('All methods failed to drop uq_student_date: ' . $e3->getMessage());
                        // Don't throw - continue to verify new constraint exists
                    }
                }
            }
        }

        // Verify new constraint exists
        $newIndexes = DB::select("SHOW INDEX FROM student_attendance_records WHERE Key_name = 'uq_student_date_period'");
        
        if (empty($newIndexes)) {
            // New constraint doesn't exist - add it
            try {
                DB::statement('
                    ALTER TABLE student_attendance_records 
                    ADD UNIQUE INDEX uq_student_date_period (student_details_id, attendance_date, period_number)
                ');
                Log::info('Successfully added new constraint uq_student_date_period');
            } catch (\Exception $e) {
                Log::error('Failed to add uq_student_date_period: ' . $e->getMessage());
                throw $e;
            }
        } else {
            Log::info('New constraint uq_student_date_period already exists');
        }
        
        if (!$dropped) {
            Log::warning('WARNING: Old constraint uq_student_date may still exist. Please verify manually.');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop new constraint
        try {
            DB::statement('ALTER TABLE student_attendance_records DROP INDEX uq_student_date_period');
        } catch (\Exception $e) {
            // Ignore
        }
        
        // Restore old constraint
        try {
            DB::statement('
                ALTER TABLE student_attendance_records 
                ADD UNIQUE INDEX uq_student_date (student_details_id, attendance_date)
            ');
        } catch (\Exception $e) {
            // Ignore
        }
    }
};

