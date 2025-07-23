<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FirstVersionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('versions')->insert([
            'id' => 1,
            'tag' => 'v0.0.0',
            'major' => 0,
            'minor' => 0,
            'patch' => 0,
            'name' => 'Initialize project',
            'description' => 'Initialize project',
            'date' => Carbon::now(),
            'commit' => null,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
    }
}
