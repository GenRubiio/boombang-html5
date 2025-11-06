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
        Schema::table('public_scene_items', function (Blueprint $table) {
            $table->unsignedBigInteger('catalog_item_id')->nullable()->after('event_id');

            $table->foreign('catalog_item_id')
                ->references('id')
                ->on('catalog_items')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('public_scene_items', function (Blueprint $table) {
            $table->dropForeign(['catalog_item_id']);
            $table->dropColumn('catalog_item_id');
        });
    }
};
