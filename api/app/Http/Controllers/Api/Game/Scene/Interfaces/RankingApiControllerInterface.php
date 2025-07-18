<?php

namespace App\Http\Controllers\Api\Game\Scene\Interfaces;

use Illuminate\Http\Request;

interface RankingApiControllerInterface
{
    /**
     * @OA\Post(
     *     path="/api/ranking/categories",
     *     summary="Get Ranking Categories",
     *     tags={"Ranking"},
     *     security={{ "bearer_token": {} }},
     *     @OA\Response(
     *         response=200,
     *         description="A list of ranking categories",
     *     )
     * )
     */
    public function getCategories();

    /**
     * @OA\Post(
     *     path="/api/ranking/get",
     *     summary="Get Rankings",
     *     tags={"Ranking"},
     *     security={{ "bearer_token": {} }},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"ranking_category_id"},
     *             @OA\Property(property="ranking_category_id", type="integer", example=1),
     *             @OA\Property(property="season", type="integer", example=1),
     *             @OA\Property(property="page", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="A list of rankings",
     *     )
     * )
     */
    public function get(Request $request);
}
