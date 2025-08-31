<?php

use App\Enums\PhaserRenderingTypeEnum;
use Illuminate\Support\Facades\Schema;
use App\Enums\PhaserPowerPreferenceEnum;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dateTime('last_update_username_at')->nullable()->after('coconuts_received');
            $table->string('phaser_rendering_type')->default(PhaserRenderingTypeEnum::AUTO->key())->after('last_update_username_at');
            $table->boolean('phaser_antialias')->default(false)->after('phaser_rendering_type');
            $table->boolean('phaser_antialias_gl')->default(false)->after('phaser_antialias');
            $table->boolean('phaser_pixel_art')->default(true)->after('phaser_antialias_gl');
            $table->boolean('phaser_round_pixels')->default(true)->after('phaser_pixel_art');
            $table->string('phaser_power_preference')->default(PhaserPowerPreferenceEnum::DEFAULT->key())->after('phaser_round_pixels');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('last_update_username_at');
            $table->dropColumn('phaser_rendering_type');
            $table->dropColumn('phaser_antialias');
            $table->dropColumn('phaser_antialias_gl');
            $table->dropColumn('phaser_pixel_art');
            $table->dropColumn('phaser_round_pixels');
            $table->dropColumn('phaser_power_preference');
        });
    }
};
