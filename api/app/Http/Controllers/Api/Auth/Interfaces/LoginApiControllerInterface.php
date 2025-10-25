<?php

namespace App\Http\Controllers\Api\Auth\Interfaces;

use Illuminate\Http\Request;
use App\Http\Requests\LoginApiLoginRequest;

interface LoginApiControllerInterface
{
    /**
     * @OA\Post(
     *     path="/api/auth/login",
     *     summary="User Login",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"username", "password"},
     *             @OA\Property(property="username", type="string", example="Gen"),
     *             @OA\Property(property="password", type="string", example="test")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User logged in successfully"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function login(LoginApiLoginRequest $request);
}