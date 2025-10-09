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
        Schema::create('bot_facts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->comment('User ID');
            $table->unsignedBigInteger('bot_id')->comment('Bot ID');
            $table->text('fact')->comment('Persistent fact about user');
            $table->tinyInteger('confidence')->default(100)->comment('Confidence level 0-100');
            $table->enum('source', ['extracted', 'manual'])->default('extracted');
            $table->timestamps();

            $table->index(['user_id', 'bot_id']);
            $table->index('confidence');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bot_facts');
    }
};
