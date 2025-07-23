<?php

namespace App\Facades\Btn;

use Illuminate\Support\Facades\Facade;

class BtnFacade extends Facade
{
    protected static function getFacadeAccessor()
    {
        return 'btn';
    }
}
