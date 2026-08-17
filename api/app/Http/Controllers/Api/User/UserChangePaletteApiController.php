<?php

namespace App\Http\Controllers\Api\User;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Services\UserAvatarPaletteService;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class UserChangePaletteApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function index(Request $request, UserAvatarPaletteService $service): JsonResource
    {
        try {
            $user = Auth::user();
            $avatarId = (int) $request->input('avatar_id');
            $slots = (array) $request->input('slots', []);

            $palette = $service->changePalette($user, $avatarId, $slots);

            return $this->successResponse(['palette' => $palette]);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
