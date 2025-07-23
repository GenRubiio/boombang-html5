<?php

namespace App\View\Components;

use App\Http\Resources\MenuItem\MenuItemResource;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class FooterItems extends Component
{
    public $footerItems;

    /**
     * Create a new component instance.
     */
    public function __construct()
    {
        $this->footerItems = $this->getFooterItems();
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.footer-items');
    }

    private function getFooterItems(): object
    {
        $footerItems = getMenuFooter();
        return MenuItemResource::collectionToDTO($footerItems);
    }
}
