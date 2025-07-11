<?php

namespace App\Http\Controllers\Api\Game\Scene;

use Exception;
use App\Models\Island;
use App\Models\PrivateScene;
use Illuminate\Http\Request;
use App\Models\PrivateSceneConfig;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\PrivateSceneResource;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class PrivateSceneApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function create(Request $request): JsonResource
    {
        try {
            $validated = $request->validate([
                'island_id' => 'required|integer|exists:islands,id',
                'name' => 'required|string|max:15',
                'type' => 'required|integer|exists:private_scene_configs,id',
            ]);
            // Validate if island belongs to the user
            $user = Auth::user();
            $island = Island::findOrFail($validated['island_id']);
            if ($island->user_id != $user->id) {
                throw new Exception('You do not have permission to create a scene in this island.');
            }
            // Validate max scenes per island
            $maxScenes = 5;
            $currentScenesCount = $island->privateScenes()->count();
            if ($currentScenesCount >= $maxScenes) {
                throw new Exception('You have reached the maximum number of scenes for this island.');
            }
            //Validate if type is valid looking for a config attribute island_type
            $sceneConfig = PrivateSceneConfig::findOrFail($validated['type']);
            if ($sceneConfig->island_type != $island->type) {
                throw new Exception('The scene type does not match the island type.');
            }

            $scene = PrivateScene::create([
                'name' => $validated['name'],
                'island_id' => $validated['island_id'],
                'type' => $validated['type'],
                'user_id' => $user->id,
                'colors' => $sceneConfig->default_colors,
            ]);

            return $this->successResponse([
                'message' => 'Private scene created successfully.',
                'scene_id' => $scene->id
            ]);
        } catch (Exception $e) {
            dd($e);
            return $this->handleException($e);
        }
    }

    public function join(Request $request): JsonResource
    {
        try {
            $validated = $request->validate([
                'scene_id' => 'required|integer|exists:private_scenes,id',
                'password' => 'nullable|string|max:255',
            ]);
            $scene = PrivateScene::findOrFail($validated['scene_id']);
            if ($scene->password && $scene->password != $validated['password']) {
                throw new Exception('Incorrect password for the private scene.');
            }
            $scene->load('island', 'island.privateScenes');
            return $this->successResponse([
                'success' => true,
                'scene' => (new PrivateSceneResource($scene))->toDTO(),
            ]);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
