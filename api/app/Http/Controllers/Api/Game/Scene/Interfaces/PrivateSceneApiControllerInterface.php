<?php

namespace App\Http\Controllers\Api\Game\Scene\Interfaces;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

interface PrivateSceneApiControllerInterface
{
    /**
     * @OA\Post(
     *     path="/api/scene/private/create",
     *     summary="Create a new private scene",
     *     tags={"Private Scene"},
     *     security={{ "bearer_token": {} }},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"island_id", "name", "type"},
     *             @OA\Property(property="island_id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="My Scene"),
     *             @OA\Property(property="type", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Scene created successfully",
     *     )
     * )
     */
    public function create(Request $request): JsonResource;

    /**
     * @OA\Post(
     *     path="/api/scene/private/join",
     *     summary="Join a private scene",
     *     tags={"Private Scene"},
     *     security={{ "bearer_token": {} }},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"scene_id"},
     *             @OA\Property(property="scene_id", type="integer", example=1),
     *             @OA\Property(property="password", type="string", example="")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Joined scene successfully",
     *     )
     * )
     */
    public function join(Request $request): JsonResource;

    /**
     * @OA\Post(
     *     path="/api/scene/private/remove-item",
     *     summary="Remove an item from a private scene",
     *     tags={"Private Scene"},
     *     security={{ "bearer_token": {} }},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_catalog_item_id"},
     *             @OA\Property(property="user_catalog_item_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Item removed successfully",
     *     )
     * )
     */
    public function removeItem(Request $request);

    /**
     * @OA\Post(
     *     path="/api/scene/private/put-item",
     *     summary="Put an item in a private scene",
     *     tags={"Private Scene"},
     *     security={{ "bearer_token": {} }},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_catalog_item_id", "private_scene_id", "occupied_tiles"},
     *             @OA\Property(property="user_catalog_item_id", type="integer", example=1),
     *             @OA\Property(property="private_scene_id", type="integer", example=1),
     *             @OA\Property(property="occupied_tiles", type="array", @OA\Items(type="array", @OA\Items(type="integer")), example="[[1,2],[3,4]]")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Item placed successfully",
     *     )
     * )
     */
    public function putItem(Request $request);

    /**
     * @OA\Post(
     *     path="/api/scene/private/update-item-position",
     *     summary="Update an item's position in a private scene",
     *     tags={"Private Scene"},
     *     security={{ "bearer_token": {} }},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_catalog_item_id", "occupied_tiles"},
     *             @OA\Property(property="user_catalog_item_id", type="integer", example=1),
     *             @OA\Property(property="occupied_tiles", type="array", @OA\Items(type="array", @OA\Items(type="integer")), example="[[1,2],[3,4]]")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Item position updated successfully",
     *     )
     * )
     */
    public function updateItemPosition(Request $request);
}
