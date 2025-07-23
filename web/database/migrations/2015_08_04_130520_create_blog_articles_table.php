<?php

use Illuminate\Database\Migrations\Migration;
use App\Helpers\BlueprintHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateBlogArticlesTable extends Migration
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

        $schema->create('blog_articles', function ($table) {
            $table->increments('id');
            $table->integer('category_id')->unsigned();
            $table->text('title');
            $table->text('extract'); // For description
            $table->text('content');
            $table->text('slug');
            $table->string('image')->nullable();
            $table->enum('status', ['Borrador', 'Publicada'])->default('Borrador');
            $table->datetime('date');
            $table->defaultFeatured();
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
        Schema::dropIfExists('blog_articles');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
