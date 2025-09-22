<?php

namespace App\Http\Controllers\Api\Game\Scene;

use Exception;
use App\Enums\MenuTypeEnum;
use App\Models\PublicScene;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\PublicSceneResource;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use App\Http\Controllers\Api\Game\Scene\Interfaces\PublicSceneApiControllerInterface;

class PublicSceneApiController extends Controller implements PublicSceneApiControllerInterface
{
    use ResponseApiControllerTrait;

    public function get(Request $request): JsonResource
    {
        try {
            $items = PublicScene::with('items', 'npc')
                ->where('menu_type', MenuTypeEnum::PUBLIC_SCENE->key())
                ->active()
                ->ordered()
                ->get();
            return $this->successResponse(
                [
                    'scenes' => PublicSceneResource::collection($items)
                ]
            );
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    public function userCatchItem(Request $request): JsonResource
    {
        try {
            $validated = $request->validate([
                'item_id' => 'required',
                'scene_id' => 'required',
            ]);

            $user = Auth::user();
            $itemId = $validated['item_id'];
            $sceneId = $validated['scene_id'];
            $sceneItem = PublicScene::find($sceneId)
                ->items()
                ->active()
                ->find($itemId);
            if (!$sceneItem) {
                throw new Exception('Item not found in the scene.');
            }
            if ($sceneItem->pivot->sum_points_to_user_attribute) {
                $userAttributeName = $sceneItem->pivot->user_attribute_name;
                if ($userAttributeName) {
                    $user->{$userAttributeName} += $sceneItem->pivot->sum_points;
                    $user->save();
                } else {
                    throw new Exception('User attribute name is not set.');
                }
            }

            return $this->successResponse(['message' => 'Item caught successfully.']);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
