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
        // Exams Table
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('school_id');
            $table->string('exam_name'); // e.g., "Mid-Term", "Final Exam"
            $table->string('exam_type')->nullable(); // e.g., "term", "unit_test"
            $table->date('start_date');
            $table->date('end_date');
            $table->text('description')->nullable();
            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled'])->default('scheduled');
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
        });

        // Exam Schedules Table
        Schema::create('exam_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('exam_id');
            $table->unsignedBigInteger('school_id');
            $table->unsignedBigInteger('class_id');
            $table->unsignedBigInteger('subject_id');
            $table->date('exam_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('total_marks')->default(100);
            $table->integer('passing_marks')->default(40);
            $table->string('room_number')->nullable();
            $table->text('instructions')->nullable();
            $table->timestamps();

            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('class_id')->references('id')->on('school_class')->onDelete('cascade');
            $table->foreign('subject_id')->references('id')->on('school_subjects')->onDelete('cascade');
        });

        // Student Exam Marks Table
        Schema::create('student_exam_marks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('exam_schedule_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('student_details_id');
            $table->decimal('marks_obtained', 5, 2)->nullable();
            $table->decimal('marks_total', 5, 2);
            $table->string('grade')->nullable(); // A+, A, B, etc.
            $table->text('remarks')->nullable();
            $table->enum('status', ['pending', 'submitted', 'absent'])->default('pending');
            $table->unsignedBigInteger('entered_by')->nullable(); // teacher user_id
            $table->timestamp('entered_at')->nullable();
            $table->timestamps();

            $table->foreign('exam_schedule_id')->references('id')->on('exam_schedules')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('student_details_id')->references('id')->on('student_details')->onDelete('cascade');
            $table->foreign('entered_by')->references('id')->on('teachers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_exam_marks');
        Schema::dropIfExists('exam_schedules');
        Schema::dropIfExists('exams');
    }
};


