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
        $superAdminUserId = DB::table('users')->insertGetId([
            'name' => 'Basetis',
            'surname' => 'Admin',
            'email' => 'hello@basetis.com',
            'email_verified_at' => Carbon::now(),
            'password' => '$2y$10$vDDLdNEO2lLvim0VKcoH3uyjPMhfd4E6dOou1bWzeaQeYsvR4yZEm',
            'remember_token' => Str::random(10),
            'active' => 1,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);
        if (!$superAdminUserId) {
            $this->command->info("Insert user admin failed.");
            return;
        }

        $superAdminRoleId = DB::table('roles')->where('name', 'Superadmin')->first()->id;
        if (!$superAdminRoleId) {
            $this->command->info("Get role superadmin failed.");
            return;
        }

        $relationAdminRole = DB::table('model_has_roles')->insert([
            'role_id' => $superAdminRoleId,
            'model_type' => "App\Models\User", //App\Models\User::class,
            'model_id' => $superAdminUserId
        ]);
        if (!$relationAdminRole) {
            $this->command->info("Insert relation user-role failed.");
            return;
        }

        $this->command->info('AdminSeeder: Inserted user superadmin succesfully.');
    }
}
