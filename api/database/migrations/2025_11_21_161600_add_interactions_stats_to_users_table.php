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
            $table->integer('kisses_sent')->default(0)->after('coconuts_received');
            $table->integer('kisses_received')->default(0)->after('kisses_sent');
            $table->integer('drinks_sent')->default(0)->after('kisses_received');
            $table->integer('drinks_received')->default(0)->after('drinks_sent');
            $table->integer('roses_sent')->default(0)->after('drinks_received');
            $table->integer('roses_received')->default(0)->after('roses_sent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'kisses_sent',
                'kisses_received',
                'drinks_sent',
                'drinks_received',
                'roses_sent',
                'roses_received'
            ]);
        });
    }
};
