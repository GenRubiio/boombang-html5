<?php

namespace App\Http\Controllers\Api\Auth;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class LogoutApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function index(Request $request): JsonResource
    {
        try {
            Auth::user()->tokens()->delete(); // Delete all tokens for the user
            Auth::logout();
            return $this->successResponse(['message' => 'Logout successful']);
        } catch (Exception $e) {
            Log::error('Logout error: ' . $e->getMessage(), [
                'request' => $request->all(),
            ]);
            return $this->handleException($e);
        }
    }
}
