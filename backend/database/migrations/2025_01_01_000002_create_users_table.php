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
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Full name and school relationship
            $table->string('full_name')->nullable();
            $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('set null')->onUpdate('cascade');

            // Administrator relationship (for principals)
            $table->unsignedBigInteger('administrator_id')->nullable();

            // User type and credentials
            $table->enum('role', ['administrator', 'accountant', 'principal', 'librarian', 'warden']);
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('password');

            // Email verification
            $table->timestamp('email_verified_at')->nullable();
            $table->string('verification_token')->nullable();
            $table->boolean('email_verified')->default(true);

            // Contact
            $table->string('phone')->nullable();

            // Status fields
            $table->string('status')->default('active');
            $table->enum('assignment_status', ['unassigned', 'assigned'])->default('unassigned');
            $table->enum('registration_status', [
                'pending_verification',
                'pending_school_setup',
                'pending_subscription',
                'active',
                'suspended',
                'inactive'
            ])->default('active');

            // Onboarding flags
            $table->boolean('school_setup_completed')->default(true);
            $table->boolean('subscription_active')->default(true);

            // OTP for authentication
            $table->string('otp')->nullable();
            $table->string('otp_expiration_time')->nullable();

            $table->timestamps();

            // Foreign keys
            $table->foreign('administrator_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');

            // Indexes
            $table->index('role');
            $table->index('status');
            $table->index('administrator_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

