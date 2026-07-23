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
        // 🗓️ 1️⃣ Daily Attendance Records
        Schema::create('teacher_attendance_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('teacher_id');
            $table->unsignedBigInteger('school_id');
            $table->date('attendance_date');
            $table->enum('status', ['present', 'absent', 'late', 'half_day', 'holiday']);
            $table->unsignedBigInteger('session_id')->nullable(); // Optional session tracking
            $table->text('remarks')->nullable();
            $table->timestamps();

            // Foreign Keys
            $table->foreign('teacher_id')
                ->references('id')
                ->on('teachers')
                ->cascadeOnDelete();

            $table->foreign('school_id')
                ->references('id')
                ->on('schools')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            // Optional FK for session table (commented if not created yet)
            // $table->foreign('session_id')->references('id')->on('attendance_sessions')->nullOnDelete();

            // Index for quick lookup
            $table->index(['school_id', 'attendance_date'], 'idx_school_date');

            // Prevent duplicate entries for same teacher on same date
            $table->unique(['teacher_id', 'school_id', 'attendance_date'], 'uq_teacher_attendance_date');
        });

        // 📊 2️⃣ Monthly Attendance Summary
        Schema::create('teacher_attendance_summary', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('teacher_id');
            $table->unsignedBigInteger('school_id');
            $table->year('year');
            $table->tinyInteger('month'); // 1 = Jan, 2 = Feb ...
            $table->integer('total_days')->default(0);
            $table->integer('present_days')->default(0);
            $table->integer('absent_days')->default(0);
            $table->integer('late_days')->default(0);
            $table->integer('half_days')->default(0);
            $table->timestamps();

            // Foreign Keys
            $table->foreign('teacher_id')
                ->references('id')
                ->on('teachers')
                ->cascadeOnDelete();

            $table->foreign('school_id')
                ->references('id')
                ->on('schools')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            // Unique constraint for each teacher per month-year
            $table->unique(['teacher_id', 'year', 'month'], 'uq_teacher_month');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_attendance_summary');
        Schema::dropIfExists('teacher_attendance_records');
    }
};
