<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('username');
            $table->string('password')->nullable();
            $table->string('class');
            $table->string('status')->default('active');
            $table->string('role')->default('student');
            $table->string('email');
            $table->string('otp')->nullable();
            $table->string('otp_expiration_time')->nullable();
            $table->timestamps();

            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
