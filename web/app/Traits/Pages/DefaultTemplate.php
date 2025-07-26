<?php

namespace App\Traits\Pages;

trait DefaultTemplate
{
    private function default()
    {
        $this->base();
        $this->seo();
    }
}
