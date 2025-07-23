<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateBlogArticleTagTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('blog_article_tag', function (Blueprint $table) {
            $table->integer('blog_article_id')->unsigned()->nullable();
            $table->integer('blog_tag_id')->unsigned()->nullable();

            $table->foreign('blog_article_id')
                ->references('id')
                ->on('blog_articles')
                ->onDelete('set null');

            $table->foreign('blog_tag_id')
                ->references('id')
                ->on('blog_tags')
                ->onDelete('set null');
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
        Schema::dropIfExists('blog_article_tag');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
