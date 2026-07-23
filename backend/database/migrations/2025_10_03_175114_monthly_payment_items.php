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
        Schema::create('monthly_payment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monthly_payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('student_services');
            $table->string('label'); // descriptive name like "Tuition Fee", "Library Service", etc.
            $table->decimal('amount', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_payment_items');
    }
};
