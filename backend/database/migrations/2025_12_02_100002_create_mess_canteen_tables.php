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
        // Mess Menus Table
        Schema::create('mess_menus', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('school_id');
            $table->date('date');
            $table->enum('meal_type', ['breakfast', 'lunch', 'dinner']);
            $table->json('items'); // Array of menu items
            $table->unsignedBigInteger('created_by'); // warden_id
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            // Ensure unique menu per school, date, and meal type
            $table->unique(['school_id', 'date', 'meal_type']);
            $table->index(['school_id', 'date']);
        });

        // Mess Bookings Table
        Schema::create('mess_bookings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('school_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('menu_id');
            $table->date('booking_date');
            $table->enum('meal_type', ['breakfast', 'lunch', 'dinner']);
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'consumed'])->default('pending');
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('menu_id')->references('id')->on('mess_menus')->onDelete('cascade');
            
            // Indexes for performance
            $table->index(['school_id', 'booking_date']);
            $table->index(['student_id', 'booking_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mess_bookings');
        Schema::dropIfExists('mess_menus');
    }
};

