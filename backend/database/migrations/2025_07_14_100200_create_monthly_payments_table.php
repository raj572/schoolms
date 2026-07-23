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
        Schema::create('monthly_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_details_id')->constrained('student_details')->cascadeOnDelete();
            $table->string('month'); // YYYY-MM
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->enum('status', ['due', 'paid'])->default('due');
            $table->date('payment_date')->nullable();
            $table->string('mode')->nullable();
            $table->string('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_payments');
    }
};
