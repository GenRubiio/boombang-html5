<?php

namespace App\Traits\Observers;

use App\Observers\SitemapObserver;

trait SitemapObservantTrait
{
    public static function bootSitemapObservantTrait()
    {
        static::observe(new SitemapObserver());
    }
}
