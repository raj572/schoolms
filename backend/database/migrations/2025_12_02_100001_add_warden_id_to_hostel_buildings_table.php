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
        Schema::table('hostel_buildings', function (Blueprint $table) {
            $table->unsignedBigInteger('warden_id')->nullable()->after('school_id');
            $table->foreign('warden_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hostel_buildings', function (Blueprint $table) {
            $table->dropForeign(['warden_id']);
            $table->dropColumn('warden_id');
        });
    }
};

