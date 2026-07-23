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
        Schema::create('school_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');

            $table->string('title'); // Achievement title
            $table->text('description')->nullable(); // Achievement description
            $table->string('year'); // Year of achievement
            $table->string('category')->nullable(); // academic, sports, cultural, etc.
            $table->string('certificate_path')->nullable(); // Certificate/proof image path

            $table->timestamps(); // created_at & updated_at

            // Index for better query performance
            $table->index(['school_id', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_achievements');
    }
};

