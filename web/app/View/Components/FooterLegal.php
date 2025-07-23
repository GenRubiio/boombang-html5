<?php

namespace App\View\Components;

use App\Http\Resources\MenuItem\MenuItemResource;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class FooterLegal extends Component
{
    public $footerLegal;

    /**
     * Create a new component instance.
     */
    public function __construct()
    {
        $this->footerLegal = $this->getFooterItems();
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.footer-legal');
    }

    private function getFooterItems(): object
    {
        return MenuItemResource::collectionToDTO(getMenuFooterLegal());
    }
}
