<?php

namespace App\Http\Controllers\Api\Game\Scene\Interfaces;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

interface MinigameSceneApiControllerInterface
{
    /**
     * @OA\Get(
     *     path="/api/minigame-scenes",
     *     summary="Get all minigame scenes",
     *     tags={"Minigame Scene"},
     *     security={{ "bearer_token": {} }},
     *     @OA\Response(
     *         response=200,
     *         description="A list of minigame scenes",
     *     )
     * )
     */
    public function get(Request $request): JsonResource;
}
