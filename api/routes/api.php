<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\LoginApiController;

Route::prefix('auth')->group(function () {
    Route::post('login', [LoginApiController::class, 'login']);
});
