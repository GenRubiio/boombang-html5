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
    /** Toggle Active */
    Route::post('toggleField', function (\Illuminate\Http\Request $request) {
        return toggleField($request);
    })->name('toggleField');
    
    Route::crud('public-scene', 'PublicSceneCrudController');
    Route::get('public-scene/{id}/duplicate', 'PublicSceneCrudController@duplicate');
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
    Route::crud('npc', 'NpcCrudController');
    Route::crud('scene-arrow', 'SceneArrowCrudController');
    
    // Rutas para gestión del servidor
    Route::get('server-management', 'ServerManagementController@index')->name('admin.server-management.index');
    Route::post('server-management/restart', 'ServerManagementController@restartServer')->name('admin.server-management.restart');
    Route::crud('api-key', 'ApiKeyCrudController');
}); // this should be the absolute last line of this file

/**
 * DO NOT ADD ANYTHING HERE.
 */
