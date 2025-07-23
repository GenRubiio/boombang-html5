<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('languages')->insert([
            'name' => 'English',
            'flag' => '',
            'abbr' => 'en',
            'script' => 'Latn',
            'native' => 'English',
            'active' => '1',
            'default' => '0',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        DB::table('languages')->insert([
            'name' => 'Spanish',
            'flag' => '',
            'abbr' => 'es',
            'script' => 'Latn',
            'native' => 'Español',
            'active' => '1',
            'default' => '1',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->command->info('Language seeding successful.');
    }
}
