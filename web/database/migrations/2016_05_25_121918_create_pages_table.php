<?php

use App\Helpers\BlueprintHelper;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreatePagesTable extends Migration
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

        $schema->create('pages', function ($table) {
            $table->increments('id');
            $table->string('template');
            $table->string('name');
            $table->boolean('auth_required')->default(0);
            $table->boolean('exists_blade')->default(0);
            $table->text('title');
            $table->longText('content')->nullable();
            $table->longText('content_no_translatable')->nullable();
            $table->longText('extras')->nullable();
            $table->longText('extras_no_translatable')->nullable();
            $table->string('main_image')->nullable();
            $table->string('og_image')->nullable();
            $table->string('tw_image')->nullable();
            if (DB::getDriverName() === 'pgsql') {
                $table->json('slug');
            } else {
                $table->text('slug');
            }

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
        Schema::dropIfExists('pages');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
