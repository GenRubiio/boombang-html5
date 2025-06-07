<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PublicSceneItemsTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        \DB::table('public_scene_items')->delete();
        
        \DB::table('public_scene_items')->insert(array (
            0 => 
            array (
                'public_scenes_id' => 1,
                'scene_item_id' => 1,
                'activate_time' => 10,
                'min_users' => 2,
                'desactivate_time' => 15,
            ),
        ));
        
        
    }
}