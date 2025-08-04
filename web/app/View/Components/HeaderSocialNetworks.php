<?php

namespace App\View\Components;

use Closure;
use App\Models\SocialNetwork;
use Illuminate\View\Component;
use Illuminate\Contracts\View\View;
use App\Http\Resources\SocialNetwork\SocialNetworkResource;

class HeaderSocialNetworks extends Component
{
    public $socialNetworks;
    
    /**
     * Create a new component instance.
     */
    public function __construct()
    {
        $this->socialNetworks = SocialNetworkResource::collection(
            SocialNetwork::active()->ordered()->get()
        );
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.header-social-networks');
    }
}
