<?php

use Illuminate\Database\Migrations\Migration;
use App\Helpers\BlueprintHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $schema = DB::connection()->getSchemaBuilder();

        $schema->blueprintResolver(function ($table, $callback) {
            return new BlueprintHelper($table, $callback);
        });

        $schema->create('versions', function ($table) {
            $table->id();
            $table->string('tag', 255)->comment('v{major}.{minor}.{patch}');
            $table->integer('major');
            $table->integer('minor');
            $table->integer('patch');
            $table->string('name', 255);
            $table->text('description');
            $table->datetime('date');
            $table->string('commit', 255)->nullable();
            $table->defaultTimeStamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        Schema::dropIfExists('versions');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
};
