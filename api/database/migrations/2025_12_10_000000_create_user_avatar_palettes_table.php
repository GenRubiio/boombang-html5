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
        // Deliberately named distinct from the dead `avatar_colors` reference in
        // UserService.create() (proposal.md risk 8). `palette` is `longText`, never `json` —
        // project convention (public_scenes.assets_data, mails.description).
        Schema::create('user_avatar_palettes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('avatar_id');
            $table->longText('palette')->nullable();
            $table->string('manifest_version')->nullable();
            $table->timestamps();

            // PAL4: palette persistence is scoped per (user, avatar).
            $table->unique(['user_id', 'avatar_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_avatar_palettes');
    }
};
