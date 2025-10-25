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
        Schema::table('scene_arrows', function (Blueprint $table) {
            $table->integer('scale')->default(1)->after('sprite_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scene_arrows', function (Blueprint $table) {
            $table->dropColumn('scale');
        });
    }
};
