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
            $table->integer('stars')->default(1)->after('price');
            $table->boolean('in_lobby_gacha')->default(false)->after('map_size');
            $table->boolean('show_in_inventory')->default(true)->after('in_lobby_gacha');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('catalog_items', function (Blueprint $table) {
            $table->dropColumn('stars');
            $table->dropColumn('in_lobby_gacha');
            $table->dropColumn('show_in_inventory');
        });
    }
};
