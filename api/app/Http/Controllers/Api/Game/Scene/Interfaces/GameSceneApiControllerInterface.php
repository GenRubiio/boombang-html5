<?php

namespace App\Http\Controllers\Api\Game\Scene\Interfaces;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

interface GameSceneApiControllerInterface
{
    /**
     * @OA\Get(
     *     path="/api/game-scenes",
     *     summary="Get all game scenes",
     *     tags={"Game Scene"},
     *     security={{ "bearer_token": {} }},
     *     @OA\Response(
     *         response=200,
     *         description="A list of game scenes",
     *     )
     * )
     */
    public function get(Request $request): JsonResource;
}
