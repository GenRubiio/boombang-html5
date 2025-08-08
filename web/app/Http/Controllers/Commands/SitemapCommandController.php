<?php

namespace App\Http\Controllers\Commands;

use Carbon\Carbon;
use App\Models\Page;
use App\Models\BlogArticle;
use Illuminate\Support\Facades\App;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;
use Exception;

class SitemapCommandController extends Controller
{
    private static $availableLocales;
    private static $sitemap;
    private static $defaultLocale;
    private static $dia;
    private static $semana;
    private static $mes;

    public function __construct()
    {
        self::$availableLocales = LaravelLocalization::getSupportedLocales();
        self::$sitemap = Sitemap::create();
        self::$defaultLocale = config('app.locale');
        self::$dia = 86400;
        self::$semana = self::$dia * 7;
        self::$mes = self::$dia * 30;
    }

    public function sitemapGenerate()
    {
        if (App::environment() !== 'production') {
            return;
        }
        $this->generatePages();
        $this->generateArticles('News');
        $this->generateSeo([
            //'Categories' => "App\Models\Category", // Example
        ]);
        $this->saveSitemap();
    }

    /**
     * Functions to take info
     */

    public function generatePages()
    {
        $pagesFirstLevel = Page::active()->whereNull('parent_id')->get();
        $pagesSecondLevel = Page::active()->whereNotNull('parent_id')->get();
        foreach (self::$availableLocales as $key => $language) {
            LaravelLocalization::setLocale($key);
            $this->addPagesToSitemap($pagesFirstLevel);
            $this->addPagesToSitemap($pagesSecondLevel);
        }
    }

    public function generateArticles($pageNewsName)
    {
        $pageNews = Page::whereName($pageNewsName)->active()->first();
        if (!is_null($pageNews)) {
            $pageNews = $pageNews->withFakes();
            if ($pageNews->sitemap_indexable) {
                $articles = BlogArticle::published()->datePast()->get();
                foreach (self::$availableLocales as $key => $language) {
                    LaravelLocalization::setLocale($key);
                    $this->addNewsToSitemap($articles, $pageNews);
                }
            }
        }
    }

    public function generateSeo($pages)
    {
        foreach ($pages as $page => $model) {
            $page = Page::whereName($page)->active()->first();
            if (!is_null($page)) {
                $page = $page->withFakes();
                if ($page->sitemap_indexable) {
                    $items = $model::active()->get();
                    foreach (self::$availableLocales as $key => $language) {
                        LaravelLocalization::setLocale($key);
                        $this->addSeoToSitemap($items, $page);
                    }
                }
            }
        }
    }

    /**
     * Functions to prepare adds
     */

    public function addNewsToSitemap($articles, $pageNews)
    {
        foreach ($articles as $article) {
            $routeNews = $this->makeUrl($pageNews);
            $route = $routeNews . '/' . $article->slug;

            $antiguity = $this->calculateAccordingToAntiguity($article->date);
            $priority = $antiguity['priority'];
            $frequency = $antiguity['frequency'];
            if (is_null($article->updated_at)) {
                $article->updated_at = Carbon::now();
            }
            $lastMod = Carbon::createFromFormat(
                'Y-m-d H:i:s',
                $article->updated_at
            ); //->format('Y-m-d\TH:i:sP T');

            $this->addRouteToSitemap($route, $lastMod, $priority, $frequency);
        }
    }

    public function addPagesToSitemap($pages)
    {
        foreach ($pages as $page) {
            $pageWithFakes = $page->withFakes();
            if ($pageWithFakes->sitemap_indexable) {
                $route = $this->makeUrl($pageWithFakes);

                $priority = $pageWithFakes->sitemap_priority / 100;
                $frequency = (string)$pageWithFakes->sitemap_changefreq;
                if (is_null($pageWithFakes->updated_at)) {
                    $pageWithFakes->updated_at = Carbon::now();
                }
                $lastMod = Carbon::createFromFormat(
                    'Y-m-d H:i:s',
                    $pageWithFakes->updated_at
                );

                $this->addRouteToSitemap($route, $lastMod, $priority, $frequency);
            }
        }
    }

    public function addSeoToSitemap($items, $page)
    {
        foreach ($items as $item) {
            $route = $this->makeUrl($page);
            $route = $route . '/' . $item->slug;
            $priority = $item->seo ? $item->seo->sitemap_priority / 100 : 1;
            $frequency = $item->seo ? $item->seo->sitemap_frequency : 'never';
            if (is_null($item->updated_at)) {
                $item->updated_at = Carbon::now();
            }
            $lastMod = Carbon::createFromFormat(
                'Y-m-d H:i:s',
                $item->updated_at
            );
            $this->addRouteToSitemap($route, $lastMod, $priority, $frequency);
        }
    }

    /**
     * Functions to use in Sitemap
     */

    public function saveSitemap()
    {
        self::$sitemap->writeToFile(public_path('sitemap.xml'));
    }

    public function addRouteToSitemap($route, $lastMod, $priority, $frequency)
    {
        $route = Url::create($route);
        if ($route->url == "") {
            $route = Url::create('/');
        }
        $this->validateUrl(url($route->url));
        self::$sitemap->add($route
            ->setLastModificationDate($lastMod)
            ->setChangeFrequency($frequency)
            ->setPriority($priority));
    }

    private function validateUrl($route)
    {
        if (App::environment() === 'production') {
            try {
                $response = Http::get($route);
                if (!$response->successful()) {
                    Log::channel('sitemap')->error("La URL '" . $route . "' no es válida");
                }
            } catch (Exception $e) {
                Log::channel('sitemap')->error("Hubo un error al intentar acceder a la URL: " . $e->getMessage());
            }
        }
    }

    public function makeUrl($page)
    {
        $url = "";
        if (!is_null($page->parent_id)) {
            $url = Page::find($page->parent_id)->slug . '/';
        }
        $url .= $page->slug;
        $route = LaravelLocalization::localizeUrl(($page->slug == 'home' ? url('') : url($url)));
        return str_replace(env('APP_URL'), '', $route);
    }

    public function calculateAccordingToAntiguity($date)
    {
        $antiguityPost = time() - strtotime($date);
        $priority = 0.1;
        $frequency = 'monthly';

        if ($antiguityPost <= self::$dia) {
            $priority = 1;
            $frequency = 'daily';
        } elseif ($antiguityPost <= self::$semana) {
            $priority = 0.95;
            $frequency = 'daily';
        } elseif ($antiguityPost <= self::$mes) {
            $priority = 0.9;
            $frequency = 'weekly';
        } elseif ($antiguityPost <= self::$mes * 2) {
            $priority = 0.85;
            $frequency = 'weekly';
        } elseif ($antiguityPost <= self::$mes * 3) {
            $priority = 0.8;
        } elseif ($antiguityPost <= self::$mes * 6) {
            $priority = 0.7;
        } elseif ($antiguityPost <= self::$mes * 12) {
            $priority = 0.5;
        } elseif ($antiguityPost <= self::$mes * 24) {
            $priority = 0.2;
        }

        return [
            'priority' => $priority,
            'frequency' => $frequency,
        ];
    }
}
