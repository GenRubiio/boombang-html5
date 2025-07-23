<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default size images
    |--------------------------------------------------------------------------
    */

    // Desktop
    'desktop_max_width' => env('IMAGE_DESKTOP_WIDTH', 1920),
    'desktop_max_heigth' => env('IMAGE_DESKTOP_HEIGTH', 1080),
    'desktop_add_name' => env('IMAGE_DESKTOP_ADD_NAME', '-desktop'),

    // Tablet
    'tablet_max_width' => env('IMAGE_TABLET_WIDTH', 1024),
    'tablet_add_name' => env('IMAGE_TABLET_ADD_NAME', '-tablet'),

    // Mobile
    'mobile_max_width' => env('IMAGE_MOBILE_WIDTH', 768),
    'mobile_add_name' => env('IMAGE_MOBILE_ADD_NAME', '-mobile'),

    // Thumbnail
    'thumbnail_max_width' => env('IMAGE_THUMBNAIL_WIDTH', 200),
    'thumbnail_add_name' => env('IMAGE_THUMBNAIL_ADD_NAME', '-thumbnail'),

    'webp_quality' => env('IMAGE_WEBP_QUALITY', 80),

];
