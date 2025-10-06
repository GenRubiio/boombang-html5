<?php

namespace App\Http\Controllers\Api\Auth;

use Exception;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class BotLoginApiController extends Controller
{
    use ResponseApiControllerTrait;

    /**
     * Authenticate a bot user using username and bot_token
     *
     * @param Request $request
     * @return JsonResource
     */
    public function login(Request $request): JsonResource
    {
        try {
            $request->validate([
                'username' => 'required|string'
            ]);

            $username = $request->input('username');
            // Note: bot_token validation happens in the game server via socket authentication
            // This endpoint only validates that the user is a valid bot and creates API token

            // Find the bot user
            $user = User::where('username', $username)
                       ->where('is_bot', 1)
                       ->where('active', 1)
                       ->first();

            if (!$user) {
                throw new Exception('Bot user not found or inactive', 401);
            }

            // For bots, we don't validate password or bot_token here
            // The bot_token is validated by the game server when the bot connects via socket
            
            // Delete existing tokens for this bot
            $user->tokens()->delete();
            
            // Create a new token for the bot
            $tokenResult = $user->createToken('Bot Access Token');

            return $this->successResponse([
                'user' => (new UserResource($user))->toDTO(),
                'token' => $tokenResult->accessToken,
            ]);

        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}