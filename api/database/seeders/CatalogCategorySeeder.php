<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CatalogCategorySeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        \DB::table('catalog_categories')->delete();

        \DB::table('catalog_categories')->insert(array (
            0 =>
            array (
                'id' => 1,
                'name' => 'Default',
                'image' => null,
                'description' => 'Default category for catalog items.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ),
        ));
        
        
    }
}