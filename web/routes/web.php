<?php

use Illuminate\Support\Facades\Route;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Front\PageFrontController;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

Route::group(
    [
        'prefix' => LaravelLocalization::setLocale(),
        'middleware' => ['localizationRedirect', 'localeViewPath', 'auth'],//'localeSessionRedirect'
    ],
    function () {

        /**
         * User
         */
        Route::group(
            [
                'namespace' => '\App\Http\Controllers\Auth'
            ],
            function () {
                Route::get('/logout', [LoginController::class, 'logout'])->name('logout');
                Route::get('/admin/logout', [LoginController::class, 'logout'])->name('admin-logout');
            }
        );
    }
);

Route::group(
    [
        'prefix' => LaravelLocalization::setLocale(),
        'middleware' => ['localizationRedirect', 'localeViewPath'],//'localeSessionRedirect'
    ],
    function () {
        Route::get('login', [LoginController::class, 'showLoginForm'])->name('login');
        Route::post('login', [LoginController::class, 'postLogin'])->name('post-login');

        /**
         * Web
         */
        Route::group(
            [
                'namespace' => '\App\Http\Controllers\Front'
            ],
            function () {
                /**
                 * Capturamos la home
                 */
                Route::get('/', [PageFrontController::class, 'indexFirstLevel'])->name('home');

                /**
                 * Capturamos rutas de tercer nivel
                 */
                Route::get('{page_first_level_slug}/{page_second_level_slug}/{page_third_level_slug}', [PageFrontController::class, 'indexThirdLevel'])
                    ->name('page_three_levels')
                    ->where(['page_first_level_slug' => '^((?!admin).)*$', 'subs' => '.*']);

                /**
                 * Capturamos rutas de segundo nivel
                 */
                Route::get('{page_first_level_slug}/{page_second_level_slug}', [PageFrontController::class, 'indexSecondLevel'])
                    ->name('page_two_levels')
                    ->where(['page_first_level_slug' => '^((?!admin).)*$', 'subs' => '.*']);

                /**
                 * Si no capturamos las rutas pasaran por el PageFrontController donde devolveremos la vista correspondiente.
                 * Si queremos ponerle un alias, enviar una estructura de datos diferente o redigirgirla debemos capturar antes de este punto (por ejemplo para objetos)
                 * */
                /** CATCH-ALL ROUTE for Backpack/PageManager - needs to be at the end of your routes.php file  **/
                Route::get('{page_first_level_slug}', [PageFrontController::class, 'indexFirstLevel'])
                    ->where(['page_first_level_slug' => '^((?!admin).)*$', 'subs' => '.*']);
            }
        );
    }
);
