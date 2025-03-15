<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginApiLoginRequest;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class LoginApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function login(LoginApiLoginRequest $request): JsonResource
    {
        try {
            $credentials = $request->only('username', 'password');
            if (Auth::attempt($credentials)) {
                $tokenResult = auth()->user()->createToken('Personal Access Token');

                return $this->successResponse([
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
