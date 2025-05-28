<?php

use App\Helpers\AuthHelper;

/**
 * PageHelper
 */

if (!function_exists('isBackpackAdmin')) {
    function isBackpackAdmin($user = null)
    {
        return AuthHelper::isBackpackAdmin($user);
    }
}

