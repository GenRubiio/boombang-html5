<?php

namespace App\Traits\Observers;

use App\Observers\SlugObserver;

trait SlugObservantTrait
{
    public static function bootSlugObservantTrait()
    {
        static::observe(new SlugObserver());
    }
}
