<?php

namespace App\Traits\Pages;

trait LegalTemplate
{
    private function legal()
    {
        $this->base();

        $this->seo();

        $this->crud->addField([
            'name' => 'content',
            'label' => trans('backpack::pagemanager.content'),
            'type' => 'custom_textarea',
            'placeholder' => trans('backpack::pagemanager.content_placeholder'),
            'tab' => $this->content_tab,
        ]);
    }
}
