<?php

namespace App\Http\Controllers\Api\Game\Interfaces;

use Illuminate\Http\Request;

interface MinigameApiControllerInterface
{
    /**
     * @OA\Get(
     *     path="/api/minigames",
     *     summary="Get all minigames with their weeks",
     *     tags={"Minigames"},
     *     security={{ "bearer_token": {} }},
     *     @OA\Response(
     *         response=200,
     *         description="List of all minigames with their available weeks",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="minigames", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Snake Game"),
     *                     @OA\Property(property="description", type="string", example="Classic snake game"),
     *                     @OA\Property(property="weeks", type="array",
     *                         @OA\Items(
     *                             @OA\Property(property="id", type="integer", example=1),
     *                             @OA\Property(property="week_number", type="integer", example=42),
     *                             @OA\Property(property="year", type="integer", example=2024),
     *                             @OA\Property(property="start_date", type="string", format="date-time", example="2024-10-14T00:00:00Z"),
     *                             @OA\Property(property="end_date", type="string", format="date-time", example="2024-10-21T00:00:00Z"),
     *                             @OA\Property(property="week_identifier", type="string", example="W42-2024")
     *                         )
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Error message"),
     *             @OA\Property(property="code", type="integer", example=500)
     *         )
     *     )
     * )
     */
    public function index();

    /**
     * @OA\Post(
     *     path="/api/minigames/ranking",
     *     summary="Get ranking for a specific minigame and week",
     *     tags={"Minigames"},
     *     security={{ "bearer_token": {} }},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"minigame_id", "week_id"},
     *             @OA\Property(property="minigame_id", type="integer", example=1, description="ID of the minigame"),
     *             @OA\Property(property="week_id", type="integer", example=1, description="ID of the week"),
     *             @OA\Property(property="page", type="integer", example=1, description="Page number (optional, default: 1)"),
     *             @OA\Property(property="per_page", type="integer", example=20, description="Items per page (optional, default: 20, max: 100)")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Ranking data with pagination",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="ranking", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="position", type="integer", example=1),
     *                     @OA\Property(property="user_id", type="integer", example=123),
     *                     @OA\Property(property="username", type="string", example="player123"),
     *                     @OA\Property(property="score", type="integer", example=9999),
     *                     @OA\Property(property="created_at", type="string", format="date-time", example="2024-10-20T15:30:00Z")
     *                 )
     *             ),
     *             @OA\Property(property="pagination", type="object",
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="last_page", type="integer", example=5),
     *                 @OA\Property(property="per_page", type="integer", example=20),
     *                 @OA\Property(property="total", type="integer", example=87),
     *                 @OA\Property(property="from", type="integer", example=1),
     *                 @OA\Property(property="to", type="integer", example=20)
     *             ),
     *             @OA\Property(property="minigame", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Snake Game"),
     *                 @OA\Property(property="description", type="string", example="Classic snake game")
     *             ),
     *             @OA\Property(property="week", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="week_number", type="integer", example=42),
     *                 @OA\Property(property="year", type="integer", example=2024),
     *                 @OA\Property(property="start_date", type="string", format="date-time", example="2024-10-14T00:00:00Z"),
     *                 @OA\Property(property="end_date", type="string", format="date-time", example="2024-10-21T00:00:00Z"),
     *                 @OA\Property(property="week_identifier", type="string", example="W42-2024")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="The minigame id field is required."),
     *             @OA\Property(property="code", type="integer", example=422)
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Error message"),
     *             @OA\Property(property="code", type="integer", example=500)
     *         )
     *     )
     * )
     */
    public function getRanking(Request $request);
}