<?php

namespace App\Http\Resources\Seo;

use App\Traits\Resources\DtoResourceTrait;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SeoResource extends JsonResource
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
        return [
            'id' => (int)$this->id,
            'title' => (string)$this->seo_title_getter,
            'seo_title' => (string)$this->seo_title_getter,
            'seo_breadcrumb' => (string)$this->seo_breadcrumb_getter,
            'url_canonical' => (string)$this->url_canonical,
            'meta_title' => (string)$this->meta_title_getter,
            'meta_description' => (string)$this->meta_description_getter,
            'meta_keywords' => (string)$this->meta_keywords,
            'og_title' => (string)$this->og_title_getter,
            'og_description' => (string)$this->og_description_getter,
            'og_image' => (string)$this->og_image_url_getter,
            'tw_title' => (string)$this->tw_title_getter,
            'tw_description' => (string)$this->tw_description_getter,
            'tw_image' => (string)$this->tw_image_url_getter,
            'noindex_nofollow' => (bool)$this->noindex_nofollow,
            'sitemap_indexable' => (bool)$this->sitemap_indexable,
            'sitemap_priority' => (int)$this->sitemap_priority,
            'sitemap_frequency' => (string)$this->sitemap_frequency,
        ];
    }
}
