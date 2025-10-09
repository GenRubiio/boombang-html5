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
            // Add user_id - summaries are per bot-user conversation (bots move between rooms)
            $table->unsignedBigInteger('user_id')->after('bot_id')->comment('User ID');
            
            // Add unique constraint - one summary per bot-user pair
            $table->unique(['bot_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bot_summaries', function (Blueprint $table) {
            $table->dropUnique(['bot_id', 'user_id']);
            $table->dropColumn('user_id');
        });
    }
};
