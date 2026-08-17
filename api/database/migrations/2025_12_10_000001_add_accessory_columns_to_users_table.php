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
        // Cheapest point to add all three at once — Slice 9 (hat) and Slice 10 (pet) reuse
        // this same migration rather than adding two more (design.md §6). All nullable:
        // equipping nothing is the default, zero-data-loss on rollback (proposal.md Rollback).
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_hat')->nullable()->after('avatar');
            $table->string('avatar_pet')->nullable()->after('avatar_hat');
            $table->string('avatar_aura')->nullable()->after('avatar_pet');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar_hat', 'avatar_pet', 'avatar_aura']);
        });
    }
};
