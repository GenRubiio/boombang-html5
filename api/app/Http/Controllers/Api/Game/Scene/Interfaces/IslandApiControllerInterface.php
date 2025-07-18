<?php

namespace App\Http\Controllers\Api\Game\Scene\Interfaces;

use Illuminate\Http\Request;

interface IslandApiControllerInterface
{
    /**
     * @OA\Get(
     *     path="/api/islands",
     *     summary="Get all islands",
     *     tags={"Island"},
     *     security={{ "bearer_token": {} }},
     *     @OA\Response(
     *         response=200,
     *         description="A list of islands",
     *     )
     * )
     */
    public function index();

    /**
     * @OA\Post(
     *     path="/api/islands/create",
     *     summary="Create a new island",
     *     tags={"Island"},
     *     security={{ "bearer_token": {} }},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "type"},
     *             @OA\Property(property="name", type="string", example="My Island"),
     *             @OA\Property(property="type", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Island created successfully",
     *     )
     * )
     */
    public function create(Request $request);

    /**
     * @OA\Get(
     *     path="/api/islands/my-islands",
     *     summary="Get my islands",
     *     tags={"Island"},
     *     security={{ "bearer_token": {} }},
     *     @OA\Response(
     *         response=200,
     *         description="A list of my islands",
     *     )
     * )
     */
    public function getMyIslands();

    /**
     * @OA\Post(
     *     path="/api/islands/join",
     *     summary="Join an island",
     *     tags={"Island"},
     *     security={{ "bearer_token": {} }},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"islandId"},
     *             @OA\Property(property="islandId", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Joined island successfully",
     *     )
     * )
     */
    public function join(Request $request);
}
