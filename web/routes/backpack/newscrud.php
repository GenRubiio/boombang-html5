<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Backpack\NewsCRUD Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of the routes that are
| handled by the Backpack\NewsCRUD package.
|
*/

Route::group([
    'prefix'     => config('backpack.base.route_prefix', 'admin'),
    'middleware' => array_merge(
        (array) config('backpack.base.web_middleware', 'web'),
        (array) config('backpack.base.middleware_key', 'admin')
    ),
    'namespace'  => 'App\Http\Controllers\Admin',
], function () {
    Route::crud('blog-article', 'BlogArticleCrudController');
    Route::crud('blog-category', 'BlogCategoryCrudController');
    Route::crud('blog-tag', 'BlogTagCrudController');
});
