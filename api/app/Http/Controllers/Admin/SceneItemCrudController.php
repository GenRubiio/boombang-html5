<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\SceneItemRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use App\Http\Controllers\Admin\Traits\SuperadminProtection;

class SceneItemCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use SuperadminProtection;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;

    public function setup()
    {
        $this->applySuperadminProtection();

        $this->crud->setModel(\App\Models\SceneItem::class);
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/scene-item');
        $this->crud->setEntityNameStrings('elemento de escena', 'elementos de escena');
    }

    protected function setupListOperation()
    {
        $this->crud->addColumn([
            'name' => 'id',
            'label' => 'ID',
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'name',
            'label' => 'Nombre',
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'sprite_file',
            'label' => 'Archivo Sprite',
            'type' => 'image',
        ]);
        $this->crud->addColumn([
            'name' => 'file_name',
            'label' => 'Archivo',
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'catch_file_name',
            'label' => 'Archivo de Captura',
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'text',
            'label' => 'Texto',
            'type' => 'text',
            'limit' => 50,
        ]);
        $this->crud->addColumn([
            'name' => 'active',
            'label' => 'Activo',
            'type' => 'check',
        ]);
    }

    protected function setupCreateOperation()
    {
        $this->crud->setValidation(SceneItemRequest::class);

        $this->crud->addFields([
            [
                'name' => 'name',
                'label' => 'Nombre',
                'type' => 'text',
                'tab' => 'General'
            ],
            [
                'name' => 'file_name',
                'label' => 'Nombre del Sprite',
                'type' => 'text',
                'tab' => 'General'
            ],
            [
                'name' => 'sprite_file',
                'label' => 'Archivo Sprite',
                'type' => 'upload',
                'upload' => true,
                'disk' => 'uploads',
                'tab' => 'General'
            ],
            [
                'name' => 'catch_file_name',
                'label' => 'Nombre del Sprite de Captura',
                'type' => 'text',
                'tab' => 'General'
            ],
            [
                'name' => 'catch_sprite_file',
                'label' => 'Archivo Sprite de Captura',
                'type' => 'upload',
                'upload' => true,
                'disk' => 'uploads',
                'tab' => 'General'
            ],
            [
                'name' => 'text',
                'label' => 'Texto',
                'type' => 'text',
                'tab' => 'General'
            ],
            [
                'name' => 'active',
                'label' => 'Activo',
                'type' => 'checkbox',
                'default' => true,
                'tab' => 'General'
            ]
        ]);
    }

    protected function setupUpdateOperation()
    {
        $this->setupCreateOperation();
    }
}
