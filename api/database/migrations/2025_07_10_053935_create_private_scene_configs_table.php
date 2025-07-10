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
        Schema::create('private_scene_configs', function (Blueprint $table) {
            $table->id();
            $table->integer('island_type');
            $table->integer('max_users')->default(10);
            $table->integer('map_width')->default(30);
            $table->integer('map_height')->default(30);
            $table->text('map');
            $table->integer('start_x')->default(11);
            $table->integer('start_y')->default(11);
            $table->integer('start_z')->default(2);
            $table->text('default_colors')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('private_scene_configs');
    }
};
