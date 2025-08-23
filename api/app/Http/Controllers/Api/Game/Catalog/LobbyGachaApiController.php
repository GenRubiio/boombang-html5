<?php

namespace App\Http\Controllers\Api\Game\Catalog;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class LobbyGachaApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function items(Request $request): JsonResource
    {
        try {
            return $this->successResponse(
                [
    
                ]
            );
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}