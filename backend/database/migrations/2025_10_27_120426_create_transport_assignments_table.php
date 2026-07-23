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
        Schema::create('transport_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->foreignId('student_details_id')->constrained('student_details')->onDelete('cascade');
            $table->foreignId('bus_id')->constrained('school_buses')->onDelete('cascade');
            $table->string('pickup_point');
            $table->time('pickup_time');
            $table->time('drop_time');
            $table->decimal('monthly_fee', 8, 2);
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index('school_id');
            $table->index('student_details_id');
            $table->index('bus_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transport_assignments');
    }
};
