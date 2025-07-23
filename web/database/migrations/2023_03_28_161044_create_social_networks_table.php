<?php

use Illuminate\Database\Migrations\Migration;
use App\Helpers\BlueprintHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $schema = DB::connection()->getSchemaBuilder();

        $schema->blueprintResolver(function ($table, $callback) {
            return new BlueprintHelper($table, $callback);
        });

        $schema->create('social_networks', function ($table) {
            $table->id();
            $table->text('name');
            $table->text('link');
            $table->string('icon')->nullable();
            $table->text('image')->nullable();
            $table->defaultOrder();
            $table->defaultActive();
            $table->defaultTimeStamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        Schema::dropIfExists('social_networks');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
};
