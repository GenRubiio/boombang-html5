<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use App\Http\Controllers\Api\User\Interfaces\UserProfileApiControllerInterface;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\UserResource;
use App\Services\UserService;
use Exception;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileApiController extends Controller implements UserProfileApiControllerInterface
{
    use ResponseApiControllerTrait;

    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function getData(): JsonResource
    {
        try {
            return new UserResource(auth()->user());
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
