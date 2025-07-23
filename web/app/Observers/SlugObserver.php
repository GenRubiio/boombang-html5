<?php

namespace App\Observers;

class SlugObserver
{
    public function creating($model)
    {
        $model->slug = getUniqueSlug($model->id, $model->slug, get_class($model));
    }

    public function updating($model)
    {
        $model->slug = getUniqueSlug($model->id, $model->slug, get_class($model));
    }
}
