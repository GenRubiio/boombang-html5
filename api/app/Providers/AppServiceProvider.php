<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \Backpack\PermissionManager\app\Http\Controllers\UserCrudController::class,
            \App\Http\Controllers\Admin\UserCrudController::class
        );

        $this->app->bind(
            \Backpack\PermissionManager\app\Http\Controllers\RoleCrudController::class,
            \App\Http\Controllers\Admin\RoleCrudController::class
        );

        $this->app->bind(
            \Backpack\PermissionManager\app\Http\Controllers\PermissionCrudController::class,
            \App\Http\Controllers\Admin\PermissionCrudController::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
