<?php

namespace App\Traits\Admin\Tabs;

use Illuminate\Support\Facades\App;

trait SeoTabFields
{
    public function addSeoTabFields()
    {
        $model = $this->crud->getCurrentEntry();
        $translationLocale = request()->get('_locale') ?? App::currentLocale();

        $this->crud->addField([  // Separator
            'name' => 'seo_explanation',
            'type' => 'custom_html',
            'value' => trans('admin.seo_explanation') . '<hr>',
            'tab' => trans('admin.tab_seo'),
        ]);

        /*Title*/
        $this->crud->addField([
            'name' => 'seo_title',
            'label' => trans('admin.seo_title') . view('vendor.backpack.crud.components.translatable-icon'),
            'value' => $model && $model->seo ? $model->seo->getTranslation('seo_title', $translationLocale) : null,
            'tab' => trans('admin.tab_seo'),
        ]);
        /*Breadcrumb*/
        $this->crud->addField([
            'name' => 'seo_breadcrumb',
            'label' => trans('admin.breadcrumb') . view('vendor.backpack.crud.components.translatable-icon'),
            'value' => $model && $model->seo ? $model->seo->getTranslation('seo_breadcrumb', $translationLocale) : null,
            'tab' => trans('admin.tab_seo'),
        ]);
        /*URL Canonical*/
        $this->crud->addField([
            'name' => 'url_canonical',
            'label' => trans('admin.url_canonical') . view('vendor.backpack.crud.components.translatable-icon'),
            'type' => 'url',
            'value' => $model && $model->seo ? $model->seo->getTranslation('url_canonical', $translationLocale) : null,
            'tab' => trans('admin.tab_seo'),
        ]);
        /*Noindex Nofollow*/
        $this->crud->addField([
            'name' => 'noindex_nofollow',
            'label' => trans('admin.noindex_nofollow'),
            'type' => 'checkbox',
            'value' => $model && $model->seo ? $model->seo->noindex_nofollow : false,
            'tab' => trans('admin.tab_seo'),
        ]);
        /*Metas*/
        $this->crud->addField([   // CustomHTML
            'name' => 'metas_separator',
            'type' => 'custom_html',
            'value' => '<br><h2>' . trans('backpack::pagemanager.metas') . '</h2><hr>',
            'tab' => trans('admin.tab_seo'),
        ]);
        /*Meta Title*/
        $this->crud->addField([
            'name' => 'meta_title',
            'type' => 'hidden',
            'label' => trans('backpack::pagemanager.meta_title') . view('vendor.backpack.crud.components.translatable-icon'),
            'value' => $model && $model->seo ? $model->seo->getTranslation('meta_title', $translationLocale) : null,
            'tab' => trans('admin.tab_seo'),
        ]);
        /*Meta Description*/
        $this->crud->addField([
            'name' => 'meta_description',
            'type' => 'textarea',
            'label' => trans('backpack::pagemanager.meta_description') . view('vendor.backpack.crud.components.translatable-icon'),
            'value' => $model && $model->seo ? $model->seo->getTranslation('meta_description', $translationLocale) : null,
            'tab' => trans('admin.tab_seo'),
        ]);
        /*Meta Keywords*/
        $this->crud->addField([
            'name' => 'meta_keywords',
            'label' => trans('backpack::pagemanager.meta_keywords') . view('vendor.backpack.crud.components.translatable-icon'),
            'value' => $model && $model->seo ? $model->seo->getTranslation('meta_keywords', $translationLocale) : null,
            'tab' => trans('admin.tab_seo'),
        ]);
        /*Sitemap*/
        $this->crud->addField([   // CustomHTML
            'name' => 'sitemap_separator',
            'type' => 'custom_html',
            'value' => '<br><h2>' . trans('admin.sitemap') . '</h2><hr>',
            'tab' => trans('admin.tab_seo'),
        ]);
        /*Sitemap indexable*/
        $this->crud->addField([
            'name' => 'sitemap_indexable',
            'label' => trans('admin.sitemap_indexable'),
            'type' => 'checkbox',
            'value' => $model && $model->seo ? $model->seo->sitemap_indexable : true,
            'default' => true,
            'tab' => trans('admin.tab_seo'),
        ]);
        /*Sitemap priority*/
        $this->crud->addField([
            'name' => 'sitemap_priority',
            'label' => trans('admin.sitemap_priority', ['value' => ($model->seo->sitemap_priority ?? 80)]),
            'type' => 'range',
            'min' => 0,
            'max' => 100,
            'step' => 5,
            'default' => 80,
            'value' => $model && $model->seo ? $model->seo->sitemap_priority : 80,
            'tab' => trans('admin.tab_seo'),
        ], );
        /*Sitemap frequency update*/
        $this->crud->addField([
            'name' => 'sitemap_frequency',
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
            'value' => $model && $model->seo ? $model->seo->sitemap_frequency : 'never',
            'tab' => trans('admin.tab_seo'),
        ]);
        /*OpenGraph*/
        $this->crud->addField([   // CustomHTML
            'name' => 'og_separator',
            'type' => 'custom_html',
            'value' => '<br><h2>' . trans('admin.og') . '</h2><hr>',
            'tab' => trans('admin.tab_seo'),
        ]);
        /*OG Title*/
        $this->crud->addField([
            'name' => 'og_title',
            'label' => trans('admin.og_title') . view('vendor.backpack.crud.components.translatable-icon'),
            'value' => $model && $model->seo ? $model->seo->getTranslation('og_title', $translationLocale) : null,
            'tab' => trans('admin.tab_seo'),
        ]);
        /*OG Description*/
        $this->crud->addField([
            'name' => 'og_description',
            'type' => 'textarea',
            'label' => trans('admin.og_description') . view('vendor.backpack.crud.components.translatable-icon'),
            'value' => $model && $model->seo ? $model->seo->getTranslation('og_description', $translationLocale) : null,
            'tab' => trans('admin.tab_seo'),
        ]);
        /*OG Image*/
        $this->crud->addField([
            'name' => 'og_image',
            'label' => trans('admin.og_image'),
            'type' => 'image',
            'upload' => true,
            'crop' => true, // set to true to allow cropping, false to disable
            'aspect_ratio' => 0, // ommit or set to 0 to allow any aspect ratio
            'value' => $model && $model->seo && !empty($model->seo->og_image) ? url($model->seo->og_image) : null,
            'tab' => trans('admin.tab_seo'),
        ]);
        /*Twitter Cards*/
        $this->crud->addField([   // CustomHTML
            'name' => 'tw_separator',
            'type' => 'custom_html',
            'value' => '<br><h2>' . trans('admin.tw') . '</h2><hr>',
            'tab' => trans('admin.tab_seo'),
        ]);
        /*TW Title*/
        $this->crud->addField([
            'name' => 'tw_title',
            'label' => trans('admin.tw_title') . view('vendor.backpack.crud.components.translatable-icon'),
            'value' => $model && $model->seo ? $model->seo->getTranslation('tw_title', $translationLocale) : null,
            'tab' => trans('admin.tab_seo'),
        ]);
        /*TW Description*/
        $this->crud->addField([
            'name' => 'tw_description',
            'type' => 'textarea',
            'label' => trans('admin.tw_description') . view('vendor.backpack.crud.components.translatable-icon'),
            'value' => $model && $model->seo ? $model->seo->getTranslation('tw_description', $translationLocale) : null,
            'tab' => trans('admin.tab_seo'),
        ]);
        /*TW Image*/
        $this->crud->addField([
            'name' => 'tw_image',
            'label' => trans('admin.tw_image'),
            'type' => 'image',
            'upload' => true,
            'crop' => true, // set to true to allow cropping, false to disable
            'aspect_ratio' => 0, // ommit or set to 0 to allow any aspect ratio
            'value' => $model && $model->seo && !empty($model->seo->tw_image) ? url($model->seo->tw_image) : null,
            'tab' => trans('admin.tab_seo'),
        ]);
    }
}
