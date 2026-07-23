<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Fix the unique constraint to allow multiple period attendance records
     * while keeping quick attendance unique per student per date.
     */
    public function up(): void
    {
        // Drop the old unique constraint that prevents multiple periods
        // Try Laravel way first, then raw SQL as fallback
        try {
            Schema::table('student_attendance_records', function (Blueprint $table) {
                $table->dropUnique('uq_student_date');
            });
        } catch (\Exception $e) {
            // Try raw SQL if Laravel method fails
            try {
                DB::statement('ALTER TABLE student_attendance_records DROP INDEX uq_student_date');
            } catch (\Exception $e2) {
                // Index might not exist - that's okay, continue
            }
        }

        // Add new unique constraint that includes period_number
        // This allows:
        // - One quick attendance (period_number = NULL) per student per date
        // - Multiple period attendance records (different period_number) per student per date
        // Note: MySQL allows multiple NULL values in unique constraints, but our app logic
        // ensures only one quick attendance (period_number = NULL) per student per date
        
        // Check if new constraint already exists
        $indexExists = DB::select("SHOW INDEX FROM student_attendance_records WHERE Key_name = 'uq_student_date_period'");
        
        if (empty($indexExists)) {
            DB::statement('
                ALTER TABLE student_attendance_records 
                ADD UNIQUE INDEX uq_student_date_period (student_details_id, attendance_date, period_number)
            ');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_attendance_records', function (Blueprint $table) {
            // Drop the new constraint
            try {
                $table->dropUnique('uq_student_date_period');
            } catch (\Exception $e) {
                // Try raw SQL
                try {
                    DB::statement('ALTER TABLE student_attendance_records DROP INDEX uq_student_date_period');
                } catch (\Exception $e2) {
                    // Constraint might not exist
                }
            }
            
            // Restore the old constraint
            $table->unique(['student_details_id', 'attendance_date'], 'uq_student_date');
        });
    }
};

