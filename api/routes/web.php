<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect(config('app.redirect_frontend_url'));
});
