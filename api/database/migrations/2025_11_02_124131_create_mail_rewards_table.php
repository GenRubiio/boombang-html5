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
        Schema::create('mail_rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mail_id')->constrained('mails')->onDelete('cascade');
            $table->foreignId('catalog_item_id')->constrained('catalog_items')->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mail_rewards');
    }
};
