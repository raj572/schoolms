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
        Schema::create('teacher_subjects', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('teacher_id');
            $table->unsignedBigInteger('school_id');
            $table->unsignedBigInteger('subject_id');
            $table->unsignedBigInteger('class_id');
            $table->timestamps();

            // Foreign keys
            $table->foreign('teacher_id')
                ->references('id')->on('teachers')
                ->onDelete('cascade')->cascadeOnUpdate();

            $table->foreign('school_id')
                ->references('id')->on('schools')
                ->onDelete('cascade')->cascadeOnUpdate();

            $table->foreign('subject_id')
                ->references('id')->on('school_subjects')
                ->onDelete('cascade')->cascadeOnUpdate();

            $table->foreign('class_id')
                ->references('id')->on('school_class')
                ->onDelete('cascade')->cascadeOnUpdate();

            // ✅ Allow teacher to teach multiple subjects in same class
            // Prevent exact duplicate entries only
            $table->unique(['teacher_id', 'school_id', 'class_id', 'subject_id'], 'teacher_subject_unique');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_subjects');
    }
};
