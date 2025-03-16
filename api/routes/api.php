<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\VerifyEmulatorToken;
use App\Http\Controllers\Api\Auth\LoginApiController;

Route::middleware(VerifyEmulatorToken::class)->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [LoginApiController::class, 'login']);
    });
});
