<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Internal\StripeController;

if (!app()->environment('local')) {
    Route::get('/', function () {
        return redirect(config('app.redirect_frontend_url'));
    });
}

// Stripe callback routes
Route::get('/stripe-success', [StripeController::class, 'stripeSuccessPage'])->name('stripe.success');
Route::get('/stripe-cancel', [StripeController::class, 'stripeCancelPage'])->name('stripe.cancel');
