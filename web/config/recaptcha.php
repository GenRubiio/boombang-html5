<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Google reCAPTCHA
    |--------------------------------------------------------------------------
    */
    'key' => env('GRECAPTCHA_PUBLIC'),
    'secret' => env('GRECAPTCHA_PRIVATE'),
    'active' => env('GRECAPTCHA_ACTIVE', false),
];
