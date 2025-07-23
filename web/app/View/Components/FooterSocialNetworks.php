<?php

namespace App\View\Components;

use App\Http\Resources\SocialNetwork\SocialNetworkResource;
use App\Services\SocialNetworkService;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class FooterSocialNetworks extends Component
{
    public $socialNetworks;

    /**
     * Create a new component instance.
     */
    public function __construct()
    {
        $this->socialNetworks = $this->getSocialNetworks();
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.footer-social-networks');
    }

    private function getSocialNetworks(): object
    {
        $socialNetworks = (new SocialNetworkService())->getSocialNetworks();
        return SocialNetworkResource::collectionToDTO($socialNetworks);
    }
}
