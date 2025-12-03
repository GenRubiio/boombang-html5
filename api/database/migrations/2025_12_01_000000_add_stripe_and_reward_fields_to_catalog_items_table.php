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
        Schema::table('catalog_items', function (Blueprint $table) {
            // Campos para pagos con Stripe
            $table->decimal('stripe_price_usd', 8, 2)->nullable()->after('discount');
            
            // Campos para configurar las recompensas
            $table->enum('reward_type', ['item', 'golden_coins', 'silver_coins', 'mixed'])
                  ->default('item')
                  ->after('stripe_price_usd');
            $table->integer('reward_golden_coins')->default(0)->after('reward_type');
            $table->integer('reward_silver_coins')->default(0)->after('reward_golden_coins');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('catalog_items', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_price_usd',
                'reward_type',
                'reward_golden_coins',
                'reward_silver_coins'
            ]);
        });
    }
};