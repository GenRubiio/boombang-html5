<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('surname')->nullable()->after('name');
            $table->boolean('active')->default(true)->after('password');
            $table->integer('created_user')->nullable()->after('remember_token');
            $table->integer('updated_user')->nullable()->after('created_at');
            $table->integer('deleted_user')->nullable()->after('updated_at');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('surname');
            $table->dropColumn('active');
            $table->dropColumn('created_user');
            $table->dropColumn('updated_user');
            $table->dropColumn('deleted_user');
            $table->dropColumn('deleted_at');
        });
    }
};
