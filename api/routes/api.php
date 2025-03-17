<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\VerifyEmulatorToken;
use App\Http\Controllers\Api\Auth\LoginApiController;
use App\Http\Controllers\Api\User\UpdateUppercutsApiController;

Route::middleware(VerifyEmulatorToken::class)->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [LoginApiController::class, 'login']);
    });

    Route::prefix('user')->group(function () {
        Route::post('update-sent-uppercuts', [UpdateUppercutsApiController::class, 'updateSentUppercuts']);
        Route::post('update-recived-uppercuts', [UpdateUppercutsApiController::class, 'updateRecivedUppercuts']);
    });

    Route::prefix('public-scene')->group(function () {});
});
