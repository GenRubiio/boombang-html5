<?php

use App\Enums\CatalogItemTypesEnum;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('catalog_items', function (Blueprint $table) {
            $table->text('spreadsheet')->after('image');
            $table->text('atlas')->after('spreadsheet')->nullable();
            $table->string('type')->default(CatalogItemTypesEnum::SCENE_ITEM->key())->after('price');
            $table->integer('stars')->default(1)->after('type');
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
            $table->dropColumn('spreadsheet');
            $table->dropColumn('atlas');
            $table->dropColumn('type');
            $table->dropColumn('stars');
            $table->dropColumn('in_lobby_gacha');
            $table->dropColumn('show_in_inventory');
        });
    }
};
