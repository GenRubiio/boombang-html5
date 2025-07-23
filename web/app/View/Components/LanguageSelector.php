<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class LanguageSelector extends Component
{
    public $languages;
    public $currentLocale;
    public $urlTranslateds;

    /**
     * Create a new component instance.
     */
    public function __construct($urlTranslateds)
    {
        $this->languages = LaravelLocalization::getSupportedLocales();
        $this->currentLocale = LaravelLocalization::getCurrentLocale();
        $this->urlTranslateds = $urlTranslateds;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.language-selector');
    }
}
