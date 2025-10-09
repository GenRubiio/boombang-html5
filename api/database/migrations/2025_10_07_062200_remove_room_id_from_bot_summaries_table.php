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
        Schema::table('bot_summaries', function (Blueprint $table) {
            // Drop unique index first
            $table->dropUnique(['room_id', 'bot_id']);
            // Drop room_id column - bots move between rooms, conversations are per bot-user
            $table->dropColumn('room_id');
            // Add unique constraint on bot_id and user_id (implied from context)
            // Note: bot_summaries should track bot-user conversations, not room-specific
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bot_summaries', function (Blueprint $table) {
            $table->unsignedBigInteger('room_id')->after('id')->comment('Room/Scene ID');
            $table->unique(['room_id', 'bot_id']);
        });
    }
};
