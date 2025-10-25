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
        Schema::table('scene_items', function (Blueprint $table) {
            $table->text('sprite_file')->nullable()->after('file_name');
            $table->text('catch_sprite_file')->nullable()->after('catch_file_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scene_items', function (Blueprint $table) {
            $table->dropColumn('sprite_file');
            $table->dropColumn('catch_sprite_file');
        });
    }
};
