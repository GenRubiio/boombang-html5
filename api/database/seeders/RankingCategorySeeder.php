<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class RankingCategorySeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        \DB::table('ranking_categories')->delete();

        \DB::table('ranking_categories')->insert(array (
            0 =>
            array (
                'id' => 1,
                'name' => 'Ring',
                'image' => null,
                'description' => 'Default category for ring rankings.',
                'duration' => 7,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ),
        ));
        
        
    }
}