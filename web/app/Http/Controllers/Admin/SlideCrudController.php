<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SlideTypeEnum;
use App\Http\Requests\SlideRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use App\Http\Controllers\Admin\Traits\SuperadminProtection;

class SlideCrudController extends CrudController
{
    use SuperadminProtection;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation {
        store as traitStore;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ReorderOperation;

    public function setup()
    {
        $this->applySuperadminProtection();


        $this->crud->setModel(\App\Models\Slide::class);
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/slide');
        $this->crud->setEntityNameStrings('slide', 'slides');
    }

    protected function setupListOperation()
    {
        $this->crud->addColumns([
            [
                'name' => 'id',
                'label' => trans('admin.id'),
            ],
            [
                'name' => 'title',
                'label' => trans('admin.title'),
            ],
            [
                'name' => 'image_desktop',
                'label' => trans('admin.image'),
                'type' => 'image',
                'height' => '40px',
            ],
            [
                'name' => 'date_start',
                'type' => 'datetime',
                'label' => trans('admin.date_start'),
                'format' => 'DD/MM/YYYY HH:mm:ss',
            ],
            [
                'name' => 'date_end',
                'type' => 'datetime',
                'label' => trans('admin.date_end'),
                'format' => 'DD/MM/YYYY HH:mm:ss',
            ],
            [
                'name' => 'active',
                'type' => 'btnToggle',
                'label' => trans('admin.active')
            ]
        ]);
    }

    protected function setupCreateOperation()
    {
        $this->addFieldsSlide();
    }

    protected function setupUpdateOperation()
    {
        $this->addFieldsSlide();
    }

    protected function addFieldsSlide()
    {
        $this->crud->setValidation(SlideRequest::class);

        $this->crud->addFields([
            [
                'name' => 'slider',
                'label' => trans('admin.slider'),
                'type' => 'select2_from_array',
                'options' => SlideTypeEnum::toAssociativeArray(),
                'allows_null' => false,
            ],
            [
                'name' => 'title',
                'label' => trans('admin.title'),
                'type' => 'text',
                'placeholder' => 'Your title here',
            ],
            [
                'name' => 'text',
                'label' => trans('admin.text'),
                'type' => 'custom_textarea',
                'data' => [
                    'removePlugins' => ['Heading', 'blockQuote'],
                    'toolbar' => ['bold', 'italic', 'bulletedList', 'numberedList', 'link'],
                ],
                'hint' => trans('admin.length_recommended') . ': 20',
            ],
            [
                'name' => 'alt',
                'label' => trans('admin.gallery_image_alt'),
                'type' => 'text',
            ],
            [
                'name' => 'link',
                'label' => trans('admin.link'),
                'type' => 'url',
                'wrapperAttributes' => [
                    'class' => 'form-group col-md-6',
                ],
            ],
            [
                'name' => 'target_blank',
                'label' => trans('admin.target_blank'),
                'type' => 'radio',
                'options' => [
                    1 => trans('backpack::crud.yes'),
                    0 => trans('backpack::crud.no')
                ],
                'default' => 0,
                'inline' => true,
                'wrapperAttributes' => [
                    'class' => 'form-group col-md-3',
                ],
            ],
            [
                'name' => 'button_text',
                'label' => trans('admin.button_text'),
                'type' => 'text',
                'wrapperAttributes' => [
                    'class' => 'form-group col-md-3',
                ],
            ],
            [
                'name' => 'date_start',
                'label' => trans('admin.date_start'),
                'type' => 'datetime_picker',
                'datetime_picker_options' => [
                    'format' => 'DD/MM/YYYY HH:mm:ss',
                    'language' => 'es'
                ],
                'wrapperAttributes' => [
                    'class' => 'form-group col-md-3',
                ],
                'allows_null' => true,
            ],
            [
                'name' => 'date_end',
                'label' => trans('admin.date_end'),
                'type' => 'datetime_picker',
                'datetime_picker_options' => [
                    'format' => 'DD/MM/YYYY HH:mm:ss',
                    'language' => 'es'
                ],
                'wrapperAttributes' => [
                    'class' => 'form-group col-md-3',
                ],
                'allows_null' => true,
            ],
            [
                'name' => 'image_desktop',
                'label' => trans('admin.image'),
                'type' => 'image',
                'hint' => trans('admin.hint_image_or_svg') . '<br>' . trans('admin.resolution_recommended') . ': 1920x700px <br>' . trans('admin.weight_recommended') . ': 400 KB',
                //'upload' => true,
                //'crop' => true, // set to true to allow cropping, false to disable
                //'aspect_ratio' => 0, // ommit or set to 0 to allow any aspect ratio
                // 'disk' => 's3_bucket', // in case you need to show images from a different disk
                // 'prefix' => 'uploads/images/profile_pictures/' // in case you only store the filename in the database, this text will be prepended to the database value
            ],
            [
                'name' => 'image_tablet',
                'label' => trans('admin.image_tablet'),
                'type' => 'image',
                'hint' => trans('admin.hint_image_or_svg') . '<br>' . trans('admin.resolution_recommended') . ': 1024x700px <br>' . trans('admin.weight_recommended') . ': 300 KB',
                //'upload' => true,
                //'crop' => true, // set to true to allow cropping, false to disable
                //'aspect_ratio' => 0, // ommit or set to 0 to allow any aspect ratio
                // 'disk' => 's3_bucket', // in case you need to show images from a different disk
                // 'prefix' => 'uploads/images/profile_pictures/' // in case you only store the filename in the database, this text will be prepended to the database value
            ],
            [
                'name' => 'image_mobile',
                'label' => trans('admin.image_mobile'),
                'type' => 'image',
                'hint' => trans('admin.hint_image_or_svg') . '<br>' . trans('admin.resolution_recommended') . ': 360x485px <br>' . trans('admin.weight_recommended') . ': 200 KB',
                //'upload' => true,
                //'crop' => true, // set to true to allow cropping, false to disable
                //'aspect_ratio' => 0, // ommit or set to 0 to allow any aspect ratio
                // 'disk' => 's3_bucket', // in case you need to show images from a different disk
                // 'prefix' => 'uploads/images/profile_pictures/' // in case you only store the filename in the database, this text will be prepended to the database value
            ],
            [
                'name' => 'active',
                'label' => trans('admin.active'),
                'type' => 'radio',
                'options' => [
                    1 => trans('backpack::crud.yes'),
                    0 => trans('backpack::crud.no')
                ],
                'default' => 0,
                'inline' => true,
            ],
        ]);
    }

    protected function store()
    {
        $this->crud->setRequest(request()->merge(['nextId' => getNextID('slides')]));
        $response = $this->traitStore();
        storeReplicateOtherLocales($this->crud);
        return $response;
    }

    protected function setupReorderOperation()
    {
        $this->crud->set('reorder.label', 'title');
        $this->crud->set('reorder.max_level', 1);
    }
}
