<?php

use Illuminate\Database\Migrations\Migration;
use App\Helpers\BlueprintHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateMenuItemsTable extends Migration
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

        $schema->create('menu_items', function ($table) {
            $table->increments('id');
            $table->text('name', 100);
            $table->string('type', 20)->nullable();
            $table->text('link', 255)->nullable();
            $table->integer('page_id')->unsigned()->nullable();
            $table->boolean('menu_top')->default(0);
            $table->integer('menu_top_order')->nullable();
            $table->boolean('menu_footer')->default(0);
            $table->integer('menu_footer_order')->nullable();
            $table->boolean('menu_legal')->default(0);
            $table->integer('menu_legal_order')->nullable();
            $table->defaultOrder();
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
        Schema::dropIfExists('menu_items');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
