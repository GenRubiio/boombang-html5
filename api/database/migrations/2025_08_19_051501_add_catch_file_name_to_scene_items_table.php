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
        Schema::table('scene_items', function (Blueprint $table) {
            $table->string('catch_file_name')->nullable()->after('file_name');
            $table->string('text')->nullable()->after('catch_file_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scene_items', function (Blueprint $table) {
            $table->dropColumn('catch_file_name');
            $table->dropColumn('text');
        });
    }
};
