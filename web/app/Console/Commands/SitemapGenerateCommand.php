<?php

namespace App\Console\Commands;

use App\Http\Controllers\Commands\SitemapCommandController;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SitemapGenerateCommand extends Command
{
    protected $signature = 'sitemap:generate';

    protected $description = 'Generate sitemap.xml from url stored in database';

    public function handle(): void
    {
        (new SitemapCommandController())->sitemapGenerate();
        $message = "Sitemap generate successfully";
        Log::channel('cron')->info($message);
        $this->info($message);
    }
}
