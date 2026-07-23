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
        Schema::create('school_buses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('school_id');
            $table->string('bus_number')->unique();
            $table->string('driver_name');
            $table->string('driver_contact');
            $table->string('route_name')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            // foreign key
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade')->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_buses');
    }
};
