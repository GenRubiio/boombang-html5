<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Enums\ColorChatEnum;
use App\Enums\ColorNameEnum;
use App\Enums\ColorFichaEnum;
use App\Enums\ColorShadowEnum;
use Illuminate\Console\Command;

class AddVipToAllCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:add-vip-to-all-command';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::all();
        foreach ($users as $user) {
            if (!$user->fichas()->where('ficha_color', ColorFichaEnum::VIP->key())->exists()) {
                $user->fichas()->create([
                    'ficha_color' => ColorFichaEnum::VIP->key(),
                ]);
            }
            if (!$user->chats()->where('chat_color', ColorChatEnum::VIP->key())->exists()) {
                $user->chats()->create([
                    'chat_color' => ColorChatEnum::VIP->key(),
                ]);
            }
            if (!$user->colornames()->where('name_color', ColorNameEnum::VIP->key())->exists()) {
                $user->colornames()->create([
                    'name_color' => ColorNameEnum::VIP->key(),
                ]);
            }
            if (!$user->shadows()->where('shadow_color', ColorShadowEnum::VIP->key())->exists()) {
                $user->shadows()->create([
                    'shadow_color' => ColorShadowEnum::VIP->key(),
                ]);
            }
        }
    }
}
