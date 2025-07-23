<?php

namespace App\Services;

use App\Http\Controllers\Controller;
use App\Repositories\SocialNetwork\SocialNetworkRepository;

class SocialNetworkService extends Controller
{
    private $socialNetworkRepository;

    /**
     * SocialNetworkService constructor.
     */
    public function __construct()
    {
        $this->socialNetworkRepository = new SocialNetworkRepository();
    }

    public function getSocialNetworks()
    {
        return $this->socialNetworkRepository->getSocialNetworks();
    }
}
