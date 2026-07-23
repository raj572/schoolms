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
        Schema::create('syllabus_completion_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('syllabus_completion_id')->constrained('syllabus_completion')->cascadeOnDelete();
            $table->integer('completed_chapters');
            $table->decimal('completion_percentage', 5, 2);
            $table->date('recorded_date');
            $table->timestamps();

            $table->index(['syllabus_completion_id', 'recorded_date'], 'syllabus_hist_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('syllabus_completion_history');
    }
};

