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
        Schema::create('school_timings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');

            $table->string('day'); // Day or day range (e.g., "Monday - Friday", "Saturday")
            $table->string('morning'); // Classes timing (e.g., "6:00 AM - 2:30 PM")
            $table->string('office'); // Office timing (e.g., "6:00 AM - 4:00 PM")
            $table->integer('order')->default(0); // For sorting (0 = Monday-Friday, 1 = Saturday, etc.)

            $table->timestamps(); // created_at & updated_at

            // Index for better query performance
            $table->index(['school_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_timings');
    }
};

