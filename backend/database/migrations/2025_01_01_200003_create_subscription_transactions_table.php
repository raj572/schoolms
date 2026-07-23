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
        Schema::create('subscription_transactions', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->unsignedBigInteger('school_id')->nullable();
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('set null');

            $table->unsignedBigInteger('subscription_plan_id')->nullable();
            $table->foreign('subscription_plan_id')->references('id')->on('subscription_plans')->onDelete('set null');

            $table->unsignedBigInteger('administrator_id')->nullable();
            $table->foreign('administrator_id')->references('id')->on('users')->onDelete('set null');

            // Razorpay Order Fields
            $table->string('razorpay_order_id')->unique();
            $table->decimal('order_amount', 10, 2); // in rupees
            $table->string('order_currency')->default('INR');
            $table->string('order_receipt')->nullable();
            $table->string('order_status')->default('created');
            $table->timestamp('order_created_at')->nullable();

            // Payment Fields (to be filled after payment)
            $table->string('razorpay_payment_id')->nullable()->unique();
            $table->string('razorpay_signature')->nullable();
            $table->timestamp('payment_date')->nullable();
            $table->enum('status', ['pending', 'success', 'failed'])->default('pending');

            // Subscription details
            $table->string('plan_name')->nullable();
            $table->enum('billing_cycle', ['monthly', 'annual'])->nullable();
            $table->integer('duration_months')->nullable(); // e.g., 1 for monthly, 12 for annual
            $table->timestamp('subscription_start_date')->nullable();
            $table->timestamp('subscription_end_date')->nullable();

            // Tracking
            $table->text('remarks')->nullable();
            $table->json('api_response')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['school_id', 'status']);
            $table->index(['administrator_id', 'status']);
            $table->index('payment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_transactions');
    }
};

