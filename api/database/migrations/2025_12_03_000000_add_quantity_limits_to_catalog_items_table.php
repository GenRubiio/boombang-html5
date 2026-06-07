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
        Schema::table('catalog_items', function (Blueprint $table) {
            $table->integer('min_purchase_quantity')->default(1)->after('is_multi_buy');
            $table->integer('max_purchase_quantity')->default(10)->after('min_purchase_quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('catalog_items', function (Blueprint $table) {
            $table->dropColumn(['min_purchase_quantity', 'max_purchase_quantity']);
        });
    }
};