<?php

namespace App\Traits\Observers;

use App\Observers\SeoObserver;

trait SeoObservantTrait
{
    public static function bootSeoObservantTrait()
    {
        static::observe(new SeoObserver());
    }
}
