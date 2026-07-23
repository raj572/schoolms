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
        Schema::create('school_facilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');

            $table->string('name'); // Facility name (e.g., "Science Laboratory", "Computer Lab")
            $table->integer('count')->default(1); // Number of this facility available
            $table->text('description')->nullable(); // Description of the facility

            $table->string('status')->default('active'); // active, inactive, under_maintenance
            $table->timestamps(); // created_at & updated_at

            // Index for better query performance
            $table->index(['school_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_facilities');
    }
};

