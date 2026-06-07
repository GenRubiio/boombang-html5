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
            $table->boolean('is_multi_buy')->default(true)->after('show_in_inventory');
            $table->boolean('is_read_only')->default(false)->after('is_multi_buy');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('catalog_items', function (Blueprint $table) {
            $table->dropColumn('is_multi_buy');
            $table->dropColumn('is_read_only');
        });
    }
};
