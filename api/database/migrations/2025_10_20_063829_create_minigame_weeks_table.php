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
        Schema::create('minigame_weeks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('minigame_id')->constrained('minigames')->onDelete('cascade');
            $table->integer('week_number');
            $table->integer('year');
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('minigame_weeks');
    }
};
