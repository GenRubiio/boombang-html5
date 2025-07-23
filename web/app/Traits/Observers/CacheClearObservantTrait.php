<?php

namespace App\Traits\Observers;

use App\Observers\CacheClearObserver;

trait CacheClearObservantTrait
{
    public static function bootCacheClearObservantTrait()
    {
        static::observe(new CacheClearObserver());
    }
}
