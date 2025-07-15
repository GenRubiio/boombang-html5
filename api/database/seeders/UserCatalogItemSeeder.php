<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class UserCatalogItemSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {


        \DB::table('user_catalog_items')->delete();

        \DB::table('user_catalog_items')->insert([
            [
                'id' => 1,
                'user_id' => 2,
                'catalog_item_id' => 1,
                'private_scene_id' => null,
                'occupied_tiles' => '[]',
            ],
            [
                'id' => 2,
                'user_id' => 2,
                'catalog_item_id' => 2,
                'private_scene_id' => 1,
                'occupied_tiles' => '[[11, 10], [12, 11], [11, 12], [10, 11], [11, 11]]',
            ],
            [
                'id' => 3,
                'user_id' => 2,
                'catalog_item_id' => 2,
                'private_scene_id' => 1,
                'occupied_tiles' => '[[12, 18], [13, 17], [14, 18], [13, 19], [13, 18]]',
            ],
            [
                'id' => 4,
                'user_id' => 2,
                'catalog_item_id' => 1,
                'private_scene_id' => null,
                'occupied_tiles' => '[]',
            ],
            [
                'id' => 5,
                'user_id' => 2,
                'catalog_item_id' => 2,
                'private_scene_id' => null,
                'occupied_tiles' => '[]',
            ],
            [
                'id' => 6,
                'user_id' => 2,
                'catalog_item_id' => 3,
                'private_scene_id' => 1,
                'occupied_tiles' => '[[18, 14], [19, 13], [20, 14], [19, 15], [19, 14]]',
            ],
        ]);
    }
}
