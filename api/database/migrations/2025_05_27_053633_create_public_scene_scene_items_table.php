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
        Schema::create('public_scene_items', function (Blueprint $table) {
            $table->unsignedBigInteger('public_scenes_id');
            $table->unsignedBigInteger('scene_item_id');
            $table->integer('activate_time')->default(60)->comment('Time in seconds for which the item is visible');
            $table->integer('desactivate_time')->default(15)->comment('Time in seconds after which the item is hidden');
            $table->integer('min_users')->default(2)->comment('Minimum number of users required to display the item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('public_scene_items');
    }
};
