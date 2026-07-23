<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('super_admins', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('password');

            // Password reset
            $table->string('password_reset_token', 64)->nullable();
            $table->timestamp('password_reset_expires_at')->nullable();

            $table->string('full_name');
            $table->string('phone')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->string('role')->default('super_admin'); // super_admin, system_admin, support
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();
            $table->text('permissions')->nullable(); // JSON field for granular permissions
            $table->timestamps();
            $table->softDeletes();

            $table->index('email');
            $table->index('status');
            $table->index('role');
            $table->index('password_reset_token');
        });

        // Insert default super admin
        DB::table('super_admins')->insert([
            'username' => 'superadmin',
            'email' => 'admin@eklavya.com',
            'password' => Hash::make('Admin@123'),
            'full_name' => 'System Administrator',
            'phone' => '+91 9876543210',
            'status' => 'active',
            'role' => 'super_admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('super_admins');
    }
};

