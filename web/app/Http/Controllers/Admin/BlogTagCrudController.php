<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\BlogTagRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;

class BlogTagCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation {
        store as traitStore;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ShowOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\InlineCreateOperation;

    public function setup()
    {
        $this->crud->setModel("App\Models\BlogTag");
        $this->crud->setRoute(config('backpack.base.route_prefix', 'admin') . '/blog-tag');
        $this->crud->setEntityNameStrings('blog tag', 'blog tags');
    }

    protected function setupListOperation()
    {
        $this->crud->addColumn([
            'name' => 'name',
            'label' => trans('admin.name'),
        ]);
        $this->crud->addColumn([
            'name' => 'slug',
            'label' => trans('admin.slug'),
        ]);
        $this->crud->addColumn([
            'name' => 'active',
            'type' => 'btnToggle',
            'label' => trans('admin.active')
        ]);
    }

    protected function setupShowOperation()
    {
        $this->setupListOperation();
        $this->crud->removeColumn('active');
        $this->crud->addColumn([
            'name' => 'active',
            'type' => 'boolean',
            'label' => trans('admin.active')
        ]);
    }

    protected function setupCreateOperation()
    {
        $this->crud->setValidation(BlogTagRequest::class);

        $this->crud->addFields([
            [
                'name' => 'name',
                'type' => 'text',
                'label' => trans('admin.name'),
            ],
            [
                'name' => 'slug',
                'type' => 'slug',
                'target'  => 'name',
                'label' => trans('admin.slug'),
                'hint' => trans('admin.slug_hint'),
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

    protected function setupUpdateOperation()
    {
        $this->crud->setValidation(BlogTagRequest::class);
        $this->crud->setOperationSetting('showDeleteButton', true);

        $this->crud->addFields([
            [
                'name' => 'name',
                'type' => 'text',
                'label' => trans('admin.name'),
            ],
            [
                'name' => 'slug',
                'type' => 'text',
                'label' => trans('admin.slug'),
                'attributes' => [
                    "required" => "required"
                ],
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
        $response = $this->traitStore();
        storeReplicateOtherLocales($this->crud);
        return $response;
    }
}
