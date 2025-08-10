<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BlogArticle;
use App\Models\Page;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class GenerateNewsSitemap extends Command
{
    protected $signature = 'sitemap:news';
    protected $description = 'Genera sitemap de Google News con artículos de las últimas 48h';

    public function handle()
    {
        $filePath = public_path('sitemap-news.xml');

        // Crear XML base con namespaces
        $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><urlset/>');
        $xml->addAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
        $xml->addAttribute('xmlns:news', 'http://www.google.com/schemas/sitemap-news/0.9');
        $xml->addAttribute('xmlns:image', 'http://www.google.com/schemas/sitemap-image/1.1');

        $articles = BlogArticle::published()
            ->where('date', '>=', Carbon::now()->subDays(2))
            ->orderBy('date', 'desc')
            ->take(1000)
            ->get();

        if ($articles->isEmpty()) {
            $this->warn('No hay artículos publicados en las últimas 48 horas.');
            return Command::SUCCESS;
        }

        foreach (LaravelLocalization::getSupportedLocales() as $locale => $langData) {
            LaravelLocalization::setLocale($locale);

            $pageNews = Page::whereName('News')->active()->first();
            if (!$pageNews) {
                continue;
            }

            foreach ($articles as $article) {
                $url = $xml->addChild('url');
                $loc = LaravelLocalization::localizeUrl(
                    $this->makeUrl($pageNews) . '/' . $article->slug
                );
                $url->addChild('loc', htmlspecialchars($loc));

                // Bloque Google News
                $news = $url->addChild('news:news', null, 'http://www.google.com/schemas/sitemap-news/0.9');
                $publication = $news->addChild('news:publication', null, 'http://www.google.com/schemas/sitemap-news/0.9');
                $publication->addChild('news:name', 'BoomMania', 'http://www.google.com/schemas/sitemap-news/0.9');
                $publication->addChild('news:language', $locale, 'http://www.google.com/schemas/sitemap-news/0.9');

                $news->addChild('news:publication_date', Carbon::parse($article->date)->toAtomString(), 'http://www.google.com/schemas/sitemap-news/0.9');
                $news->addChild('news:title', htmlspecialchars($article->title), 'http://www.google.com/schemas/sitemap-news/0.9');

                // Imagen
                if (!empty($article->image)) {
                    $imageUrl = asset($article->image);
                    $image = $url->addChild('image:image', null, 'http://www.google.com/schemas/sitemap-image/1.1');
                    $image->addChild('image:loc', htmlspecialchars($imageUrl), 'http://www.google.com/schemas/sitemap-image/1.1');
                    $image->addChild('image:title', htmlspecialchars($article->title), 'http://www.google.com/schemas/sitemap-image/1.1');
                }
            }
        }

        file_put_contents($filePath, $xml->asXML());

        $this->info("✅ Sitemap de noticias generado: {$filePath}");
        Log::channel('sitemap_news')->info("Sitemap de noticias generado: {$filePath}");
        return Command::SUCCESS;
    }

    private function makeUrl($page)
    {
        $url = '';
        if (!is_null($page->parent_id)) {
            $url = Page::find($page->parent_id)->slug . '/';
        }
        $url .= $page->slug;
        return ($page->slug == 'home') ? url('') : url($url);
    }
}
