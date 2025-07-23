<?php

namespace App\Helpers;

use App\Services\SocialNetworkService;

class SocialNetworksHelper
{
    public static function getSocialNetworks()
    {
        return (new SocialNetworkService())->getSocialNetworks();
    }
}
