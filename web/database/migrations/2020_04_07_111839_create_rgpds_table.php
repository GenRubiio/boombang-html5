<?php

use Illuminate\Database\Migrations\Migration;
use App\Helpers\BlueprintHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateRgpdsTable extends Migration
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

        $schema->create('rgpds', function ($table) {
            $table->increments('id');
            $table->string('name', 255)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('phone', 255)->nullable();
            $table->string('ip_consent', 255)->nullable();
            $table->boolean('consent')->default(0);
            $table->timestamp('datetime_consent')->nullable();
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
        Schema::dropIfExists('rgpds');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
