<?php

use App\Helpers\BlueprintHelper;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateParametricTablesTable extends Migration
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

        $schema->create('parametric_tables', function ($table) {
            $table->defaultIdString();
            $table->string('table_name')->unique();
            $table->text('table_description')->nullable();
            $table->string('name');
            $table->boolean('resource')->default(true);
            $table->defaultTimestamps();
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
        Schema::dropIfExists('parametric_tables');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
