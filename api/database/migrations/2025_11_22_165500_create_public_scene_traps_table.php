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
        Schema::create('public_scene_traps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('public_scene_id')->constrained('public_scenes')->onDelete('cascade');
            $table->integer('position_x');
            $table->integer('position_y');
            $table->integer('coconut_type')->default(0)->comment('0=Coco, 1=Snowball, 2=Shoe, 3=Pie, 4=Maceta, 5=Avispas, 6=Garbage, 7=Sandia, 8=Yunque, 9=Piano');
            $table->boolean('active')->default(true);
            $table->timestamps();

            // Índice para optimizar la búsqueda por escena
            $table->index('public_scene_id', 'idx_scene_traps_scene');
            // Índice compuesto para buscar trampas por escena y posición
            $table->index(['public_scene_id', 'position_x', 'position_y', 'active'], 'idx_scene_traps_lookup');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('public_scene_traps');
    }
};
