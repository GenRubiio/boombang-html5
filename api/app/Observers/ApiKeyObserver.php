<?php

namespace App\Observers;

use App\Models\ApiKey;

class ApiKeyObserver
{
    public function creating(ApiKey $apiKey): void
    {
        $user = backpack_user() ?? auth()->user();
        if ($user && empty($apiKey->user_id)) {
            $apiKey->user_id = $user->id;
        }
        // Si aún no está cifrada (por ejemplo, cuando se crea)
        if (!empty($apiKey->key)) {
            $apiKey->key = encrypt($apiKey->key);
        }
    }
    /**
     * Handle the ApiKey "created" event.
     */
    public function created(ApiKey $apiKey): void
    {
        //
    }

    /**
     * Handle the ApiKey "updated" event.
     */
    public function updated(ApiKey $apiKey): void
    {
        //
    }

    /**
     * Handle the ApiKey "deleted" event.
     */
    public function deleted(ApiKey $apiKey): void
    {
        //
    }

    /**
     * Handle the ApiKey "restored" event.
     */
    public function restored(ApiKey $apiKey): void
    {
        //
    }

    /**
     * Handle the ApiKey "force deleted" event.
     */
    public function forceDeleted(ApiKey $apiKey): void
    {
        //
    }
}
