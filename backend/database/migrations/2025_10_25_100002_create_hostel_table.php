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
        // Hostel Buildings Table
        Schema::create('hostel_buildings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('school_id');
            $table->string('building_name');
            $table->string('building_type')->nullable(); // Boys, Girls, Staff
            $table->text('address')->nullable();
            $table->string('warden_name')->nullable();
            $table->string('warden_contact')->nullable();
            $table->integer('total_rooms')->default(0);
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive', 'under_maintenance'])->default('active');
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
        });

        // Hostel Rooms Table
        Schema::create('hostel_rooms', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hostel_building_id');
            $table->unsignedBigInteger('school_id');
            $table->string('room_number');
            $table->string('room_type')->nullable(); // Single, Double, Shared
            $table->integer('capacity')->default(1);
            $table->integer('occupied_beds')->default(0);
            $table->decimal('monthly_fee', 10, 2)->default(0);
            $table->text('facilities')->nullable(); // AC, Attached Bathroom, etc.
            $table->enum('status', ['available', 'full', 'under_maintenance'])->default('available');
            $table->timestamps();

            $table->foreign('hostel_building_id')->references('id')->on('hostel_buildings')->onDelete('cascade');
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
        });

        // Hostel Allocations Table
        Schema::create('hostel_allocations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hostel_room_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('student_details_id');
            $table->unsignedBigInteger('school_id');
            $table->date('allocation_date');
            $table->date('vacate_date')->nullable();
            $table->decimal('monthly_fee', 10, 2);
            $table->enum('status', ['active', 'vacated', 'suspended'])->default('active');
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->foreign('hostel_room_id')->references('id')->on('hostel_rooms')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('student_details_id')->references('id')->on('student_details')->onDelete('cascade');
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hostel_allocations');
        Schema::dropIfExists('hostel_rooms');
        Schema::dropIfExists('hostel_buildings');
    }
};


