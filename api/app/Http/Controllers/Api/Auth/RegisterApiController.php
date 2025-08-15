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
            $user = User::create([
                'name' => $request->username,
                'username' => $request->username,
                'description' => 'BoomMania 😍',
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'avatar' => $request->avatar_id,
            ]);
            $tokenResult = $user->createToken('Personal Access Token');
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
