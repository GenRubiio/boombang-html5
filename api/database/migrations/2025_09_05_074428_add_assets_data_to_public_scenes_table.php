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
        Schema::table('public_scenes', function (Blueprint $table) {
            $table->longText('assets_data')->nullable()->after('map');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('public_scenes', function (Blueprint $table) {
            $table->dropColumn('assets_data');
        });
    }
};
