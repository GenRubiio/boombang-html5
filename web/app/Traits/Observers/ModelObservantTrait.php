<?php

namespace App\Traits\Observers;

use App\Observers\ModelObserver;

trait ModelObservantTrait
{
    public static function bootModelObservantTrait()
    {
        static::observe(new ModelObserver());
    }
}
