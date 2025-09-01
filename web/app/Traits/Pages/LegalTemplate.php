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
                // --- BARRA COMPLETA (puedes ajustar el orden) ---
                'toolbar' => [
                    'undo',
                    'redo',
                    '|',
                    'sourceEditing',
                    '|',
                    'selectAll',
                    'findAndReplace',
                    '|',
                    'heading',
                    'style',
                    'fontSize',
                    'fontFamily',
                    'fontColor',
                    'fontBackgroundColor',
                    '|',
                    'bold',
                    'italic',
                    'underline',
                    'strikethrough',
                    'removeFormat',
                    'subscript',
                    'superscript',
                    'highlight',
                    'code',
                    '|',
                    'link',
                    'autoLink',
                    'blockQuote',
                    'codeBlock',
                    'htmlEmbed',
                    'mediaEmbed',
                    '|',
                    'bulletedList',
                    'numberedList',
                    'todoList',
                    'outdent',
                    'indent',
                    'alignment',
                    '|',
                    'insertTable',
                    'tableColumn',
                    'tableRow',
                    'mergeTableCells',
                    'tableProperties',
                    'tableCellProperties',
                    '|',
                    'horizontalLine',
                    'pageBreak',
                    'specialCharacters'
                ],

                // --- PERMITIR CUALQUIER HTML/ATRIBUTO/CLASE/ESTILO ---
                'htmlSupport' => [
                    'allow' => [[
                        'name' => '/.*/',        // cualquier etiqueta
                        'attributes' => true,    // cualquier atributo
                        'classes' => true,       // cualquier clase
                        'styles' => true         // cualquier estilo inline
                    ]]
                ],

                // Incrustar HTML con previsualización
                'htmlEmbed' => [
                    'showPreviews' => true,
                ],

                // Enlaces: permitir protocolos “no estándar” si los usas
                'link' => [
                    'addTargetToExternalLinks' => true,
                    'defaultProtocol' => 'https://',
                    'decorators' => [
                        'toggleDownloadable' => [
                            'mode' => 'manual',
                            'label' => 'Descargable',
                            'attributes' => ['download' => 'file'],
                        ],
                    ],
                ],

                // Listas
                'list' => [
                    'properties' => [
                        'styles' => true,
                        'startIndex' => true,
                        'reversed' => true,
                    ]
                ],

                // Tablas avanzadas
                'table' => [
                    'contentToolbar' => [
                        'tableColumn',
                        'tableRow',
                        'mergeTableCells',
                        'tableProperties',
                        'tableCellProperties'
                    ],
                    'tableProperties' => [
                        'borderColors' => ['#000', '#eee', '#f00', '#0f0', '#00f'],
                        'backgroundColors' => ['#fff', '#f7f7f7', '#fffae6']
                    ],
                    'tableCellProperties' => [
                        'borderColors' => ['#000', '#eee', '#f00', '#0f0', '#00f'],
                        'backgroundColors' => ['#fff', '#f7f7f7', '#fffae6']
                    ],
                ],

                // Alineación de párrafos
                'alignment' => [
                    'options' => ['left', 'center', 'right', 'justify']
                ],
                // Bloques de código con lenguaje (si tu build lo soporta)
                'codeBlock' => [
                    'languages' => [
                        ['language' => 'plaintext', 'label' => 'Texto plano'],
                        ['language' => 'php',       'label' => 'PHP'],
                        ['language' => 'javascript', 'label' => 'JavaScript'],
                        ['language' => 'css',       'label' => 'CSS'],
                        ['language' => 'html',      'label' => 'HTML'],
                        ['language' => 'json',      'label' => 'JSON'],
                        ['language' => 'sql',       'label' => 'SQL'],
                        ['language' => 'bash',      'label' => 'Bash'],
                    ]
                ],

                // Quitar plugins de colaboración del super-build que no uses
                'removePlugins' => [
                    'RealTimeCollaborativeComments',
                    'RealTimeCollaborativeTrackChanges',
                    'RealTimeCollaborativeRevisionHistory',
                    'PresenceList',
                    'Comments',
                    'TrackChanges',
                    'TrackChangesData',
                    'Pagination',
                    'WProofreader',
                    'SlashCommand',
                    'Template',
                    'DocumentOutline',
                    'FormatPainter',
                    'AIAssistant' // si aparece en tu build y no lo usas
                ],

                // (Opcional) limitar conversión a etiquetas si quieres preservar tags “raras”
                'typing' => [
                    'transformations' => [
                        'remove' => ['quotes', 'typography'] // evita autocambios “inteligentes”
                    ]
                ],
            ],
            'placeholder' => trans('backpack::pagemanager.content_placeholder'),
            'fake' => true,
            'store_in' => 'content',
            'tab' => $this->content_tab,
        ]);
    }
}
