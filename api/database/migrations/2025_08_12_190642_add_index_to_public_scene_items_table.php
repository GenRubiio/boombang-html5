<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
        ALTER TABLE `boombang_api`.`public_scene_items`
        ADD PRIMARY KEY (`public_scenes_id`, `scene_item_id`)
    ");
    }

    public function down(): void
    {
        DB::statement("
        ALTER TABLE `boombang_api`.`public_scene_items`
        DROP PRIMARY KEY
    ");
    }
};
