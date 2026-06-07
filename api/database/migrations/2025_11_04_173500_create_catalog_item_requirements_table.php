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
        Schema::create('catalog_item_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalog_item_id')->constrained('catalog_items')->onDelete('cascade');

            // Requisito: puede ser otro CatalogItem o créditos
            $table->foreignId('required_catalog_item_id')->nullable()->constrained('catalog_items')->onDelete('cascade');
            $table->integer('required_quantity')->default(1); // Cantidad del item requerido

            // Créditos requeridos
            $table->integer('required_gold_coins')->default(0);
            $table->integer('required_silver_coins')->default(0);

            $table->timestamps();

            // Índices para mejorar el rendimiento
            $table->index('catalog_item_id');
            $table->index('required_catalog_item_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalog_item_requirements');
    }
};
