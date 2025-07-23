<?php

namespace App\Facades\Picture;

use Illuminate\Support\Facades\Facade;

class PictureFacade extends Facade
{
    protected static function getFacadeAccessor()
    {
        return 'picture';
    }
}
