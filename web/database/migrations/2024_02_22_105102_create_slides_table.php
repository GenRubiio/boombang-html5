<?php

use Illuminate\Database\Migrations\Migration;
use App\Helpers\BlueprintHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        $schema = DB::connection()->getSchemaBuilder();

        $schema->blueprintResolver(function ($table, $callback) {
            return new BlueprintHelper($table, $callback);
        });

        $schema->create('slides', function ($table) {
            $table->id();
            $table->string('slider', 255);
            $table->text('title')->nullable();
            $table->text('text')->nullable();
            $table->text('alt')->nullable();
            $table->text('link')->nullable();
            $table->boolean('target_blank')->default(false);
            $table->text('button_text')->nullable();
            $table->datetime('date_start')->nullable();
            $table->datetime('date_end')->nullable();
            $table->text('image_desktop')->nullable();
            $table->text('image_tablet')->nullable();
            $table->text('image_mobile')->nullable();
            $table->defaultOrder();
            $table->defaultActive();
            $table->defaultTimeStamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        Schema::dropIfExists('slides');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
};
