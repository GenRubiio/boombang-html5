<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Navbar extends Component
{
    public $urlTranslateds;
    public $menu;

    /**
     * Create a new component instance.
     */
    public function __construct($urlTranslateds)
    {
        $this->urlTranslateds = $urlTranslateds;
        $this->menu = getMenuTop();
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.navbar');
    }
}
