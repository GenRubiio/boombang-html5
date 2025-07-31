<?php

namespace App\Traits\Pages;

trait SecurityTemplate
{
    private function security()
    {
        $this->base();
        $this->seo();
    }
}
