<?php

namespace App\Http\Controllers\Api\Game\Scene;

use Exception;
use App\Enums\MenuTypeEnum;
use App\Models\PublicScene;
use App\Models\Minigame;
use App\Models\MinigameWeek;
use App\Models\MinigameScore;
use App\Enums\MinigameTypeEnum;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
                    
                    // Si el atributo es coconuts_caught, agregar al ranking del minijuego
                    if ($userAttributeName == 'coconuts_caught') {
                        // Buscar el minijuego Crazy Coconuts
                        $minigame = Minigame::where('type', MinigameTypeEnum::CRAZY_COCONUTS->key())->first();
                        if ($minigame) {
                            // Obtener la semana actual del minijuego
                            $currentWeek = MinigameWeek::where('minigame_id', $minigame->id)
                                ->where('start_date', '<=', now())
                                ->where('end_date', '>=', now())
                                ->first();
                            
                            if ($currentWeek) {
                                // Verificar si el usuario ya tiene un score para esta semana
                                $existingScore = MinigameScore::where('user_id', $user->id)
                                    ->where('minigame_week_id', $currentWeek->id)
                                    ->first();
                                
                                if ($existingScore) {
                                    // Actualizar el score sumando los puntos del item
                                    $existingScore->update(['score' => DB::raw('score + ' . $sceneItem->pivot->sum_points)]);
                                } else {
                                    // Crear un nuevo registro con los puntos del item
                                    MinigameScore::create([
                                        'user_id' => $user->id,
                                        'minigame_week_id' => $currentWeek->id,
                                        'minigame_id' => $minigame->id,
                                        'score' => $sceneItem->pivot->sum_points
                                    ]);
                                }
                            }
                        }
                    }
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
