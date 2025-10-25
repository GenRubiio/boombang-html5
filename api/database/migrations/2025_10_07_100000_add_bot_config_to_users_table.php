<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add additional bot fields to users table (is_bot already exists)
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('bot_system_prompt')->nullable()->after('is_bot')->comment('Bot AI personality and instructions');
            $table->enum('bot_language_mode', ['auto', 'es', 'en', 'ru', 'ja', 'zh', 'ko'])->default('auto')->after('bot_system_prompt')->comment('Bot preferred language');
            $table->json('bot_settings')->nullable()->after('bot_language_mode')->comment('Bot config: daily_quota, cooldown_sec');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['bot_system_prompt', 'bot_language_mode', 'bot_settings']);
        });
    }
};
