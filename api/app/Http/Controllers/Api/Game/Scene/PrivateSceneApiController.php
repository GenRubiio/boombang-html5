<?php

namespace App\Http\Controllers\Api\Game\Scene;

use Exception;
use App\Models\Island;
use App\Models\PrivateScene;
use Illuminate\Http\Request;
use App\Models\UserCatalogItem;
use App\Models\PrivateSceneConfig;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\PrivateSceneResource;
use App\Http\Resources\UserCatalogItemsResource;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\PrivateSceneConfigResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use App\Http\Controllers\Api\Game\Scene\Interfaces\PrivateSceneApiControllerInterface;

class PrivateSceneApiController extends Controller implements PrivateSceneApiControllerInterface
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
            $scene->load(
                'island',
                'island.privateScenes',
                'userCatalogItems',
                'privateSceneConfig'
            );
            return $this->successResponse([
                'success' => true,
                'scene' => (new PrivateSceneResource($scene))->toDTO(),
                'scene_config' => (new PrivateSceneConfigResource($scene->privateSceneConfig)),
                'user_inventory_items' => $scene->user_id == Auth::user()->id
                    ? UserCatalogItemsResource::collection(Auth::user()->catalogShowItems) : [],
            ]);
        } catch (Exception $e) {
            Log::error('Error creating private scene: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'island_id' => $request->input('island_id'),
                'type' => $request->input('type'),
            ]);
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
            $scene->load(
                'island',
                'island.privateScenes',
                'userCatalogItems'
            );
            return $this->successResponse([
                'success' => true,
                'scene' => (new PrivateSceneResource($scene))->toDTO(),
                'scene_config' => (new PrivateSceneConfigResource($scene->privateSceneConfig)),
                'user_inventory_items' => $scene->user_id == Auth::user()->id
                    ? UserCatalogItemsResource::collection(Auth::user()->catalogShowItems) : [],
            ]);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    public function removeItem(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_catalog_item_id' => 'required|integer|exists:user_catalog_items,id',
            ]);
            $user = Auth::user();
            $responseUpdate = UserCatalogItem::where('id', $validated['user_catalog_item_id'])
                ->where('user_id', $user->id)
                ->whereNotNull('private_scene_id')
                ->update([
                    'private_scene_id' => null,
                    'occupied_tiles' => '[]'
                ]);

            if ($responseUpdate == 0) {
                throw new Exception('Item does not belong to the current private scene or does not exist.');
            }
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    public function putItem(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_catalog_item_id' => 'required|integer|exists:user_catalog_items,id',
                'private_scene_id' => 'required|integer|exists:private_scenes,id',
                'occupied_tiles' => 'required|array',
            ]);
            $user = Auth::user();
            $responseUpdate = UserCatalogItem::where('id', $validated['user_catalog_item_id'])
                ->where('user_id', $user->id)
                ->whereNull('private_scene_id')
                ->update([
                    'private_scene_id' => $validated['private_scene_id'],
                    'occupied_tiles' => json_encode($validated['occupied_tiles'])
                ]);

            if ($responseUpdate == 0) {
                throw new Exception('Item does not belong to the current user or does not exist.');
            }
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    public function updateItemPosition(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_catalog_item_id' => 'required|integer|exists:user_catalog_items,id',
                'occupied_tiles' => 'required|array',
            ]);
            $user = Auth::user();
            $responseUpdate = UserCatalogItem::where('id', $validated['user_catalog_item_id'])
                ->where('user_id', $user->id)
                ->whereNotNull('private_scene_id')
                ->update([
                    'occupied_tiles' => json_encode($validated['occupied_tiles'])
                ]);

            if ($responseUpdate == 0) {
                throw new Exception('Item does not belong to the current user or does not exist.');
            }
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    public function updateName(Request $request): JsonResource
    {
        try {
            $validated = $request->validate([
                'sceneId' => 'required|integer|exists:private_scenes,id',
                'name' => 'required|string|max:50',
            ]);

            $user = Auth::user();
            $scene = PrivateScene::findOrFail($validated['sceneId']);

            // Validate that the user owns the island where this scene belongs
            $island = $scene->island;
            if ($island->user_id != $user->id) {
                throw new Exception('You do not have permission to update this scene.');
            }

            $scene->update([
                'name' => $validated['name']
            ]);

            return $this->successResponse([
                'success' => true,
                'message' => 'Scene name updated successfully',
            ]);
        } catch (Exception $e) {
            Log::error('Error updating private scene name: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'sceneId' => $request->input('sceneId'),
            ]);
            return $this->handleException($e);
        }
    }

    public function delete(Request $request): JsonResource
    {
        try {
            $validated = $request->validate([
                'sceneId' => 'required|integer|exists:private_scenes,id',
            ]);

            $user = Auth::user();
            $scene = PrivateScene::findOrFail($validated['sceneId']);

            // Validate that the user owns the island where this scene belongs
            $island = $scene->island;
            if ($island->user_id != $user->id) {
                throw new Exception('You do not have permission to delete this scene.');
            }

            // Set private_scene_id to null for all objects in this scene
            UserCatalogItem::where('private_scene_id', $scene->id)
                ->update([
                    'private_scene_id' => null,
                    'occupied_tiles' => '[]'
                ]);

            // Delete the scene
            $scene->delete();

            return $this->successResponse([
                'success' => true,
                'message' => 'Scene deleted successfully',
            ]);
        } catch (Exception $e) {
            Log::error('Error deleting private scene: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'sceneId' => $request->input('sceneId'),
            ]);
            return $this->handleException($e);
        }
    }

    public function updateColors(Request $request): JsonResource
    {
        try {
            $validated = $request->validate([
                'sceneId' => 'required|integer|exists:private_scenes,id',
                'colors' => 'required|array',
            ]);

            $user = Auth::user();
            $scene = PrivateScene::findOrFail($validated['sceneId']);

            // Validate that the user owns the island where this scene belongs
            $island = $scene->island;
            if ($island->user_id != $user->id) {
                throw new Exception('You do not have permission to update this scene.');
            }

            // Validar que los colores sean hexadecimales válidos
            foreach ($validated['colors'] as $key => $value) {
                if (!preg_match('/^[0-9a-fA-F]{6}$/', $value)) {
                    throw new Exception("Invalid color format for {$key}: {$value}");
                }
            }

            // Actualizar los colores en formato JSON
            $scene->update([
                'colors' => json_encode($validated['colors'])
            ]);

            return $this->successResponse([
                'success' => true,
                'message' => 'Scene colors updated successfully',
                'colors' => $validated['colors']
            ]);
        } catch (Exception $e) {
            Log::error('Error updating private scene colors: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'sceneId' => $request->input('sceneId'),
            ]);
            return $this->handleException($e);
        }
    }
}
