<?php

namespace App\Traits\Pages;

trait LegalTemplate
{
    private function legal()
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
        $this->crud->addField([
            'name' => 'content_content',
            'label' => trans('backpack::pagemanager.content'),
            'type' => 'ckeditor',
            'options' => [
                'toolbar' => [
                    'heading',
                    'bold',
                    'italic',
                    'link',
                    'bulletedList',
                    'numberedList',
                    '|',
                    'blockQuote',
                    'codeBlock',
                    'insertTable',
                    'undo',
                    'redo',
                    '|',
                    'htmlEmbed',
                    'sourceEditing' // <-- botones clave
                ],
                // General HTML Support: permitir “todo” (ajústalo a tus necesidades)
                'htmlSupport' => [
                    'allow' => [[
                        'name' => '.*',          // cualquier etiqueta
                        'attributes' => true,    // cualquier atributo
                        'classes' => true,       // cualquier clase
                        'styles' => true         // cualquier estilo inline
                    ]]
                ],
                // Config extra de HtmlEmbed si quieres
                'htmlEmbed' => [
                    'showPreviews' => true // vista previa del HTML embebido
                ],
            ],
            'placeholder' => trans('backpack::pagemanager.content_placeholder'),
            'fake' => true,
            'store_in' => 'content',
            'tab' => $this->content_tab,
        ]);
    }
}
