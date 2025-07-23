<?php

namespace App\Helpers;

use App\Models\Version;

class VersionHelper
{
    public static function currentVersion()
    {
        return Version::ordered()->first()->tag ?? 'v0.0.0';
    }

    public static function currentVersionObject()
    {
        return Version::ordered()->first();
    }
}
