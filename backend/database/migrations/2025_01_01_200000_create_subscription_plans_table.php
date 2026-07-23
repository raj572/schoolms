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
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();

            // Pricing
            $table->decimal('price', 10, 2)->nullable(); // Legacy field for backward compatibility
            $table->integer('duration_days')->default(365);
            $table->decimal('monthly_price', 10, 2); // Monthly subscription price (₹/month) - Required
            $table->decimal('annual_price', 10, 2)->nullable(); // Annual subscription price (₹/year) - Optional
            $table->string('currency')->default('INR');

            // Limits
            $table->integer('max_students')->nullable();
            $table->integer('max_teachers')->nullable();
            $table->integer('max_staff')->nullable();
            $table->integer('max_users')->nullable();
            $table->integer('max_classes')->nullable();
            $table->integer('max_trial_days')->nullable();
            $table->integer('trial_days')->nullable(); // Number of trial days configured for this plan

            // Features and flags
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_trial')->default(false);
            $table->boolean('is_popular')->default(false);
            $table->integer('sort_order')->default(0);

            $table->timestamps();

            $table->index('code');
            $table->index(['is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};

