<?php

namespace App\Traits\Observers;

use App\Observers\PageObserver;

trait PageObservantTrait
{
    public static function bootPageObservantTrait()
    {
        static::observe(new PageObserver());
    }
}
