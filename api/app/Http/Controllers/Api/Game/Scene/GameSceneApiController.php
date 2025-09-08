<?php

namespace App\Http\Controllers\Api\Game\Scene;

use Exception;
use App\Enums\MenuTypeEnum;
use App\Models\PublicScene;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\PublicSceneResource;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use App\Http\Controllers\Api\Game\Scene\Interfaces\GameSceneApiControllerInterface;

class GameSceneApiController extends Controller implements GameSceneApiControllerInterface
{
    use ResponseApiControllerTrait;

    public function get(Request $request): JsonResource
    {
        try {
            $items = PublicScene::with('items', 'npc')->where('menu_type', MenuTypeEnum::GAME_SCENE->key())->get();
            return $this->successResponse(
                [
                    'scenes' => PublicSceneResource::collection($items)
                ]
            );
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}