<?php

namespace App\Providers;

use App\Facades\BgImageResponsive\BgImageResponsive;
use App\Facades\Btn\Btn;
use App\Facades\Picture\Picture;
use Illuminate\Support\ServiceProvider;

class FacadesServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->app->bind('picture', Picture::class);
        $this->app->bind('btn', Btn::class);
        $this->app->bind('bgImageResponsive', BgImageResponsive::class);
    }
}
