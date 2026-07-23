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
        Schema::table('hostel_rooms', function (Blueprint $table) {
            $table->integer('floor')->nullable()->after('room_number');
            $table->string('block_wing')->nullable()->after('floor');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hostel_rooms', function (Blueprint $table) {
            $table->dropColumn(['floor', 'block_wing']);
        });
    }
};
