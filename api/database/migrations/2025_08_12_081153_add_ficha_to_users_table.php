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
        Schema::table('users', function (Blueprint $table) {
            $table->string('ficha_color')->default('user')->after('description')->comment('User ficha, default is "user" ficha is avatar frame');
            $table->string('shadow_color')->default('user')->after('ficha_color');
            $table->string('chat_color')->default('user')->after('shadow_color');
            $table->string('name_color')->default('user')->after('chat_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['ficha_color', 'shadow_color', 'chat_color', 'name_color']);
        });
    }
};
