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
        Schema::dropIfExists('v_ranking_summaries');
        Schema::dropIfExists('ranking_categories');
        Schema::dropIfExists('rankings');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        
    }
};
