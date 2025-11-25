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
        Schema::table('private_scene_configs', function (Blueprint $table) {
            $table->boolean('big_scene')->default(false)->after('island_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('private_scene_configs', function (Blueprint $table) {
            $table->dropColumn('big_scene');
        });
    }
};
