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
        Schema::dropIfExists('user_fichas');
        Schema::dropIfExists('user_chats');
        Schema::dropIfExists('user_colornames');
        Schema::dropIfExists('user_shadows');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('user_fichas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('ficha_color');
            $table->timestamps();
        });

        Schema::create('user_chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('chat_color');
            $table->timestamps();
        });

        Schema::create('user_colornames', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name_color');
            $table->timestamps();
        });

        Schema::create('user_shadows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('shadow_color');
            $table->timestamps();
        });
    }
};
