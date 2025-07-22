<?php

namespace App\Http\Controllers\Internal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class BotController extends Controller
{
    /**
     * Generate a short-lived token and send it to the game server for pre-authorization.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateToken(Request $request)
    {
        $token = Str::random(40);
        $gameServerUrl = config('app.emulator_docker_url');

        // Pre-authorize the token by sending it to the game server directly.
        // This request happens server-to-server within the Docker network.
        try {
            $response = Http::post($gameServerUrl . '/internal/add-bot-token', [
                'token' => $token
            ]);

            if ($response->failed()) {
                // If the game server is down or rejects the token, we can't let the bot connect.
                return response()->json(['error' => 'Failed to pre-authorize bot token with the game server.'], 500);
            }
        } catch (\Exception $e) {
            // Catch connection exceptions
            return response()->json(['error' => 'Could not connect to the game server.'], 503);
        }

        // If the token was successfully sent, return it to the bot script.
        return response()->json([
            'token' => $token,
            'expires_in' => 30 // The bot script knows it has 30 seconds to use it.
        ]);
    }
}
