<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modificar la columna price_type para incluir stripe_payment
        DB::statement("ALTER TABLE catalog_items MODIFY COLUMN price_type ENUM('golden_coins', 'silver_coins', 'stripe_payment') DEFAULT 'golden_coins'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir a los valores originales
        DB::statement("ALTER TABLE catalog_items MODIFY COLUMN price_type ENUM('golden_coins', 'silver_coins') DEFAULT 'golden_coins'");
    }
};