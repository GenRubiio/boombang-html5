<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\VerifyEmulatorToken;
use App\Http\Controllers\Api\Auth\LoginApiController;
use App\Http\Controllers\Api\Auth\RegisterApiController;
use App\Http\Controllers\Api\Game\Scene\IslandApiController;
use App\Http\Controllers\Api\Game\Scene\RankingApiController;
use App\Http\Controllers\Api\User\IncreaseStatsApiController;
use App\Http\Controllers\Api\Game\Scene\GameSceneApiController;
use App\Http\Controllers\Api\User\UserChangeFichaApiController;
use App\Http\Controllers\Api\Game\Scene\PublicSceneApiController;
use App\Http\Controllers\Api\User\UpdateDescriptionApiController;
use App\Http\Controllers\Api\Game\Scene\PrivateSceneApiController;
use App\Http\Controllers\Api\Game\Scene\MinigameSceneApiController;

Route::prefix('test')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [LoginApiController::class, 'login']);
    });
});

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
            Route::post('update-description', [UpdateDescriptionApiController::class, 'index']);
            Route::post('change-ficha', [UserChangeFichaApiController::class, 'index']);
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
            Route::post('join', [PrivateSceneApiController::class, 'join']);
            Route::post('remove-item', [PrivateSceneApiController::class, 'removeItem']);
            Route::post('put-item', [PrivateSceneApiController::class, 'putItem']);
            Route::post('update-item-position', [PrivateSceneApiController::class, 'updateItemPosition']);
        });

        Route::prefix('public-scene')->group(function () {
            Route::post('user-catch-item', [PublicSceneApiController::class, 'userCatchItem']);
        });

        Route::prefix('ranking')->group(function () {
            Route::post('categories', [RankingApiController::class, 'getCategories']);
            Route::post('get', [RankingApiController::class, 'get']);
        });
    });
});

Route::prefix('internal')->group(function() {
    Route::prefix('bots')->group(function () {
        Route::post('generate-token', [App\Http\Controllers\Internal\BotController::class, 'generateToken']);
    });
});
