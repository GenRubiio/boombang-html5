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
        Schema::create('bot_messages', function (Blueprint $table) {
            $table->id();
            $table->enum('sender_type', ['user', 'bot'])->comment('Sender type');
            $table->unsignedBigInteger('sender_id')->comment('User ID (bot or normal user)');
            $table->text('content')->comment('Message text');
            $table->string('language', 5)->nullable()->comment('Detected language');
            $table->json('metadata')->nullable()->comment('Metadata: provider, tokens, width_px, etc.');
            $table->timestamps();

            $table->index(['sender_type', 'sender_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bot_messages');
    }
};
