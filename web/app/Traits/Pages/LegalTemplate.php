<?php

namespace App\Traits\Pages;

trait LegalTemplate
{
    private function legal()
    {
        $this->base();
        $this->seo();

        $this->crud->addField([
            'name' => 'content_content',
            'label' => trans('backpack::pagemanager.content'),
            'type' => 'ckeditor',
            'placeholder' => trans('backpack::pagemanager.content_placeholder'),
            'fake' => true,
            'store_in' => 'content',
            'tab' => $this->content_tab,
        ]);
    }
}
