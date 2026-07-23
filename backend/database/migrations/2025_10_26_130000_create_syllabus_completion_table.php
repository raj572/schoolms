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
        Schema::create('syllabus_completion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('school_class')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('school_subjects')->cascadeOnDelete();
            $table->integer('total_chapters')->default(0);
            $table->integer('completed_chapters')->default(0);
            $table->date('last_updated')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['teacher_id', 'class_id', 'subject_id'], 'unique_syllabus_tracking');
            $table->index(['school_id', 'teacher_id', 'class_id', 'subject_id'], 'syllabus_comp_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('syllabus_completion');
    }
};

