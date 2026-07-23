<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('parents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('school_id');
            $table->unsignedBigInteger('teacher_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable(); // if parent also logs in

            $table->string('role')->default('parent');
            $table->string('father_name');
            $table->string('mother_name');
            $table->string('guardian_name')->nullable(); 
            $table->string('phone')->nullable();
            $table->string('email')->unique()->nullable();
            $table->string('password');
            $table->json('address')->nullable();
            $table->string('relation')->nullable(); // father/mother/guardian
            $table->string('status')->default('active');

            $table->timestamps();

            // foreign keys
            // $table->foreign('teacher_id')->references('id')->on('teacher')->cascadeOnDelete();
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade')->cascadeOnUpdate();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parents');
    }
};
