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
        Schema::create('schools', function (Blueprint $table) {
            $table->id();

            // Administrator relationship
            $table->unsignedBigInteger('administrator_id')->nullable();

            // Basic Information
            $table->string('name');
            $table->string('email')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->string('school_code')->nullable()->unique();

            // Address Information
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('pincode', 20)->nullable();

            // School Details
            $table->string('logo_path')->nullable();
            $table->string('affiliation_number')->nullable();
            $table->string('board')->nullable();
            $table->string('website')->nullable();
            $table->text('description')->nullable();
            $table->date('established_date')->nullable();

            // Principal Information
            $table->string('principal_name')->nullable();
            $table->string('principal_phone')->nullable();
            $table->string('principal_email')->nullable();
            $table->string('principal_sign_path')->nullable();

            // Subscription Information
            $table->string('subscription_status')->default('inactive');
            $table->date('subscription_start_date')->nullable();
            $table->date('subscription_end_date')->nullable();

            // Status
            $table->string('status')->default('active');

            $table->timestamps();

            // Indexes
            $table->index('administrator_id');
            $table->index('subscription_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};

