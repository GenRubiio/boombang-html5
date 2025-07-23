<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function () {
    return view('api');
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['set.locale'])->group(function () {
    Route::middleware(['auth:api', 'check.active'])->group(function () {
        /*
        Route::prefix('user')->middleware(['check.guest'])->group(function () {
            Route::get('data', [UserProfileApiController::class, 'getData']);
        });
        */
    });
});
