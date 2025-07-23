<?php

namespace App\Observers;

use Illuminate\Support\Str;

class GenerateStringIdObserver
{
    public function creating($model)
    {
        $fields = $model->generateIdFromField();
        $fieldsFormatted = [];
        foreach ($fields as $field) {
            $fieldsFormatted[] = Str::slug($field, '_');
        }
        $slug = implode('-', $fieldsFormatted);
        $model->id = getUniqueStringId($slug, get_class($model));
    }
}
