<?php

namespace App\Traits;

trait PageTemplates
{
    /* Page Template */
    use Pages\HomeTemplate;
    use Pages\AuthTemplate;
    use Pages\EntityTemplate;
    use Pages\LegalTemplate;
    use Pages\DefaultTemplate;
    use Pages\DiscoverTemplate;
    use Pages\SecurityTemplate;
    use Pages\ShoppingTemplate;

    /* Template Partials - Protected functions */
    use Pages\Partials\BaseTemplate;
    use Pages\Partials\SeoTemplate;
    use Pages\Partials\MultimediaTemplate;
    /*
    |--------------------------------------------------------------------------
    | Page Templates for Backpack\PageManager
    |--------------------------------------------------------------------------
    |
    | Each page template has its own method, that define what fields should show up using the Backpack\CRUD API.
    | Use snake_case for naming and PageManager will make sure it looks pretty in the create/update form
    | template dropdown.
    |
    | Any fields defined here will show up after the standard page fields:
    | - select template
    | - page name (only seen by admins)
    | - page title
    | - page slug
    */
    protected $base_tab = 'Base';
    protected $content_tab = 'Contenido';
    protected $seo_tab = 'SEO';
    protected $sections_tab = 'Secciones';
    protected $image_tab = 'Images';
    protected $video_tab = 'Videos';
    protected $file_tab = 'Files';
}
