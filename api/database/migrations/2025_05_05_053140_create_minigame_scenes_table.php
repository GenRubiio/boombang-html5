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
        Schema::create('minigame_scenes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('type');
            $table->integer('map_width')->default(30);
            $table->integer('map_height')->default(30);
            $table->text('map');
            $table->text('position_users')->nullable();
            $table->integer('start_x')->default(11);
            $table->integer('start_y')->default(11);
            $table->integer('start_z')->default(2);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('minigame_scenes');
    }
};
