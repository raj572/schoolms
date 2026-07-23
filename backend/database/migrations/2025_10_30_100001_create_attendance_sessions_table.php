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
        Schema::create('attendance_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('school_id');
            $table->unsignedBigInteger('class_id')->nullable();
            $table->unsignedBigInteger('teacher_id'); // Who created the session
            $table->string('session_code')->unique(); // Unique code for QR
            $table->date('session_date');
            $table->integer('period_number')->nullable(); // For period-wise attendance
            $table->unsignedBigInteger('subject_id')->nullable(); // For subject-specific
            $table->enum('session_type', ['quick', 'period', 'class', 'qr'])->default('quick');
            $table->enum('status', ['active', 'completed', 'expired'])->default('active');
            $table->datetime('expires_at'); // QR code expiry time
            $table->integer('total_students')->default(0);
            $table->integer('checked_in_count')->default(0);
            $table->timestamps();

            // Foreign Keys
            $table->foreign('school_id')
                ->references('id')
                ->on('schools')
                ->cascadeOnDelete();

            $table->foreign('teacher_id')
                ->references('id')
                ->on('teachers')
                ->cascadeOnDelete();

            // Indexes
            $table->index(['session_code', 'status'], 'idx_session_code');
            $table->index(['school_id', 'session_date'], 'idx_school_date');
            $table->index('expires_at', 'idx_expires');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_sessions');
    }
};

