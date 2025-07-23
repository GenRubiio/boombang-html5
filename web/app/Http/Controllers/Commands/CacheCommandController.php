<?php

namespace App\Http\Controllers\Commands;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Artisan;

class CacheCommandController extends Controller
{
    public function flushCache(): void
    {
        clearCache();
        Artisan::call('config:clear');
        Artisan::call('route:clear');
        Artisan::call('cache:clear');
        Artisan::call('view:clear');
        Artisan::call('config:cache');
    }
}
