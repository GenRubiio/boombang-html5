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
        Schema::create('npc_catalog_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('npc_id')->constrained('npcs')->onDelete('cascade');
            $table->foreignId('catalog_item_id')->constrained('catalog_items')->onDelete('cascade');
            $table->boolean('active')->default(true);
            $table->timestamps();

            // Un catalog_item solo puede estar asignado una vez a un npc
            $table->unique(['npc_id', 'catalog_item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('npc_catalog_items');
    }
};
