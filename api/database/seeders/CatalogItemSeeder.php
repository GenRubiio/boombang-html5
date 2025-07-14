<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CatalogItemSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {


        \DB::table('catalog_items')->delete();

        \DB::table('catalog_items')->insert([
            [
                'id' => 1,
                'category_id' => 1,
                'name' => '500 Oro',
                'sprite_name' => '500oroCatalog',
                'description' => '500 monedas de oro para usar en el catálogo.',
                'price' => 500,
                'price_type' => 'golden_coins',
                'discount' => 0,
                'map_size' => '[[0, 0]]',
                'is_purchasable' => true,
                'is_active' => true,
            ],
            [
                'id' => 2,
                'category_id' => 1,
                'name' => 'Pozo',
                'sprite_name' => 'well',
                'description' => 'Un pozo para tu isla.',
                'price' => 1000,
                'price_type' => 'golden_coins',
                'discount' => 0,
                'map_size' => '[[0, 1], [1, 2], [2, 1], [1, 0], [1, 1]]',
                'is_purchasable' => true,
                'is_active' => true,
            ],
            [
                'id' => 3,
                'category_id' => 1,
                'name' => 'Bola de Madera',
                'sprite_name' => 'wood_ball',
                'description' => 'Una bola de madera para jugar en tu isla.',
                'price' => 2000,
                'price_type' => 'golden_coins',
                'discount' => 0,
                'map_size' => '[[0, 1], [1, 2], [2, 1], [1, 0], [1, 1]]',
                'is_purchasable' => true,
                'is_active' => true,
            ],
        ]);
    }
}
