<?php

namespace App\Traits\Pages;

trait EntityTemplate
{
    private function entity()
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
            'name' => 'content_title',
            'label' => 'Título interno de la página',
            'type' => 'text',
            'fake' => true,
            'store_in' => 'extras',
            'placeholder' => 'Título',
            'tab' => $this->content_tab,
        ]);

        $this->crud->addField([
            'name' => 'content_subtitle',
            'label' => 'Subtítulo interno de la página',
            'type' => 'text',
            'fake' => true,
            'store_in' => 'extras',
            'placeholder' => 'Subtítulo',
            'tab' => $this->content_tab,
        ]);
    }
}
