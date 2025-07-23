<?php

use App\Helpers\BlueprintHelper;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateParametricTableValuesTable extends Migration
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

        $schema->create('parametric_table_values', function ($table) {
            $table->defaultIdString();
            $table->string('parametric_table_id');
            $table->string('name');
            $table->text('value');
            $table->text('description')->nullable();
            $table->boolean('resource')->default(true);
            $table->boolean('visible')->default(true);
            $table->defaultActive();
            $table->defaultOrder();
            $table->defaultTimestamps();
            $table->softDeletes();

            $table->foreign('parametric_table_id')
                ->references('id')
                ->on('parametric_tables')
                ->cascadeOnDelete();
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
        Schema::dropIfExists('parametric_table_values');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
