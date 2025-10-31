<?php

namespace App\Http\Controllers\Api\Game\Config;

use App\Http\Controllers\Controller;
use App\Http\Resources\PrivateSceneConfigResource;
use App\Models\PrivateSceneConfig;
use App\Models\IslandsConfig;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Private Scene Config",
 *     description="Configuración de escenas privadas"
 * )
 */
class PrivateSceneConfigApiController extends Controller
{
    use ResponseApiControllerTrait;

    /**
     * @OA\Post(
     *     path="/api/private-scene-config/by-island/{islandConfigId}",
     *     summary="Obtener configuraciones de escenas privadas por ID de isla",
     *     tags={"Private Scene Config"},
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="islandConfigId",
     *         in="path",
     *         description="ID de la configuración de isla",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de configuraciones de escenas privadas",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="private_scene_configs",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="island_type", type="integer", example=1),
     *                         @OA\Property(property="name", type="string", example="Escena Principal"),
     *                         @OA\Property(property="image", type="string", example="uploads/island-scene/escena-principal/xyz.png"),
     *                         @OA\Property(property="image_url", type="string", example="http://api.boombang.com/uploads/island-scene/escena-principal/xyz.png"),
     *                         @OA\Property(property="max_users", type="integer", example=20),
     *                         @OA\Property(property="map_width", type="integer", example=800),
     *                         @OA\Property(property="map_height", type="integer", example=600),
     *                         @OA\Property(property="map", type="string", example="xxxxx\nxxxxx"),
     *                         @OA\Property(property="start_x", type="integer", example=400),
     *                         @OA\Property(property="start_y", type="integer", example=300),
     *                         @OA\Property(property="start_z", type="integer", example=0),
     *                         @OA\Property(
     *                             property="start_position",
     *                             type="object",
     *                             @OA\Property(property="x", type="integer", example=400),
     *                             @OA\Property(property="y", type="integer", example=300),
     *                             @OA\Property(property="z", type="integer", example=0)
     *                         ),
     *                         @OA\Property(
     *                             property="default_colors",
     *                             type="array",
     *                             @OA\Items(type="string", example="#FFFFFF")
     *                         ),
     *                         @OA\Property(property="base_api_url", type="string", example="http://api.boombang.com"),
     *                         @OA\Property(
     *                             property="assets_data",
     *                             type="object",
     *                             example={"asset1": "value1"}
     *                         )
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Configuración de isla no encontrada"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autorizado"
     *     )
     * )
     */
    public function getByIsland($islandConfigId)
    {
        // Verificar que existe la isla
        $islandConfig = IslandsConfig::where('id', $islandConfigId)
            ->where('active', true)
            ->first();

        if (!$islandConfig) {
            return $this->errorResponse('Island config not found', 404);
        }

        // Obtener las escenas privadas asociadas a esta isla
        $privateSceneConfigs = PrivateSceneConfig::where('island_type', $islandConfigId)
            ->where('active', true)
            ->get();

        return $this->successResponse([
            'private_scene_configs' => PrivateSceneConfigResource::collection($privateSceneConfigs)
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/private-scene-config",
     *     summary="Obtener todas las configuraciones de escenas privadas activas",
     *     tags={"Private Scene Config"},
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de configuraciones de escenas privadas",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="private_scene_configs",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="island_type", type="integer", example=1),
     *                         @OA\Property(property="name", type="string", example="Escena Principal"),
     *                         @OA\Property(property="image", type="string", example="uploads/island-scene/escena-principal/xyz.png"),
     *                         @OA\Property(property="image_url", type="string", example="http://api.boombang.com/uploads/island-scene/escena-principal/xyz.png"),
     *                         @OA\Property(property="max_users", type="integer", example=20),
     *                         @OA\Property(property="map_width", type="integer", example=800),
     *                         @OA\Property(property="map_height", type="integer", example=600),
     *                         @OA\Property(property="map", type="string", example="xxxxx\nxxxxx"),
     *                         @OA\Property(property="start_x", type="integer", example=400),
     *                         @OA\Property(property="start_y", type="integer", example=300),
     *                         @OA\Property(property="start_z", type="integer", example=0),
     *                         @OA\Property(
     *                             property="start_position",
     *                             type="object",
     *                             @OA\Property(property="x", type="integer", example=400),
     *                             @OA\Property(property="y", type="integer", example=300),
     *                             @OA\Property(property="z", type="integer", example=0)
     *                         ),
     *                         @OA\Property(
     *                             property="default_colors",
     *                             type="array",
     *                             @OA\Items(type="string", example="#FFFFFF")
     *                         ),
     *                         @OA\Property(property="base_api_url", type="string", example="http://api.boombang.com"),
     *                         @OA\Property(
     *                             property="assets_data",
     *                             type="object",
     *                             example={"asset1": "value1"}
     *                         )
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autorizado"
     *     )
     * )
     */
    public function index()
    {
        $privateSceneConfigs = PrivateSceneConfig::where('active', true)->get();

        return $this->successResponse([
            'private_scene_configs' => PrivateSceneConfigResource::collection($privateSceneConfigs)
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/private-scene-config/{id}",
     *     summary="Obtener una configuración de escena privada específica",
     *     tags={"Private Scene Config"},
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la configuración de escena privada",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Configuración de escena privada encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="private_scene_config",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="island_type", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Escena Principal"),
     *                     @OA\Property(property="image", type="string", example="uploads/island-scene/escena-principal/xyz.png"),
     *                     @OA\Property(property="image_url", type="string", example="http://api.boombang.com/uploads/island-scene/escena-principal/xyz.png"),
     *                     @OA\Property(property="max_users", type="integer", example=20),
     *                     @OA\Property(property="map_width", type="integer", example=800),
     *                     @OA\Property(property="map_height", type="integer", example=600),
     *                     @OA\Property(property="map", type="string", example="xxxxx\nxxxxx"),
     *                     @OA\Property(property="start_x", type="integer", example=400),
     *                     @OA\Property(property="start_y", type="integer", example=300),
     *                     @OA\Property(property="start_z", type="integer", example=0),
     *                     @OA\Property(
     *                         property="start_position",
     *                         type="object",
     *                         @OA\Property(property="x", type="integer", example=400),
     *                         @OA\Property(property="y", type="integer", example=300),
     *                         @OA\Property(property="z", type="integer", example=0)
     *                     ),
     *                     @OA\Property(
     *                         property="default_colors",
     *                         type="array",
     *                         @OA\Items(type="string", example="#FFFFFF")
     *                     ),
     *                     @OA\Property(property="base_api_url", type="string", example="http://api.boombang.com"),
     *                     @OA\Property(
     *                         property="assets_data",
     *                         type="object",
     *                         example={"asset1": "value1"}
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Configuración de escena privada no encontrada"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autorizado"
     *     )
     * )
     */
    public function show($id)
    {
        $privateSceneConfig = PrivateSceneConfig::where('id', $id)
            ->where('active', true)
            ->first();

        if (!$privateSceneConfig) {
            return $this->errorResponse('Private scene config not found', 404);
        }

        return $this->successResponse([
            'private_scene_config' => new PrivateSceneConfigResource($privateSceneConfig)
        ]);
    }
}
