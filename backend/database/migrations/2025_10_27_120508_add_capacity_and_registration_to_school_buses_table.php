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
        Schema::table('school_buses', function (Blueprint $table) {
            $table->integer('capacity')->default(40)->after('status');
            $table->string('registration_number')->nullable()->after('capacity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('school_buses', function (Blueprint $table) {
            $table->dropColumn(['capacity', 'registration_number']);
        });
    }
};
