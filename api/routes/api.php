<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\VerifyEmulatorToken;
use App\Http\Controllers\Api\Auth\LoginApiController;
use App\Http\Controllers\Api\Auth\RegisterApiController;
use App\Http\Controllers\Api\User\UpdateUppercutsApiController;
use App\Http\Controllers\Api\Game\Scene\PublicSceneApiController;

Route::middleware(VerifyEmulatorToken::class)->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [LoginApiController::class, 'login']);
        Route::post('register', [RegisterApiController::class, 'register']);
    });

    Route::prefix('user')->group(function () {
        Route::prefix('update')->group(function () {
            Route::post('sent-uppercuts', [UpdateUppercutsApiController::class, 'updateSentUppercuts']);
            Route::post('recived-uppercuts', [UpdateUppercutsApiController::class, 'updateRecivedUppercuts']);
        });
    });

    Route::prefix('public-scene')->group(function () {
        Route::post('get', [PublicSceneApiController::class, 'get']);
    });
});
