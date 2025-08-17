<?php

namespace App\Observers;

use App\Models\User;
use App\Enums\ColorChatEnum;
use App\Enums\ColorNameEnum;
use App\Enums\ColorFichaEnum;
use App\Enums\ColorShadowEnum;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        $user->fichas()->create([
            'ficha_color' => ColorFichaEnum::USER->key(),
        ]);
        $user->fichas()->create([
            'ficha_color' => ColorFichaEnum::BETA->key(),
        ]);

        $user->chats()->create([
            'chat_color' => ColorChatEnum::USER->key(),
        ]);
        $user->colornames()->create([
            'name_color' => ColorNameEnum::USER->key(),
        ]);
        $user->shadows()->create([
            'shadow_color' => ColorShadowEnum::USER->key(),
        ]);
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        //
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
