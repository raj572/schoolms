<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('student_attendance_summary', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_details_id');
            $table->unsignedBigInteger('school_id');
            $table->year('year');
            $table->tinyInteger('month'); // 1 = Jan, 2 = Feb ...
            $table->integer('total_days')->default(0);
            $table->integer('present_days')->default(0);
            $table->integer('absent_days')->default(0);
            $table->integer('late_days')->default(0);
            $table->integer('half_days')->default(0);
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

            // Prevent duplicate summaries for same student-month
            $table->unique(['student_details_id', 'year', 'month'], 'uq_student_month');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_attendance_summary');
    }
};
