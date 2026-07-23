<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('student_attendance_records', function (Blueprint $table) {
            // Add new fields for comprehensive tracking
            $table->unsignedBigInteger('class_id')->nullable()->after('school_id');
            $table->unsignedBigInteger('subject_id')->nullable()->after('class_id');
            $table->integer('period_number')->nullable()->after('subject_id');
            $table->enum('check_in_method', ['manual', 'qr', 'biometric'])->default('manual')->after('status');
            $table->unsignedBigInteger('marked_by')->nullable()->after('check_in_method'); // Teacher ID who marked
            $table->time('check_in_time')->nullable()->after('marked_by');
            $table->time('check_out_time')->nullable()->after('check_in_time');
            
            // Add indexes
            $table->index(['class_id', 'attendance_date'], 'idx_class_date');
            $table->index(['subject_id', 'period_number'], 'idx_subject_period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_attendance_records', function (Blueprint $table) {
            $table->dropIndex('idx_class_date');
            $table->dropIndex('idx_subject_period');
            
            $table->dropColumn([
                'class_id',
                'subject_id',
                'period_number',
                'check_in_method',
                'marked_by',
                'check_in_time',
                'check_out_time'
            ]);
        });
    }
};

