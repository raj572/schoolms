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
        Schema::create('feature_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools');
            $table->date('usage_date')->index();
            $table->integer('student_count')->default(0);
            $table->integer('teacher_count')->default(0);
            $table->integer('staff_count')->default(0);
            $table->integer('class_count')->default(0);
            $table->integer('sms_sent')->default(0);
            $table->integer('emails_sent')->default(0);
            $table->integer('storage_used_mb')->default(0);
            $table->timestamps();

            $table->unique(['school_id', 'usage_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feature_usage');
    }
};

