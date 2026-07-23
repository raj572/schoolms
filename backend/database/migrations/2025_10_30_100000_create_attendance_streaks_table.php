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
        Schema::create('attendance_streaks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->enum('user_type', ['student', 'teacher']); // student or teacher
            $table->unsignedBigInteger('school_id');
            $table->integer('current_streak')->default(0); // Current consecutive days
            $table->integer('best_streak')->default(0); // Longest streak ever
            $table->date('last_attendance_date')->nullable();
            $table->json('badges_earned')->nullable(); // Array of badge names
            $table->integer('perfect_weeks')->default(0); // Count of perfect weeks
            $table->integer('perfect_months')->default(0); // Count of perfect months
            $table->timestamps();

            // Foreign key to schools
            $table->foreign('school_id')
                ->references('id')
                ->on('schools')
                ->cascadeOnDelete();

            // Indexes for performance
            $table->index(['user_id', 'user_type'], 'idx_user');
            $table->index(['school_id', 'user_type'], 'idx_school_user_type');
            
            // Unique constraint
            $table->unique(['user_id', 'user_type', 'school_id'], 'uq_user_streak');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_streaks');
    }
};

