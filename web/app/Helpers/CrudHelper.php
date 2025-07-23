<?php

namespace App\Helpers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

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

    public static function settingTypeSelect($value)
    {
        switch ($value) {
            case 'text':
                $type = [   // Text
                    'name' => 'value',
                    'label' => 'Value',
                    'type' => 'text',
                ];
                break;
            case 'ckeditor':
                $type = [   // Text
                    'name' => 'value',
                    'label' => 'Value',
                    'type' => 'ckeditor',
                    // optional:
                    //'extra_plugins' => ['oembed', 'widget', 'justify'],
                    'options' => [
                        'autoGrow_minHeight' => 200,
                        'autoGrow_bottomSpace' => 50,
                        'removePlugins' => 'resize,maximize',
                    ]
                ];
                break;
            case 'radio':
                $type = [   // Text
                    'name' => 'value',
                    'label' => 'Value',
                    'type' => 'radio',
                    'options' => [ // the key will be stored in the db, the value will be shown as label;
                        1 => trans('backpack::crud.yes'),
                        0 => trans('backpack::crud.no')
                    ],
                    'default' => 0,
                    'inline' => true, // show the radios all on the same line?
                ];
                break;
            case 'image':
                $type = [   // Text
                    'label' => "Value",
                    'name' => "value",
                    'filename' => "image_filename",
                    //'type' => 'image',
                    'type' => 'base64_image',
                    'src' => null,
                    //'upload' => true,
                    //'crop' => true, // set to true to allow cropping, false to disable
                    //'aspect_ratio' => 1, // ommit or set to 0 to allow any aspect ratio
                    // 'disk' => 's3_bucket', // in case you need to show images from a different disk
                    // 'prefix' => 'uploads/images/profile_pictures/' // in case your db value is only the file name (no path), you can use this to prepend your path to the image src (in HTML), before it's shown to the user;
                ];
                break;
            case 'datetime_picker':
                $type = [   // Text
                    'label' => 'Value',
                    'name' => 'value',
                    'type' => 'datetime_picker',
                    // optional:
                    'datetime_picker_options' => [
                        'format' => 'YYYY-MM-DD HH:mm',
                        'language' => 'es'
                    ],
                    'allows_null' => true,
                ];
                break;
            case 'color':
                $type = [   // Text
                    'label' => 'Value',
                    'name' => 'value',
                    'type' => 'color',
                    'color_options' => ['customClass' => 'custom-class']
                ];
                break;
            default:
                $type = [];
                break;
        }
        return $type;
    }

    public static function storeReplicateOtherLocales($crud): void
    {
        foreach (LaravelLocalization::getSupportedLocales() as $key => $locale) {
            if ($key != LaravelLocalization::getCurrentLocale()) {
                foreach ($crud->model->getTranslatable() as $field) {
                    if ($crud->entry->{$field} !== "") {
                        if (isJson($crud->entry->{$field})) {
                            $crud->entry->setTranslation($field, $key, json_decode($crud->entry->{$field}));
                        } else {
                            $crud->entry->setTranslation($field, $key, $crud->entry->{$field});
                        }
                        $crud->entry->save();
                    }
                }
            }
        }
    }

    public static function getUniqueSlug($objectId, $slug, $model, $i = 0, $first = true)
    {
        $newSlug = $slug = Str::slug($slug);
        $res = $model::where('id', '<>', $objectId)->get()->pluck('slug')->contains(function ($value) use ($slug) {
            return $value == $slug;
        });

        if ($res) {
            $slug = $first ? $slug : substr($slug, 0, strrpos($slug, '-'));
            $slug .= "-" . ++$i;
            $newSlug = self::getUniqueSlug($objectId, $slug, $model, $i, false);
        }

        return $newSlug;
    }

    public static function getUniqueStringId($slug, $model, $i = 0, $first = true)
    {
        $newSlug = $slug;
        if (method_exists($model, 'trashed')) {
            $res = $model::where('id', $slug)->withTrashed()->first();
        } else {
            $res = $model::where('id', $slug)->first();
        }
        if ($res) {
            $slug = $first ? $slug : substr($slug, 0, strrpos($slug, '-'));
            $slug .= "-" . ++$i;
            $newSlug = self::getUniqueStringId($slug, $model, $i, false);
        }

        return $newSlug;
    }

    public static function getNextID($table_name)
    {
        $statement = DB::select("show table status like '{$table_name}'");
        return $statement[0]->Auto_increment;
    }
}
