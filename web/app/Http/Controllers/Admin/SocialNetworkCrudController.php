<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\SocialNetworkRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;

class SocialNetworkCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation {
        store as traitStore;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ReorderOperation;

    public function setup()
    {
        $this->crud->setModel(\App\Models\SocialNetwork::class);
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/social-network');
        $this->crud->setEntityNameStrings('social network', 'social networks');
    }

    protected function setupListOperation()
    {
        $this->crud->addColumns([
            [
                'name' => 'id',
                'label' => trans('admin.id'),
            ],
            [
                'name' => 'name',
                'type' => 'text',
                'label' => trans('backpack::pagemanager.name'),
            ],
            [
                'name' => 'icon',
                'label' => trans('admin.icon'),
                'type' => 'icon',
                //'view'  => 'package::columns.icon', // or path to blade file
            ],
            [
                'name' => 'image',
                'label' => trans('admin.image'),
                'type' => 'image',
                'height' => '40px',
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
        $this->addFieldsSocialNetworks();
    }

    protected function setupUpdateOperation()
    {
        $this->crud->setOperationSetting('showDeleteButton', true);

        $this->addFieldsSocialNetworks();
    }

    protected function addFieldsSocialNetworks()
    {
        $this->crud->setValidation(SocialNetworkRequest::class);

        $this->crud->addFields([
            [
                'name' => 'name',
                'label' => trans('backpack::pagemanager.name'),
                'type' => 'text',
                'placeholder' => 'John Doe',
            ],
            [
                'name' => 'link',
                'label' => trans('admin.link'),
                'type' => 'url',
            ],
            [
                'name' => 'icon',
                'label' => trans('admin.icon'),
                'type' => 'icon_picker',
                'iconset' => 'fontawesome'
            ],
            [
                'name' => 'background_color',
                'label' => 'Background Color',
                'type' => 'color',
                'wrapper' => ['class' => 'form-group col-md-3'],
            ],
            [
                'name' => 'image',
                'label' => trans('admin.image'),
                'type' => 'image',
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

    protected function setupReorderOperation()
    {
        $this->crud->set('reorder.label', 'name');
        $this->crud->set('reorder.max_level', 1);
    }

    protected function store()
    {
        $response = $this->traitStore();
        storeReplicateOtherLocales($this->crud);
        return $response;
    }
}
