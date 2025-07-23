<?php

namespace App\Observers;

class CacheClearObserver
{
    public function creating($model)
    {
        clearCache();
    }

    public function updating($model)
    {
        clearCache();
    }

    public function deleting($model)
    {
        clearCache();
    }
}
