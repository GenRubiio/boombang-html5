<?php

namespace App\Http\Controllers\Webapi;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Commands\CacheCommandController as CommandCacheController;

class CacheWebapiController extends Controller
{
    public function flushCache()
    {
        (new CommandCacheController())->flushCache();
        return view('commands.flush-cache');
    }
}
