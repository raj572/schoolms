<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('student_attendance_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_details_id');
            $table->unsignedBigInteger('school_id');
            $table->date('attendance_date');
            $table->enum('status', ['present', 'absent', 'late', 'half_day', 'holiday']);
            $table->unsignedBigInteger('session_id')->nullable(); // Optional if session-wise attendance
            $table->text('remarks')->nullable();
            $table->timestamps();

            // 🔗 Foreign Keys
            $table->foreign('student_details_id')
                ->references('id')
                ->on('student_details')
                ->cascadeOnDelete();

            $table->foreign('school_id')
                ->references('id')
                ->on('schools')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            // Indexes & Constraints
            $table->index(['school_id', 'attendance_date'], 'idx_school_date');
            $table->unique(['student_details_id', 'attendance_date'], 'uq_student_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_attendance_records');
    }
};
