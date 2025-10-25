<?php

namespace App\Observers;

use App\Models\ApiKey;

class ApiKeyObserver
{
    public function saving(ApiKey $apiKey): void
    {
        $user = backpack_user() ?? auth()->user();
        if ($user && empty($apiKey->user_id)) {
            $apiKey->user_id = $user->id;
        }

        // Cifrar solo si el campo 'key' cambió
        if ($apiKey->isDirty('key') && !empty($apiKey->key)) {

            // Evitar doble cifrado: si ya viene cifrada, no tocar
            $value = $apiKey->key;
            $alreadyEncrypted = false;
            try {
                // Si puede desencriptarse sin error, asumimos que ya estaba cifrada
                decrypt($value);
                $alreadyEncrypted = true;
            } catch (\Throwable $e) {
                $alreadyEncrypted = false;
            }

            if (!$alreadyEncrypted) {
                $apiKey->key = encrypt($value);
            }
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
