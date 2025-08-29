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
        Schema::table('user_catalog_items', function (Blueprint $table) {
            $table->boolean('rotated')->default(false);
            $table->boolean('resize_enabled')->default(false);
            $table->boolean('resized')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_catalog_items', function (Blueprint $table) {
            $table->dropColumn('rotated');
            $table->dropColumn('resize_enabled');
            $table->dropColumn('resized');
        });
    }
};
