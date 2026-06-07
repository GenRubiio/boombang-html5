<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class SocketNotificationService
{
    /**
     * Notify user about credit update via socket
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public static function notifyCreditsUpdate(User $user)
    {
        try {
            // URL del servidor socket - usar puerto 3000 por defecto
            $socketServerUrl = config('app.socket_server_url', 'http://localhost:3000');
            
            // Enviar notificación al servidor socket
            $response = Http::timeout(5)->post("{$socketServerUrl}/api/notify-credits-update", [
                'user_id' => $user->id,
                'gold' => $user->gold_coins,
                'silver' => $user->silver_coins,
            ]);

            if (!$response->successful()) {
                Log::warning('Socket notification failed', [
                    'user_id' => $user->id,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error sending socket notification: ' . $e->getMessage(), [
                'user_id' => $user->id,
            ]);
        }
    }

    /**
     * Notify user about inventory update via socket
     *
     * @param  \App\Models\User  $user
     * @param  array  $items
     * @return void
     */
    public static function notifyInventoryUpdate(User $user, array $items = [])
    {
        try {
            $socketServerUrl = config('app.socket_server_url', 'http://localhost:3001');
            
            $response = Http::timeout(5)->post("{$socketServerUrl}/api/notify-inventory-update", [
                'user_id' => $user->id,
                'items' => $items,
            ]);

            // Éxito silencioso para inventario
        } catch (\Exception $e) {
            Log::error('Error sending inventory socket notification: ' . $e->getMessage(), [
                'user_id' => $user->id,
            ]);
        }
    }
}