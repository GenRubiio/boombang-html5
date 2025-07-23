<?php

namespace App\Http\Resources\Page;

use App\Traits\Resources\DtoResourceTrait;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PageResource extends JsonResource
{
    use DtoResourceTrait;

    private static $data;

    public function __construct($resource)
    {
        parent::__construct($resource);
        self::$data = $resource;
    }

    public function toArray(Request $request): array
    {
        $extras = $this->extras_decoded;
        $extrasNoTranslatable = $this->extras_no_translatable_decoded;
        $fullContent = $this->getFullContent($this->content_decoded, $this->content_no_translatable_decoded);
        $metas = $this->getMetas($extras);

        $return = [
            'id' => (int)$this->id,
            'name' => (string)$this->name,
            'slug' => (string)$this->slug,
            'metas' => $metas,
            'sitemap' => [
                'noindex_nofollow' => (string)optional($extrasNoTranslatable)->noindex_nofollow,
                'sitemap_indexable' => (string)optional($extrasNoTranslatable)->sitemap_indexable,
                'sitemap_priority' => (string)optional($extrasNoTranslatable)->sitemap_priority,
                'sitemap_changefreq' => (string)optional($extrasNoTranslatable)->sitemap_changefreq,
            ],
            'content' => (array)$fullContent,
        ];

        if (debug_backtrace()[1]['function'] == "toDTO") {
            $return = (array)convertRecursiveArrayToCollection($return);
        }
        return $return;
    }

    private function getFullContent($content = [], $contentNoTranslatable = []): array
    {
        $fullContent = $content + $contentNoTranslatable;
        foreach ($fullContent as $fullContentKey => $fullContentValue) {
            if (str_contains($fullContentKey, '_repeatable') && (is_array($fullContentValue) || is_object($fullContentValue))) {
                foreach ($fullContentValue as $contentValue) {
                    foreach ($contentValue as $itemKey => $itemValue) {
                        if (!empty($itemValue) && in_array($itemKey, ['icon', 'image', 'logo'])) {
                            $contentValue->{$itemKey} = url($itemValue);
                        }
                    }
                }
            }
        }
        return $fullContent;
    }

    private function getMetas($extras)
    {
        $metas = [];
        $defaultImage = $this->content_no_translatable_decoded['header_image'] ?? null;
        $metas['og_image'] = (string)($this->og_image_url ?? $defaultImage);
        $metas['tw_image'] = (string)($this->tw_image_url ?? $defaultImage);
        if (is_null($extras)) {
            return $metas;
        }

        $defaultTitle = strip_tags($this->title ?? '');
        $defaultDescription = strip_tags($this->content_decoded['content_short_description'] ?? $this->content_decoded['content_description'] ?? '');
        $seo = [
            'title' => (string)($extras->page_title ?? $defaultTitle),
            'url_canonical' => (string)$extras->url_canonical,
            'breadcrumb' => (string)($extras->breadcrumb ?? $defaultTitle),
            'meta_title' => (string)($extras->meta_title ?? $extras->page_title ?? $defaultTitle),
            'meta_description' => (string)($extras->meta_description ?? $defaultDescription),
            'meta_keywords' => (string)$extras->meta_keywords,
            'og_title' => (string)($extras->og_title ?? $extras->meta_title ?? $extras->page_title ?? $extras->title ?? $defaultTitle),
            'og_description' => (string)($extras->og_description ?? $extras->meta_description ?? $defaultDescription),
            'tw_title' => (string)($extras->tw_title ?? $extras->meta_title ?? $extras->page_title ?? $extras->title ?? $defaultTitle),
            'tw_description' => (string)($extras->tw_description ?? $extras->meta_description ?? $defaultDescription),
        ];
        return $metas + $seo;
    }
}
