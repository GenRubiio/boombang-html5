<?php

use Illuminate\Support\Facades\Route;

if (!app()->environment('local')) {
    Route::get('/', function () {
        return redirect(config('app.redirect_frontend_url'));
    });
}
