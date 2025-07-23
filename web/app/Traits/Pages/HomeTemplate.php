<?php

namespace App\Traits\Pages;

trait HomeTemplate
{
    private function home()
    {
        $this->base();

        $this->seo();

        $this->crud->addField([   // CustomHTML
            'name' => 'content_separator',
            'type' => 'custom_html',
            'value' => '<br><h2>' . trans('backpack::pagemanager.content') . '</h2><hr>',
            'tab' => $this->content_tab,
        ]);
        $this->crud->addField([
            'name' => 'content',
            'label' => trans('backpack::pagemanager.content'),
            'type' => 'custom_textarea',
            'placeholder' => trans('backpack::pagemanager.content_placeholder'),
            'tab' => $this->content_tab,
        ]);
        $this->crud->addField([
            'name' => 'main_image',
            'label' => trans('admin.main_image'),
            'type' => 'image',
            'upload' => true,
            'crop' => true, // set to true to allow cropping, false to disable
            'aspect_ratio' => 2, // ommit or set to 0 to allow any aspect ratio
            // 'disk' => 's3_bucket', // in case you need to show images from a different disk
            // 'prefix' => 'uploads/images/profile_pictures/' // in case your db value is only the file name (no path), you can use this to prepend your path to the image src (in HTML), before it's shown to the user;
            'tab' => $this->content_tab,
        ]);

        $this->multimedia(1, 1, 1);
    }
}
