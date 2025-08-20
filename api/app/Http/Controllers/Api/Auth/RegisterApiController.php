<?php

namespace App\Http\Controllers\Api\Auth;

use Exception;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Requests\RegisterApiRegisterRequest;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class RegisterApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function register(RegisterApiRegisterRequest $request): JsonResource
    {
        try {
            User::create([
                'name' => $request->username,
                'username' => $request->username,
                'description' => 'BoomMania 😍',
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'avatar' => $request->avatar_id,
            ]);
            $user = User::where('email', $request->email)->first();
            $tokenResult = $user->createToken('Personal Access Token');
            $user->load(
                'fichas',
                'chats',
                'colornames'
            );
            return $this->successResponse([
                'user' => (new UserResource($user))->toDTO(),
                'token' => $tokenResult->accessToken,
            ]);
        } catch (Exception $e) {
            Log::error('Registration error: ' . $e->getMessage(), [
                'request' => $request->all(),
            ]);
            return $this->handleException($e);
        }
    }
}
