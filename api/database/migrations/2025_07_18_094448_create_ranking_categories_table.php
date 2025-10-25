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
        Schema::create('ranking_categories', function (Blueprint $table) {
            $table->id();
            $table->text('name')->comment('Name of the ranking category');
            $table->text('description')->nullable()->comment('Description of the ranking category');
            $table->text('image')->nullable()->comment('Icon representing the ranking category');
            $table->integer('duration')->default(1)->comment('Duration in weeks for the ranking category');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ranking_categories');
    }
};
