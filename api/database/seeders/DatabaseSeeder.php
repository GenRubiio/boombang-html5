<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            AdminSeeder::class,
            UserSeeder::class,
            BotSeeder::class,
            //PublicSceneSeeder::class,
        ]);
        $this->call(PublicScenesTableSeeder::class);
        $this->call(MinigameScenesTableSeeder::class);
        $this->call(SceneItemsTableSeeder::class);
        $this->call(PublicSceneItemsTableSeeder::class);

        Artisan::call('passport:client --personal');
    }
}
