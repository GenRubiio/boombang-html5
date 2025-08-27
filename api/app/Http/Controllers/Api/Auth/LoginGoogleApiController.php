<?php

namespace App\Http\Controllers\Api\Auth;

use Exception;
use App\Models\User;
use App\Enums\AvatarEnum;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class LoginGoogleApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function login(Request $request): JsonResource
    {
        try {
            $validated = $request->validate([
                'auth_token' => 'required',
            ]);
            $token = $validated['auth_token'];

            if (!app()->environment('local')) {
                $googleUser = Socialite::driver('google')->userFromToken($token);
            } else {
                $googleUser = Socialite::driver('google')->setHttpClient(new \GuzzleHttp\Client([
                    'verify' => false,
                ]))->userFromToken($token);
            }


            $user = User::where('email', $googleUser->email)->first();

            if (!$user) {
                $username = $this->generateUniqueUsername();
                $avatarOptions = [AvatarEnum::GATA->key(), AvatarEnum::RASTA->key()];
                User::create([
                    'name' => $username,
                    'username' => $username,
                    'description' => 'BoomMania 😍',
                    'email' => $googleUser->email,
                    'password' => Hash::make(Str::random(16)),
                    'avatar' => $avatarOptions[array_rand($avatarOptions)],
                ]);
                $user = User::where('email', $googleUser->email)->first();
            }

            $user->tokens()->delete();
            $tokenResult = $user->createToken('Personal Access Token');
            
            return $this->successResponse([
                'user' => (new UserResource($user))->toDTO(),
                'token' => $tokenResult->accessToken,
            ]);
        } catch (Exception $e) {
            Log::error('Google login error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            return $this->handleException($e);
        }
    }

    private function generateUniqueUsername(): string
    {
        do {
            $username = 'User' . rand(10000, 99999);
        } while (User::where('username', $username)->exists());

        return $username;
    }
}
