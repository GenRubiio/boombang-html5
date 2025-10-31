<?php

namespace App\Http\Controllers\Api\Game\Config;

use App\Http\Controllers\Controller;
use App\Http\Resources\IslandConfigResource;
use App\Models\IslandsConfig;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Islands Config",
 *     description="Configuración de islas"
 * )
 */
class IslandsConfigApiController extends Controller
{
    use ResponseApiControllerTrait;

    /**
     * @OA\Post(
     *     path="/api/islands-config",
     *     summary="Obtener todas las configuraciones de islas activas",
     *     tags={"Islands Config"},
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de configuraciones de islas",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="islands_config",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="name", type="string", example="Isla Tropical"),
     *                         @OA\Property(property="image", type="string", example="uploads/island/isla-tropical/xyz.png"),
     *                         @OA\Property(property="image_url", type="string", example="http://api.boombang.com/uploads/island/isla-tropical/xyz.png")
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
        $islandsConfig = IslandsConfig::where('active', true)->get();

        return $this->successResponse([
            'islands_config' => IslandConfigResource::collection($islandsConfig)
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/islands-config/{id}",
     *     summary="Obtener una configuración de isla específica",
     *     tags={"Islands Config"},
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la configuración de isla",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Configuración de isla encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="island_config",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Isla Tropical"),
     *                     @OA\Property(property="image", type="string", example="uploads/island/isla-tropical/xyz.png"),
     *                     @OA\Property(property="image_url", type="string", example="http://api.boombang.com/uploads/island/isla-tropical/xyz.png")
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
    public function show($id)
    {
        $islandConfig = IslandsConfig::where('id', $id)
            ->where('active', true)
            ->first();

        if (!$islandConfig) {
            return $this->errorResponse('Island config not found', 404);
        }

        return $this->successResponse([
            'island_config' => new IslandConfigResource($islandConfig)
        ]);
    }
}
