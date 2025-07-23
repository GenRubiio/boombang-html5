<?php

namespace App\Traits\Observers;

use App\Observers\GenerateStringIdObserver;

trait GenerateStringIdObservantTrait
{
    public static function bootGenerateStringIdObservantTrait()
    {
        static::observe(new GenerateStringIdObserver());
    }
}
