<?php

namespace App\Observers;

use App\Models\Seo;

class SeoObserver
{
    public function saved($object)
    {
        $inputArray = [];
        if (request() && request()->get('_save_action')) {
            $inputArray['seo_title'] = request()->get('seo_title');
            $inputArray['seo_breadcrumb'] = request()->get('seo_breadcrumb');
            $inputArray['url_canonical'] = request()->get('url_canonical');
            $inputArray['meta_title'] = request()->get('meta_title');
            $inputArray['meta_description'] = request()->get('meta_description');
            $inputArray['meta_keywords'] = request()->get('meta_keywords');
            $inputArray['og_title'] = request()->get('og_title');
            $inputArray['og_description'] = request()->get('og_description');
            $inputArray['tw_title'] = request()->get('tw_title');
            $inputArray['tw_description'] = request()->get('tw_description');
            $inputArray['noindex_nofollow'] = request()->get('noindex_nofollow') ?? false;
            $inputArray['sitemap_indexable'] = request()->get('sitemap_indexable') ?? true;
            $inputArray['sitemap_frequency'] = request()->get('sitemap_frequency') ?? 'never';
            $inputArray['sitemap_priority'] = request()->get('sitemap_priority') ?? 80;
            $inputArray['og_image'] = request()->get('og_image');
            $inputArray['tw_image'] = request()->get('tw_image');

            Seo::updateOrCreate([
                'seoable_id' => $object->id,
                'seoable_type' => 'App\Models\\' . getClassName($object),
            ], $inputArray);
        }
    }

    public function deleted($object): void
    {
        Seo::where('seoable_id', $object->id)
            ->where('seoable_type', 'App\Models\\' . getClassName($object))
            ->delete();
    }
}
