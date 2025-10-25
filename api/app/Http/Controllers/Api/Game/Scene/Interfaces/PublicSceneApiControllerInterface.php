<?php

namespace App\Http\Controllers\Api\Game\Scene\Interfaces;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

interface PublicSceneApiControllerInterface
{
    /**
     * @OA\Post(
     *     path="/api/public-scene/get",
     *     summary="Get all public scenes",
     *     tags={"Public Scene"},
     *     security={{ "bearer_token": {} }},
     *     @OA\Response(
     *         response=200,
     *         description="A list of public scenes",
     *     )
     * )
     */
    public function get(Request $request): JsonResource;
}
