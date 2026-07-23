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
        Schema::create('principal_message_permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('principal_id');
            $table->unsignedBigInteger('school_id')->nullable();
            
            // Permission flags - default to true (all allowed)
            $table->boolean('allow_from_teachers')->default(true);
            $table->boolean('allow_from_parents')->default(true);
            $table->boolean('allow_from_students')->default(true);
            $table->boolean('allow_from_administrator')->default(true);
            
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('principal_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            
            // Ensure one permission record per principal
            $table->unique('principal_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('principal_message_permissions');
    }
};
