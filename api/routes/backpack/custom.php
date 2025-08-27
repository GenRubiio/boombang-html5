<?php

use Illuminate\Support\Facades\Route;

// --------------------------
// Custom Backpack Routes
// --------------------------
// This route file is loaded automatically by Backpack\CRUD.
// Routes you generate using Backpack\Generators will be placed here.

Route::group([
    'prefix' => config('backpack.base.route_prefix', 'admin'),
    'middleware' => array_merge(
        (array) config('backpack.base.web_middleware', 'web'),
        (array) config('backpack.base.middleware_key', 'admin')
    ),
    'namespace' => 'App\Http\Controllers\Admin',
], function () { // custom admin routes
    Route::crud('public-scene', 'PublicSceneCrudController');
    Route::crud('minigame-scene', 'MinigameSceneCrudController');
    Route::crud('scene-item', 'SceneItemCrudController');
    Route::crud('island', 'IslandCrudController');
    Route::crud('private-scene-config', 'PrivateSceneConfigCrudController');
    Route::crud('private-scene', 'PrivateSceneCrudController');
    Route::crud('catalog-category', 'CatalogCategoryCrudController');
    Route::crud('catalog-item', 'CatalogItemCrudController');
    Route::crud('user-catalog-item', 'UserCatalogItemCrudController');
    Route::crud('ranking-category', 'RankingCategoryCrudController');
    Route::crud('ranking', 'RankingCrudController');
    Route::crud('v-ranking-summary', 'VRankingSummaryCrudController');
}); // this should be the absolute last line of this file

/**
 * DO NOT ADD ANYTHING HERE.
 */
