<?php

namespace App\Observers;

use Illuminate\Support\Facades\Storage;

class ModelObserver
{
    public function creating($model)
    {
        $model->created_user = (backpack_user() ? backpack_user()->id : null);
    }

    public function updating($model)
    {
        $model->updated_user = (backpack_user() ? backpack_user()->id : null);
    }

    public function deleting($model)
    {
        $model->update(['active' => 0, 'deleted_user' => (backpack_user() ? backpack_user()->id : null)]);
    }

    public function deleted($model)
    {
        // Eliminariamos la imagen, pero al usar softdeletes la perderiamos
        // Storage::disk('uploads')->delete($model->main_image);
    }
}
