<?php

use Illuminate\Support\Facades\Route;

// --------------------------
// Custom Backpack Routes
// --------------------------
// This route file is loaded automatically by Backpack\Base.
// Routes you generate using Backpack\Generators will be placed here.

Route::group([
    'prefix'     => config('backpack.base.route_prefix', 'admin'),
    'middleware' => array_merge(
        (array) config('backpack.base.web_middleware', 'web'),
        (array) config('backpack.base.middleware_key', 'admin')
    ),
    'namespace'  => 'App\Http\Controllers\Admin',
], function () { // custom admin routes

    /** Toggle Active */
    Route::post('toggleField', function (\Illuminate\Http\Request $request) {
        return toggleField($request);
    })->name('toggleField');

    /** Translates */
    Route::get('language/texts/{lang?}/{file?}', 'LanguageCrudController@showTexts');
    Route::post('language/texts/{lang}/{file}', 'LanguageCrudController@updateTexts');
    Route::post('language/create/file', 'LanguageCrudController@createFile');
    Route::post('language/create/translation', 'LanguageCrudController@createTranslation');
    Route::post('language/square/translation', 'LanguageCrudController@squareTranslation');
    Route::post('language/commit-translates', 'LanguageCrudController@commitTranslates');
    Route::crud('language', 'LanguageCrudController');

    /** Backpack Charts */
    Route::get('charts/weekly-users', 'Charts\WeeklyUsersChartController@response')->name('charts.weekly-users.index');

    /** Models */
    Route::crud('preset-email', 'PresetEmailCrudController');
    Route::crud('lead', 'LeadCrudController');
    Route::crud('multimedia', 'MultimediaCrudController');
    Route::crud('slide', 'SlideCrudController');
    Route::crud('social-network', 'SocialNetworkCrudController');
    Route::crud('gallery', 'GalleryCrudController');
    Route::crud('version', 'VersionCrudController');
    Route::crud('cookie', 'CookieCrudController');

    /** Parametric tables */
    Route::crud('parametric-table', 'ParametricTableCrudController');
    Route::group(['prefix' => 'parametric-table/{parametric_table_id}'], function () {
        Route::crud('parametric-table-value', 'ParametricTableValueCrudController');
    });
}); // this should be the absolute last line of this file
