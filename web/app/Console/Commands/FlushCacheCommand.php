<?php

namespace App\Console\Commands;

use App\Http\Controllers\Commands\CacheCommandController;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FlushCacheCommand extends Command
{
    protected $signature = 'flush:cache';

    protected $description = 'Clear Laravel cache';

    public function handle(): void
    {
        (new CacheCommandController())->flushCache();
        Log::channel('cron')->info("Cache cleared successfully");
        $this->info("Cache cleared successfully");
    }
}
