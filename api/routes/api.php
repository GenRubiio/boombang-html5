<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\VerifyEmulatorToken;
use App\Http\Controllers\Api\Auth\LoginApiController;
use App\Http\Controllers\Api\Auth\RegisterApiController;
use App\Http\Controllers\Api\Game\Scene\IslandApiController;
use App\Http\Controllers\Api\User\IncreaseStatsApiController;
use App\Http\Controllers\Api\Game\Scene\GameSceneApiController;
use App\Http\Controllers\Api\Game\Scene\PublicSceneApiController;
use App\Http\Controllers\Api\Game\Scene\PrivateSceneApiController;
use App\Http\Controllers\Api\Game\Scene\MinigameSceneApiController;

Route::middleware(VerifyEmulatorToken::class)->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [LoginApiController::class, 'login']);
        Route::post('register', [RegisterApiController::class, 'register']);
    });

    /**
     * Boot Emulator API Routes
     */
    Route::prefix('public-scene')->group(function () {
        Route::post('get', [PublicSceneApiController::class, 'get']);
    });

    Route::prefix('game-scene')->group(function () {
        Route::post('get', [GameSceneApiController::class, 'get']);
    });

    Route::prefix('minigame-scene')->group(function () {
        Route::post('get', [MinigameSceneApiController::class, 'get']);
    });

    /**
     * Game API Routes
     */
    Route::middleware(['auth:api'])->group(function () {
        Route::prefix('user')->group(function () {
            Route::post('increase-stats', [IncreaseStatsApiController::class, 'index']);
        });

        Route::prefix('island')->group(function () {
            Route::post('/', [IslandApiController::class, 'index']);
            Route::post('create', [IslandApiController::class, 'create']);
            Route::post('join', [IslandApiController::class, 'join']);
        });

        Route::prefix('islands')->group(function () {
            Route::post('get', [IslandApiController::class, 'getMyIslands']);
        });

        Route::prefix('private-scene')->group(function () {
            Route::post('create', [PrivateSceneApiController::class, 'create']);
        });
    });
});
