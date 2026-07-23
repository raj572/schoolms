<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('teacher_attendance_records', function (Blueprint $table) {
            // Add new fields for comprehensive tracking
            if (!Schema::hasColumn('teacher_attendance_records', 'marked_by')) {
                $table->unsignedBigInteger('marked_by')->nullable()->after('status'); // Principal ID who marked
            }
            if (!Schema::hasColumn('teacher_attendance_records', 'check_in_time')) {
                $table->datetime('check_in_time')->nullable()->after('marked_by');
            }
            if (!Schema::hasColumn('teacher_attendance_records', 'check_out_time')) {
                $table->datetime('check_out_time')->nullable()->after('check_in_time');
            }
            
            // Add foreign key for marked_by (skip if FK already exists)
            // Note: Foreign key will be added in a separate try-catch to avoid errors if it exists
        });

        // Add foreign key for marked_by separately (to avoid issues if it already exists)
        if (Schema::hasColumn('teacher_attendance_records', 'marked_by')) {
            try {
                DB::statement("
                    ALTER TABLE teacher_attendance_records 
                    ADD CONSTRAINT fk_teacher_attendance_marked_by 
                    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
                ");
            } catch (\Exception $e) {
                // Foreign key might already exist, ignore
                Log::info('Foreign key for marked_by may already exist: ' . $e->getMessage());
            }
        }

        // Update status enum to include 'leave' (if the column exists)
        if (Schema::hasColumn('teacher_attendance_records', 'status')) {
            try {
                DB::statement("ALTER TABLE teacher_attendance_records MODIFY COLUMN status ENUM('present', 'absent', 'late', 'half_day', 'holiday', 'leave')");
            } catch (\Exception $e) {
                // Enum might already be updated, ignore
                Log::info('Status enum may already include leave: ' . $e->getMessage());
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teacher_attendance_records', function (Blueprint $table) {
            $table->dropForeign(['marked_by']);
            $table->dropColumn([
                'marked_by',
                'check_in_time',
                'check_out_time'
            ]);
        });

        // Revert status enum (remove 'leave')
        DB::statement("ALTER TABLE teacher_attendance_records MODIFY COLUMN status ENUM('present', 'absent', 'late', 'half_day', 'holiday')");
    }
};

