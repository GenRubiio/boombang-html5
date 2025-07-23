<?php

namespace App\Traits\Pages;

trait AuthTemplate
{
    private function auth()
    {
        $this->base();

        $this->seo();
    }
}
