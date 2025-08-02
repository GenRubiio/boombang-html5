<?php

namespace App\Traits\Pages;

trait SecurityTemplate
{
    private function security()
    {
        $this->base();
        $this->seo();

         $this->crud->addField([
            'name' => 'content_header_image',
            'label' => 'Header Image',
            'fake' => true,
            'store_in' => 'content_no_translatable',
            'type' => 'image',
            'upload' => true,
            'crop' => true,
            'aspect_ratio' => 0,
            'hint' => trans('admin.hint_image_or_svg'),
            'tab' => $this->content_tab,
        ]);
        $this->crud->addField([
            'name' => 'content_button_image',
            'label' => 'Button Image',
            'fake' => true,
            'store_in' => 'content_no_translatable',
            'type' => 'image',
            'hint' => trans('admin.hint_image_or_svg'),
            'tab' => $this->content_tab,
        ]);
        $this->crud->addField([
            'name' => 'content_title',
            'label' => 'Title',
            'type' => 'text',
            'fake' => true,
            'store_in' => 'content',
            'tab' => $this->content_tab,
        ]);
    }
}
