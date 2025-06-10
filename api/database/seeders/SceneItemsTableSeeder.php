<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class SceneItemsTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        \DB::table('scene_items')->delete();
        
        \DB::table('scene_items')->insert(array (
            0 => 
            array (
                'id' => 1,
                'name' => 'Cofre oro',
                'file_name' => 'chest_gold',
                'active' => 1,
                'created_at' => NULL,
                'updated_at' => NULL,
            ),
        ));
        
        
    }
}