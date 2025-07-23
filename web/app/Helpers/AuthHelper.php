<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;

class AuthHelper
{
    public static function isAdmin($user = null)
    {
        $user = $user ?? backpack_user();
        return (bool)$user->hasRole('Admin');
    }

    public static function isSuperadmin($user = null)
    {
        $user = $user ?? backpack_user();
        return (bool)$user->hasRole('Superadmin');
    }

    public static function isAdminOrSuperadmin($user = null)
    {
        $user = $user ?? backpack_user();
        return $user->hasRole('Superadmin') || $user->hasRole('Admin');
    }

    public static function userIsActive($user)
    {
        return $user->active;
    }

    public static function getUser()
    {
        return Auth::user();
    }
}
