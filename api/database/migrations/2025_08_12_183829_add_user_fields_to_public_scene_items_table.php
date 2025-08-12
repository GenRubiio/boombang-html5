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
            $table->integer('sum_points')->default(1);
            $table->boolean('sum_points_to_user_attribute')->default(false);
            $table->string('user_attribute_name')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('public_scene_items', function (Blueprint $table) {
            $table->dropColumn('sum_points');
            $table->dropColumn('sum_points_to_user_attribute');
            $table->dropColumn('user_attribute_name');
        });
    }
};
