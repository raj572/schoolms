<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('online_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete()->cascadeOnUpdate();
            $table->unsignedBigInteger('student_details_id')->nullable();
            $table->foreign('student_details_id')->references('id')->on('student_details')->onDelete('set null');

            // Razorpay Order Fields
            $table->string('razorpay_order_id')->unique();
            $table->integer('order_amount'); // in paise
            $table->string('order_currency')->default('INR');
            $table->string('order_receipt')->nullable();
            $table->string('order_status')->default('created');
            $table->timestamp('order_created_at')->nullable();

            // Payment Fields (to be filled after payment)
            $table->string('razorpay_payment_id')->nullable()->unique();
            $table->string('razorpay_signature')->nullable();
            $table->timestamp('payment_date')->nullable();
            $table->string('status')->default('pending'); // success, failed, pending

            // Tracking
            $table->text('remarks')->nullable();
            $table->json('api_response')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('online_transactions');
    }
};
