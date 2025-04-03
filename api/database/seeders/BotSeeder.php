<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bots = [];

        for ($i = 1; $i <= 6; $i++) {
            $bots[] = [
                'name' => 'Bot' . $i,
                'email' => 'bot' . $i . '@test.com',
                'username' => 'Bot' . $i,
                'password' => Hash::make('test'),
                'avatar' => collect([5, 12])->random(),
            ];
        }
        
        foreach ($bots as $bot) {
            $userId = DB::table('users')->insertGetId([
                'name' => $bot['name'],
                'email' => $bot['email'],
                'username' => $bot['username'],
                'email_verified_at' => Carbon::now(),
                'password' => $bot['password'],
                'remember_token' => Str::random(10),
                'is_bot' => true,
                'active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);

            if (!$userId) {
                $this->command->info("Insert bot failed.");
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

        $this->command->info('BotSeeder: Inserted user succesfully.');
    }
}
