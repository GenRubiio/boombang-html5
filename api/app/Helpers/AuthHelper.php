<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;

class AuthHelper
{
    public static function isBackpackAdmin($user = null)
    {
        $user = $user ?? backpack_user();
        return $user->hasRole('Superadmin')
            || $user->hasRole('Admin');
    }
}
