<?php

namespace App\Http\Controllers\Api\User\Interfaces;

use Illuminate\Http\Resources\Json\JsonResource;

interface UserProfileApiControllerInterface
{
    /**
     * @OA\Get(
     * path="/user/data",
     * summary="Get User Data",
     * description="Retrieve the authenticated user's data",
     * operationId="getUserData",
     * tags={"User"},
     * security={{"bearerAuth":{}}},
     * @OA\Response(
     *    response=200,
     *    description="User data retrieved successfully",
     *    @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="id", type="integer", example=1),
     *       @OA\Property(property="name", type="string", example="John Doe"),
     *       @OA\Property(property="surname", type="string", example="Doe"),
     *       @OA\Property(property="email", type="string", format="email", example="user@example.com"),
     *    )
     * ),
     * @OA\Response(
     *    response=401,
     *    description="Unauthorized",
     *    @OA\JsonContent(
     *       @OA\Property(property="error", type="string", example="Unauthenticated")
     *    )
     * )
     * )
     */
    public function getData(): JsonResource;
}
