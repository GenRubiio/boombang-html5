<?php

namespace App\Http\Controllers\Api\User;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class UserChangeAvatarController extends Controller
{
    use ResponseApiControllerTrait;

    public function index(Request $request): JsonResource
    {
        try {
            $user = Auth::user();
            //if (isset($request->avatar) && in_array($request->avatar, $user->enabledAvatars())) {
            //    $user->update(['avatar' => $request->avatar]);
            //}
            return $this->successResponse();
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
