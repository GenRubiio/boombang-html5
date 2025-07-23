<?php

namespace App\Observers;

use App\Http\Controllers\Commands\SitemapCommandController;

class SitemapObserver
{
    public function updated()
    {
        (new SitemapCommandController())->sitemapGenerate();
    }
}
