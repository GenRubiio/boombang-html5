<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $userId = DB::table('users')->insertGetId([
            'name' => 'Admin',
            'email' => 'hello@basetis.com',
            'username' => 'God',
            'email_verified_at' => Carbon::now(),
            'password' => '$2y$10$vDDLdNEO2lLvim0VKcoH3uyjPMhfd4E6dOou1bWzeaQeYsvR4yZEm',
            'remember_token' => Str::random(10),
            'active' => true,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        if (!$userId) {
            $this->command->info("Insert user admin failed.");
            return;
        }

        $rolId = DB::table('roles')->where('name', 'Superadmin')->first()->id;
        if (!$rolId) {
            $this->command->info("Get role superadmin failed.");
            return;
        }

        $relationUserRole = DB::table('model_has_roles')->insert([
            'role_id' => $rolId,
            'model_type' => "App\Models\User", //App\Models\User::class,
            'model_id' => $userId
        ]);
        if (!$relationUserRole) {
            $this->command->info("Insert relation user-role failed.");
            return;
        }

        $this->command->info('AdminSeeder: Inserted user superadmin succesfully.');
    }
}
