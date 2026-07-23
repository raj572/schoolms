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
        Schema::table('subscription_plans', function (Blueprint $table) {
            // Make price nullable (it's legacy)
            $table->decimal('price', 10, 2)->nullable()->change();
            
            // Make monthly_price required (NOT NULL)
            $table->decimal('monthly_price', 10, 2)->nullable(false)->default(0)->change();
            
            // annual_price is already nullable, so no change needed
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            // Revert price to NOT NULL
            $table->decimal('price', 10, 2)->nullable(false)->change();
            
            // Revert monthly_price to default(0.00)
            $table->decimal('monthly_price', 10, 2)->default(0.00)->change();
        });
    }
};
