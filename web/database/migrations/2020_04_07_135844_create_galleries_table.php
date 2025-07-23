<?php

use Illuminate\Database\Migrations\Migration;
use App\Helpers\BlueprintHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateGalleriesTable extends Migration
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

        $schema->create('galleries', function ($table) {
            $table->increments('id');
            $table->integer('galleryable_id')->nullable();
            $table->string('galleryable_type', 255)->nullable();
            $table->enum('type', ['header', 'content', 'extra'])->default('content');
            $table->string('name', 255)->nullable();
            $table->text('alt')->nullable();
            $table->text('title')->nullable();
            $table->string('image', 255)->nullable();
            $table->text('video', 255)->nullable();
            $table->string('file', 255)->nullable();
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
        Schema::dropIfExists('galleries');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
