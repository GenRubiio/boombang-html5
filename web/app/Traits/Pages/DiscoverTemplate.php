<?php

namespace App\Traits\Pages;

trait DiscoverTemplate
{
    private function discover()
    {
        $this->base();
        $this->seo();
    }
}
