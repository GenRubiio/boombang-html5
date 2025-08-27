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
            $table->boolean('show_in_inventory')->default(true);
            $table->dateTime('expires_at')->nullable()->after('show_in_inventory');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_catalog_items', function (Blueprint $table) {
            $table->dropColumn('show_in_inventory');
            $table->dropColumn('expires_at');
        });
    }
};
