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
        Schema::create('public_scenes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('type');
            $table->integer('menu_type');
            $table->integer('max_users')->default(10);
            $table->integer('map_width')->default(30);
            $table->integer('map_height')->default(30);
            $table->text('map');
            $table->integer('start_x')->default(11);
            $table->integer('start_y')->default(11);
            $table->integer('start_z')->default(2);
            $table->integer('parent_id')->unsigned()->nullable();
            $table->integer('lft')->unsigned()->nullable();
            $table->integer('rgt')->unsigned()->nullable();
            $table->integer('depth')->unsigned()->nullable();
            $table->boolean('active')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('public_scenes');
    }
};
