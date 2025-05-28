<?php

namespace App\Http\Controllers\Api\User;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class UpdateUppercutsApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function updateSentUppercuts(Request $request): JsonResource
    {
        try {
            return $this->successResponse();
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    public function updateRecivedUppercuts(Request $request): JsonResource
    {
        try {
            return $this->successResponse();
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
