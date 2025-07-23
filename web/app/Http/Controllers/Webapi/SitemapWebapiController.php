<?php

namespace App\Http\Controllers\Webapi;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Commands\SitemapCommandController as CommandSitemapController;

class SitemapWebapiController extends Controller
{
    public function sitemapGenerate()
    {
        (new CommandSitemapController())->sitemapGenerate();
        return view('commands.sitemap-generate');
    }
}
