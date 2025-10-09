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
        Schema::create('bot_summaries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('room_id')->comment('Room/Scene ID');
            $table->unsignedBigInteger('bot_id')->comment('Bot ID');
            $table->mediumText('summary')->comment('Compact conversation summary');
            $table->unsignedBigInteger('last_message_id')->nullable()->comment('Last processed message ID');
            $table->timestamps();

            $table->unique(['room_id', 'bot_id']);
            $table->index('last_message_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bot_summaries');
    }
};
