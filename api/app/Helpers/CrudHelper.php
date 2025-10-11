<?php

namespace App\Helpers;

use Illuminate\Http\Request;

class CrudHelper
{
    public static function toggleField(Request $request)
    {
        $model = new $request->model();
        $field = $request->field;
        $obj = $model->find($request->id);
        $obj->$field = ($obj->$field) ? 0 : 1;
        $obj->save();

        return [
            'checked' => ($obj->$field)
        ];
    }
}
