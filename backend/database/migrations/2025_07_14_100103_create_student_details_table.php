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
        Schema::create('student_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('student_id')
                ->nullable()
                ->constrained('students')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $table->unsignedBigInteger('parent_id')
                ->nullable();
            $table->string('candidate_name');
            $table->string('gender');
            $table->string('addhar')->unique()->nullable();
            $table->date('dob');
            $table->string('class');
            $table->string('section');
            $table->enum('status', ['studying', 'tc_issued', 'left'])->default('studying');
            $table->string('roll_no')->nullable();
            $table->string('email');
            $table->string('father_name');
            $table->string('mother_name');
            $table->string('phone');
            $table->string('address');
            $table->date('admission_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_details');
    }
};
