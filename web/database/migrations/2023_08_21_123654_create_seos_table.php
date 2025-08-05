<?php

use Illuminate\Database\Migrations\Migration;
use App\Helpers\BlueprintHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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

        $schema->create('seos', function ($table) {
            $table->id();
            $table->integer('seoable_id')->nullable();
            $table->string('seoable_type', 255)->nullable();
            $table->text('seo_title')->nullable();
            $table->text('url_canonical')->nullable();
            $table->text('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            $table->text('seo_breadcrumb')->nullable();
            $table->text('og_title')->nullable();
            $table->text('og_description')->nullable();
            $table->text('og_image')->nullable();
            $table->text('tw_title')->nullable();
            $table->text('tw_description')->nullable();
            $table->text('tw_image')->nullable();
            $table->integer('sitemap_priority')->default(100);
            $table->string('sitemap_frequency', 255)->default('never');
            $table->boolean('noindex_nofollow')->default(false);
            $table->boolean('sitemap_indexable')->default(true);
            $table->defaultTimeStamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        Schema::dropIfExists('seos');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
};
