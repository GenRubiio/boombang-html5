<?php

use App\Enums\CookieCategoriesEnum;
use App\Helpers\BlueprintHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

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

        $schema->create('cookies', function ($table) {
            $table->id();
            $table->string('category')->default(CookieCategoriesEnum::ESSENTIALS->key());
            $table->text('name');
            $table->text('description');
            $table->integer('duration')->default(60);
            $table->defaultOrder();
            $table->defaultActive();
            $table->defaultTimeStamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        Schema::dropIfExists('cookies');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
};
