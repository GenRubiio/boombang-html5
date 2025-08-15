<?php

namespace App\Http\Controllers\Api\Auth;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\LoginApiLoginRequest;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use App\Http\Controllers\Api\Auth\Interfaces\LoginApiControllerInterface;

class LoginApiController extends Controller implements LoginApiControllerInterface
{
    use ResponseApiControllerTrait;

    public function login(LoginApiLoginRequest $request): JsonResource
    {
        try {
            $credentials = $request->only('username', 'password');
            if (Auth::attempt($credentials)) {
                $user = Auth::user();
                $user->tokens()->delete();
                $tokenResult = $user->createToken('Personal Access Token');
                $user->load('fichas'); // Load fichas relationship
                return $this->successResponse([
                    'user' => (new UserResource($user))->toDTO(),
                    'token' => $tokenResult->accessToken,
                ]);
            } else {
                throw new Exception('Unauthorized', 401);
            }
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
