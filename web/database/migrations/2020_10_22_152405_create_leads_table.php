<?php

use Illuminate\Database\Migrations\Migration;
use App\Helpers\BlueprintHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateLeadsTable extends Migration
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

        $schema->create('leads', function ($table) {
            $table->increments('id');
            $table->integer('rgpd_id')->unsigned()->nullable();
            $table->text('request');
            $table->string('name', 255)->nullable();
            $table->string('surname', 255)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('telephone', 255)->nullable();
            $table->string('city', 255)->nullable();
            $table->text('message')->nullable();
            $table->string('form_name', 255);
            $table->text('url_origin');
            $table->boolean('accept_terms')->default(0);
            $table->boolean('accept_notifications')->default(0);
            $table->defaultActive();
            $table->defaultTimeStamps();
            $table->softDeletes();

            $table->foreign('rgpd_id')
                ->references('id')
                ->on('rgpds')
                ->onDelete('CASCADE');
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
        Schema::dropIfExists('leads');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
