<?php

namespace App\Http\Controllers\Api\Game\Scene;

use Exception;
use Illuminate\Http\Request;
use App\Models\MinigameScene;
use App\Http\Controllers\Controller;
use App\Http\Resources\MinigameSceneResource;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class MinigameSceneApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function get(Request $request): JsonResource
    {
        try {
            $items = MinigameScene::all();
            return $this->successResponse(
                [
                    'scenes' => MinigameSceneResource::collection($items)
                ]
            );
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
