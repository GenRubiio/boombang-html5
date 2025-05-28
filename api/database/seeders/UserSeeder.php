<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $testUser = [
            [
                'name' => 'Admin',
                'email' => 'gen@test.com',
                'username' => 'Gen',
                'password' => Hash::make('test'),
            ]
        ];
        
        foreach ($testUser as $user) {
            $userId = DB::table('users')->insertGetId([
                'name' => $user['name'],
                'email' => $user['email'],
                'username' => $user['username'],
                'email_verified_at' => Carbon::now(),
                'password' => $user['password'],
                'remember_token' => Str::random(10),
                'active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);

            if (!$userId) {
                $this->command->info("Insert user failed.");
                return;
            }

            $rolId = DB::table('roles')->where('name', 'User')->first()->id;
            if (!$rolId) {
                $this->command->info("Get role user failed.");
                return;
            }

            $relationUserRole = DB::table('model_has_roles')->insert([
                'role_id' => $rolId,
                'model_type' => "App\Models\User",
                'model_id' => $userId
            ]);
            if (!$relationUserRole) {
                $this->command->info("Insert relation user-role failed.");
                return;
            }
        }

        $this->command->info('UserSeeder: Inserted user succesfully.');
    }
}
