<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BlogArticle;
use App\Models\Page;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;
use Carbon\Carbon;

class GenerateNewsSitemap extends Command
{
    /**
     * Nombre y firma del comando.
     *
     * @var string
     */
    protected $signature = 'sitemap:news';

    /**
     * Descripción del comando.
     *
     * @var string
     */
    protected $description = 'Genera sitemap de Google News con artículos de las últimas 48h, imagen e hreflang';

    public function handle()
    {
        // Ruta de guardado
        $filePath = public_path('sitemap-news.xml');

        // Crear XML base con namespaces (news, image, xhtml)
        $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><urlset/>');
        $xml->addAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
        $xml->addAttribute('xmlns:news', 'http://www.google.com/schemas/sitemap-news/0.9');
        $xml->addAttribute('xmlns:image', 'http://www.google.com/schemas/sitemap-image/1.1');
        $xml->addAttribute('xmlns:xhtml', 'http://www.w3.org/1999/xhtml');

        // Artículos últimos 2 días (máx 1000)
        $articles = BlogArticle::published()
            ->where('date', '>=', Carbon::now()->subDays(2))
            ->orderBy('date', 'desc')
            ->take(1000)
            ->get();

        if ($articles->isEmpty()) {
            $this->warn('No hay artículos publicados en las últimas 48 horas.');
            return Command::SUCCESS;
        }

        // Locales soportados (ej: es, en)
        $locales = array_keys(LaravelLocalization::getSupportedLocales());

        // Página "News" (raíz de artículos) por cada locale
        $newsPagesByLocale = [];
        foreach ($locales as $locale) {
            LaravelLocalization::setLocale($locale);
            $page = Page::whereName('News')->active()->first();
            if ($page) {
                $newsPagesByLocale[$locale] = $page;
            }
        }

        // Para cada artículo, generamos una entrada por locale
        foreach ($articles as $article) {
            foreach ($locales as $locale) {
                // Solo si existe página News en ese locale
                if (!isset($newsPagesByLocale[$locale])) {
                    continue;
                }

                LaravelLocalization::setLocale($locale);
                $pageNews = $newsPagesByLocale[$locale];

                // URL canon del artículo en este locale
                $loc = LaravelLocalization::localizeUrl(
                    $this->makeUrl($pageNews) . '/' . $article->slug
                );

                $url = $xml->addChild('url');
                $url->addChild('loc', htmlspecialchars($loc, ENT_QUOTES | ENT_XML1));

                // Bloque Google News
                $news = $url->addChild('news:news', null, 'http://www.google.com/schemas/sitemap-news/0.9');
                $publication = $news->addChild('news:publication', null, 'http://www.google.com/schemas/sitemap-news/0.9');

                // Nombre del "medio" (ajústalo si usas otro)
                $publication->addChild('news:name', 'BoomMania', 'http://www.google.com/schemas/sitemap-news/0.9');

                // Idioma: usa código corto (es, en)
                $publication->addChild('news:language', $locale, 'http://www.google.com/schemas/sitemap-news/0.9');

                // Fecha de publicación en formato Atom (ISO-8601)
                $news->addChild(
                    'news:publication_date',
                    Carbon::parse($article->date)->toAtomString(),
                    'http://www.google.com/schemas/sitemap-news/0.9'
                );

                // Título del artículo
                $news->addChild(
                    'news:title',
                    htmlspecialchars((string)($article->title ?? ''), ENT_QUOTES | ENT_XML1),
                    'http://www.google.com/schemas/sitemap-news/0.9'
                );

                // Hreflang alternates (ES/EN) para esta URL
                foreach ($locales as $altLocale) {
                    if (!isset($newsPagesByLocale[$altLocale])) {
                        continue;
                    }
                    LaravelLocalization::setLocale($altLocale);
                    $altPageNews = $newsPagesByLocale[$altLocale];
                    $altHref = LaravelLocalization::localizeUrl(
                        $this->makeUrl($altPageNews) . '/' . $article->slug
                    );

                    // <xhtml:link rel="alternate" hreflang="xx" href="..."/>
                    $xhtml = $url->addChild('xhtml:link', null, 'http://www.w3.org/1999/xhtml');
                    $xhtml->addAttribute('rel', 'alternate');
                    $xhtml->addAttribute('hreflang', $altLocale);
                    $xhtml->addAttribute('href', htmlspecialchars($altHref, ENT_QUOTES | ENT_XML1));
                }

                // Opcional: x-default (apunta a ES, EN o a una landing neutra si la tienes)
                if (isset($newsPagesByLocale['en'])) {
                    LaravelLocalization::setLocale('en');
                    $xDefaultHref = LaravelLocalization::localizeUrl(
                        $this->makeUrl($newsPagesByLocale['en']) . '/' . $article->slug
                    );
                    $xhtmlDefault = $url->addChild('xhtml:link', null, 'http://www.w3.org/1999/xhtml');
                    $xhtmlDefault->addAttribute('rel', 'alternate');
                    $xhtmlDefault->addAttribute('hreflang', 'x-default');
                    $xhtmlDefault->addAttribute('href', htmlspecialchars($xDefaultHref, ENT_QUOTES | ENT_XML1));
                }

                // Imagen destacada (si existe)
                $imageUrl = $this->getArticleImageUrl($article);
                if ($imageUrl) {
                    $image = $url->addChild('image:image', null, 'http://www.google.com/schemas/sitemap-image/1.1');
                    $image->addChild('image:loc', htmlspecialchars($imageUrl, ENT_QUOTES | ENT_XML1), 'http://www.google.com/schemas/sitemap-image/1.1');

                    // Caption opcional
                    $caption = $this->getArticleImageCaption($article);
                    if ($caption) {
                        $image->addChild('image:caption', htmlspecialchars($caption, ENT_QUOTES | ENT_XML1), 'http://www.google.com/schemas/sitemap-image/1.1');
                    }
                }
            }
        }

        // Guardar archivo
        $xmlString = $xml->asXML();
        file_put_contents($filePath, $xmlString);

        $this->info("✅ Sitemap de noticias generado: {$filePath}");
        return Command::SUCCESS;
    }

    /**
     * Construye la URL base de la página (respeta padre/hijo)
     */
    private function makeUrl($page)
    {
        $url = '';
        if (!is_null($page->parent_id)) {
            $url = Page::find($page->parent_id)->slug . '/';
        }
        $url .= $page->slug;
        return ($page->slug == 'home') ? url('') : url($url);
    }

    /**
     * Intenta resolver la URL absoluta de la imagen destacada del artículo.
     * Ajusta la lógica a tu modelo si usas otro campo.
     */
    private function getArticleImageUrl($article): ?string
    {
        $candidates = [
            $article->image ?? null,
            $article->cover ?? null,
            $article->featured_image ?? null,
        ];

        foreach ($candidates as $path) {
            if (!$path) continue;

            // Si ya es absoluta, úsala
            if (preg_match('#^https?://#i', $path)) {
                return $path;
            }

            // Generar absoluta a partir de path relativo
            return url($path);
        }

        return null;
    }

    /**
     * Devuelve un caption para la imagen si existe (opcional).
     * Ajusta a tu esquema (ej. $article->image_caption o $article->title).
     */
    private function getArticleImageCaption($article): ?string
    {
        if (!empty($article->image_caption)) {
            return (string) $article->image_caption;
        }

        // Por defecto, usa el título del artículo como caption
        return !empty($article->title) ? (string) $article->title : null;
    }
}
