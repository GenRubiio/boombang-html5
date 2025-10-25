<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('v_ranking_summaries');
        Schema::dropIfExists('rankings');
        Schema::dropIfExists('ranking_categories');
        DB::statement('DROP VIEW IF EXISTS v_ranking_summaries');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {}
};
