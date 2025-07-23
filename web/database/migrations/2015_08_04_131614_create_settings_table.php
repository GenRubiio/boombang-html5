<?php

use Illuminate\Database\Migrations\Migration;
use App\Helpers\BlueprintHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $schema = DB::connection()->getSchemaBuilder();

        $schema->blueprintResolver(function ($table, $callback) {
            return new BlueprintHelper($table, $callback);
        });

        $schema->create(config('backpack.settings.table_name'), function ($table) {
            $table->increments('id');
            $table->string('key')->unique();
            $table->enum(
                'type',
                ['text', 'ckeditor', 'radio', 'image', 'datetime_picker', 'color_picker']
            )->default('text');
            $table->string('name');
            $table->string('description')->nullable();
            $table->binary('value')->nullable();
            $table->text('field')->nullable();

            $table->defaultActive();
            $table->defaultTimeStamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        Schema::dropIfExists(config('backpack.settings.table_name'));
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
