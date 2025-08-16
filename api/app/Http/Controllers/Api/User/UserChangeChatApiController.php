<?php

namespace App\Http\Controllers\Api\User;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class UserChangeChatApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function index(Request $request): JsonResource
    {
        try {
            $user = Auth::user();
            if (isset($request->chat_color) && in_array($request->chat_color, $user->enabledChats())) {
                $user->update(['chat_color' => $request->chat_color]);
            }
            return $this->successResponse();
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
