<?php

namespace App\Traits\Pages\Partials;

trait SeoTemplate
{
    protected function seo()
    {
        /*Title*/
        $this->crud->addField([
            'name' => 'page_title',
            'label' => trans('admin.page_title'),
            'fake' => true,
            'store_in' => 'extras',
            'tab' => $this->seo_tab,
        ]);
        /*Breadcrumb*/
        $this->crud->addField([
            'name' => 'breadcrumb',
            'label' => trans('admin.breadcrumb'),
            'fake' => true,
            'store_in' => 'extras',
            'tab' => $this->seo_tab,
        ]);
        /*URL Canonical*/
        $this->crud->addField([
            'name' => 'url_canonical',
            'label' => trans('admin.url_canonical'),
            'type' => 'url',
            'fake' => true,
            'store_in' => 'extras',
            'tab' => $this->seo_tab,
        ]);
        /*Noindex Nofollow*/
        $this->crud->addField([
            'name' => 'noindex_nofollow',
            'label' => trans('admin.noindex_nofollow'),
            'type' => 'checkbox',
            'fake' => true,
            'store_in' => 'extras_no_translatable',
            'tab' => $this->seo_tab,
        ]);


        /*Metas*/
        $this->crud->addField([   // CustomHTML
            'name' => 'metas_separator',
            'type' => 'custom_html',
            'value' => '<br><h2>' . trans('backpack::pagemanager.metas') . '</h2><hr>',
            'tab' => $this->seo_tab,
        ]);
        /*Meta Title*/
        $this->crud->addField([
            'name' => 'meta_title',
            'label' => trans('backpack::pagemanager.meta_title'),
            'fake' => true,
            'store_in' => 'extras',
            'tab' => $this->seo_tab,
        ]);
        /*Meta Description*/
        $this->crud->addField([
            'name' => 'meta_description',
            'type' => 'textarea',
            'label' => trans('backpack::pagemanager.meta_description'),
            'fake' => true,
            'store_in' => 'extras',
            'tab' => $this->seo_tab,
        ]);
        /*Meta Keywords*/
        $this->crud->addField([
            'name' => 'meta_keywords',
            'label' => trans('backpack::pagemanager.meta_keywords'),
            'fake' => true,
            'store_in' => 'extras',
            'tab' => $this->seo_tab,
        ]);

        /*Sitemap*/
        $this->crud->addField([   // CustomHTML
            'name' => 'sitemap_separator',
            'type' => 'custom_html',
            'value' => '<br><h2>' . trans('admin.sitemap') . '</h2><hr>',
            'tab' => $this->seo_tab,
        ]);
        /*Sitemap indexable*/
        $this->crud->addField([
            'name' => 'sitemap_indexable',
            'label' => trans('admin.sitemap_indexable'),
            'type' => 'checkbox',
            'default' => true,
            'fake' => true,
            'store_in' => 'extras_no_translatable',
            'tab' => $this->seo_tab,
        ]);
        /*Sitemap priority*/
        $this->crud->addField([
            'name' => 'sitemap_priority',
            'label' => trans('admin.sitemap_priority', ['value' => ($this->crud->entry->sitemap_priority ?? 80)]),
            'type' => 'range',
            'min' => 0,
            'max' => 100,
            'step' => 5,
            'default' => 80,
            'fake' => true,
            'store_in' => 'extras_no_translatable',
            'tab' => $this->seo_tab,
        ]);
        /*Sitemap frequency update*/
        $this->crud->addField([
            'name' => 'sitemap_changefreq',
            'label' => trans('admin.sitemap_changefreq'),
            'type' => 'select_from_array',
            'options' => [
                'always' => 'Siempre',
                'hourly' => 'Cada hora',
                'daily' => 'Diaria',
                'weekly' => 'Semanal',
                'monthly' => 'Mensual',
                'yearly' => 'Anual',
                'never' => 'Nunca'
            ],
            'allows_null' => false,
            'default' => 'weekly',
            'fake' => true,
            'store_in' => 'extras_no_translatable',
            'tab' => $this->seo_tab,
        ]);

        /*
         * https://www.flimper.com/blog/es/que-es-open-graph-y-como-se-hace
         */
        /*OpenGraph*/
        $this->crud->addField([   // CustomHTML
            'name' => 'og_separator',
            'type' => 'custom_html',
            'value' => '<br><h2>' . trans('admin.og') . '</h2><hr>',
            'tab' => $this->seo_tab,
        ]);
        /*OG Title*/
        $this->crud->addField([
            'name' => 'og_title',
            'label' => trans('admin.og_title'),
            'fake' => true,
            'store_in' => 'extras',
            'tab' => $this->seo_tab,
        ]);
        /*OG Description*/
        $this->crud->addField([
            'name' => 'og_description',
            'type' => 'textarea',
            'label' => trans('admin.og_description'),
            'fake' => true,
            'store_in' => 'extras',
            'tab' => $this->seo_tab,
        ]);
        /*OG Image*/
        $this->crud->addField([
            'name' => 'og_image',
            'label' => trans('admin.og_image'),
            'type' => 'image',
            'upload' => true,
            'crop' => true, // set to true to allow cropping, false to disable
            'aspect_ratio' => 0, // ommit or set to 0 to allow any aspect ratio
            'tab' => $this->seo_tab,
        ]);

        /*Twitter Cards*/
        $this->crud->addField([   // CustomHTML
            'name' => 'tw_separator',
            'type' => 'custom_html',
            'value' => '<br><h2>' . trans('admin.tw') . '</h2><hr>',
            'tab' => $this->seo_tab,
        ]);
        /*TW Title*/
        $this->crud->addField([
            'name' => 'tw_title',
            'label' => trans('admin.tw_title'),
            'fake' => true,
            'store_in' => 'extras',
            'tab' => $this->seo_tab,
        ]);
        /*TW Description*/
        $this->crud->addField([
            'name' => 'tw_description',
            'type' => 'textarea',
            'label' => trans('admin.tw_description'),
            'fake' => true,
            'store_in' => 'extras',
            'tab' => $this->seo_tab,
        ]);
        /*TW Image*/
        $this->crud->addField([
            'name' => 'tw_image',
            'label' => trans('admin.tw_image'),
            'type' => 'image',
            'upload' => true,
            'crop' => true, // set to true to allow cropping, false to disable
            'aspect_ratio' => 0, // ommit or set to 0 to allow any aspect ratio
            'tab' => $this->seo_tab,
        ]);
    }
}
