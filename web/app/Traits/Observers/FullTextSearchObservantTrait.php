<?php

namespace App\Traits\Observers;

use App\Observers\FullTextSearchObserver;

trait FullTextSearchObservantTrait
{
    public static function bootFullTextSearchObservantTrait()
    {
        static::observe(new FullTextSearchObserver());
    }
}
