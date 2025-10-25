<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("
            CREATE OR REPLACE VIEW v_ranking_summary AS
            SELECT
                user_id,
                ranking_category_id,
                YEAR(created_at) as year,
                WEEK(created_at, 1) as week,
                SUM(points) as total_points
            FROM
                rankings
            GROUP BY
                user_id,
                ranking_category_id,
                year,
                week
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS v_ranking_summary");
    }
};
