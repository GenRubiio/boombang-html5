<?php

namespace App\Http\Controllers\Api\Auth;

use Exception;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class GetBotByUsernameApiController extends Controller
{
    use ResponseApiControllerTrait;

    /**
     * Get bot user by username
     *
     * @param Request $request
     * @return JsonResource
     */
    public function getBotByUsername(Request $request): JsonResource
    {
        try {
            $request->validate([
                'username' => 'required|string'
            ]);

            $username = $request->input('username');

            // Find the bot user
            $user = User::where('username', $username)
                       ->where('is_bot', 1)
                       ->where('active', 1)
                       ->first();

            if (!$user) {
                throw new Exception('Bot user not found or inactive', 404);
            }

            return $this->successResponse([
                'user' => (new UserResource($user))->toDTO(),
            ]);

        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}