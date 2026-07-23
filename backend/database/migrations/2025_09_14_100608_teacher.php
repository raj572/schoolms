<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('school_id');
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable(); // if mapped with users table (login)

            $table->string('role')->default('teacher');
            $table->string('name');
            $table->string('email')->unique()->nullable();
            $table->string('password');
            $table->string('phone')->nullable();
            $table->string('qualification')->nullable();
            $table->date('dob')->nullable();
            $table->string('gender', 10)->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('status')->default('active');
            $table->string('otp')->nullable();
            $table->string('otp_expiration_time')->nullable();
            $table->string('employee_code')->nullable()->unique();

            $table->timestamps();

            // foreign keys
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade')->cascadeOnUpdate();
            // $table->foreign('parent_id')->references('parents')->on('id')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
