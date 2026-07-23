<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annual_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('student_details_id')
                ->constrained('student_details')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $table->decimal('admission_fee', 8, 2)->default(0);
            $table->decimal('registration_fee', 8, 2)->default(0);
            $table->decimal('other_fee', 8, 2)->default(0);
            $table->decimal('total_amount', 8, 2)->default(0);
            $table->enum('status', ['due', 'paid'])->default('due');
            $table->date('payment_date')->nullable();
            $table->enum('mode', ['online', 'cash', 'card', 'upi'])->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annual_payments');
    }
};
