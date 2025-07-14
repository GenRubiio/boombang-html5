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
        Schema::create('catalog_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')
                ->nullable()
                ->constrained('catalog_categories')
                ->onDelete('set null');
            $table->string('name')->unique();
            $table->string('sprite_name')->unique();
            $table->text('image')->nullable();
            $table->text('description')->nullable();
            $table->integer('price')->default(1000);
            $table->string('price_type')->default('golden_coins'); // 'coins' or 'gems'
            $table->integer('discount')->default(0);
            $table->text('map_size')->nullable();

            $table->boolean('is_purchasable')->default(false);
            $table->boolean('is_active')->default(false);

            $table->integer('parent_id')->unsigned()->nullable();
            $table->integer('lft')->unsigned()->nullable();
            $table->integer('rgt')->unsigned()->nullable();
            $table->integer('depth')->unsigned()->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalog_items');
    }
};
