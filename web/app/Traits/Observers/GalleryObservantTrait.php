<?php

namespace App\Traits\Observers;

use App\Observers\GalleryObserver;

trait GalleryObservantTrait
{
    public static function bootGalleryObservantTrait()
    {
        static::observe(new GalleryObserver());
    }
}
