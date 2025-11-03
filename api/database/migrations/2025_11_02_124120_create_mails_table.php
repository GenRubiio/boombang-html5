<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mails', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->longText('description');
            $table->boolean('is_active')->default(true);
            $table->boolean('send_to_all')->default(false);
            $table->boolean('is_persistent')->default(false)->comment('Si es true, los nuevos usuarios pueden ver correos enviados antes de su registro');
            $table->integer('gold_coins')->nullable()->default(0);
            $table->integer('silver_coins')->nullable()->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mails');
    }
};
