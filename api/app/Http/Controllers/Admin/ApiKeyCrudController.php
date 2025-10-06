<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\ApiKeyRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

class ApiKeyCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;

    public function setup()
    {
        CRUD::setModel(\App\Models\ApiKey::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/api-key');
        CRUD::setEntityNameStrings('api key', 'api keys');
    }

    protected function setupListOperation()
    {
        $this->crud->addColumn([
            'name' => 'id',
            'label' => 'ID',
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'user_id',
            'label' => 'User',
            'type' => 'relationship',
            'entity' => 'user',
            'attribute' => 'name',
            'model' => \App\Models\User::class,
        ]);
        $this->crud->addColumn([
            'name' => 'description',
            'label' => 'Description',
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'type',
            'label' => 'Type',
            'type' => 'select_from_array',
            'options' => \App\Enums\ApiKeysTypeEnum::toAssociativeArray(),
        ]);
    }


    protected function setupCreateOperation()
    {
        CRUD::setValidation(ApiKeyRequest::class);

        $this->crud->addFields([
            [
                'name' => 'description',
                'label' => 'Descripción',
                'type' => 'text',
            ],
            [
                'name' => 'key',
                'label' => 'Key',
                'type' => 'text',
            ],
            [
                'name' => 'type',
                'label' => 'Type',
                'type' => 'select_from_array',
                'options' => \App\Enums\ApiKeysTypeEnum::toAssociativeArray(),
            ],
            [
                'name' => 'active',
                'label' => 'Activo',
                'type' => 'checkbox',
                'default' => true,
            ]
        ]);
    }

    protected function setupUpdateOperation()
    {
        $this->setupCreateOperation();
    }
}
