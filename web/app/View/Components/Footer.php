<?php

namespace App\View\Components;

use Closure;
use Illuminate\View\Component;
use Illuminate\Contracts\View\View;
use App\Http\Resources\MenuItem\MenuItemResource;

class Footer extends Component
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
        return view('components.footer');
    }

    private function getFooterItems(): object
    {
        $footerItems = getMenuFooter();
        return MenuItemResource::collectionToDTO($footerItems);
    }
}
