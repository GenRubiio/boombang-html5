<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Webapi\CacheWebapiController;
use App\Http\Controllers\Webapi\SitemapWebapiController;
use App\Http\Controllers\Webapi\FormContactWebapiController;

/*
|--------------------------------------------------------------------------
| WebAPI Routes
|--------------------------------------------------------------------------
|
| Routes for Ajax requests
|
*/

Route::group([
    'as' => 'webapi.'
], function () {
    /* Flush cache */
    Route::get('flush-cache', [CacheWebapiController::class, 'flushCache'])->name('flush-cache');

    /* Generate sitemap */
    Route::get('sitemap-generate', [SitemapWebapiController::class, 'sitemapGenerate'])->name('sitemap-generate');

    Route::prefix('form')->group(function () {
        Route::post('contact', [FormContactWebapiController::class, 'handle'])
            ->name('form-contact');
    });

    Route::get('chat-color', function () {
        return view('chat-color');
    });
});
