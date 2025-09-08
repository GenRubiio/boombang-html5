<?php

namespace App\Http\Controllers\Admin;

use App\Enums\NpcTypesEnum;
use App\Http\Requests\NpcRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;

class NpcCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;

    public function setup()
    {
        $this->crud->setModel(\App\Models\Npc::class);
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/npc');
        $this->crud->setEntityNameStrings('npc', 'npcs');
    }

    protected function setupListOperation()
    {
        $this->crud->addColumn([
            'name' => 'id',
            'label' => 'ID',
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'image',
            'label' => 'Imagen',
            'type' => 'image',
        ]);
        $this->crud->addColumn([
            'name' => 'name',
            'label' => 'Nombre',
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'type',
            'label' => 'Tipo',
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'position_x',
            'label' => 'Posición X',
            'type' => 'number',
        ]);
        $this->crud->addColumn([
            'name' => 'position_y',
            'label' => 'Posición Y',
            'type' => 'number',
        ]);
        $this->crud->addColumn([
            'name' => 'active',
            'label' => 'Activo',
            'type' => 'check',
        ]);
    }

    protected function setupCreateOperation()
    {
        $this->crud->setValidation(NpcRequest::class);

        $this->crud->addFields([
            [
                'name' => 'name',
                'label' => 'Nombre',
                'type' => 'text',
                'tab' => 'General'
            ],
            [
                'name' => 'description',
                'label' => 'Descripción',
                'type' => 'ckeditor',
                'tab' => 'General'
            ],
            [
                'name' => 'type',
                'label' => 'Tipo',
                'type' => 'select_from_array',
                'options' => NpcTypesEnum::toAssociativeArray(),
                'tab' => 'General'
            ],
            [
                'name' => 'stripe_name',
                'label' => 'Nombre del Sprite',
                'type' => 'text',
                'tab' => 'General'
            ],
            [
                'name' => 'image',
                'label' => 'Imagen',
                'type' => 'image',
                'disk'  => 'uploads',
                'upload' => true,
                'tab' => 'General'
            ],
            [
                'name' => 'position_x',
                'label' => 'Posición X',
                'type' => 'number',
                'default' => 0,
                'suffix' => 'px',
                'tab' => 'General'
            ],
            [
                'name' => 'position_y',
                'label' => 'Posición Y',
                'type' => 'number',
                'default' => 0,
                'suffix' => 'px',
                'tab' => 'General'
            ],
            [
                'name' => 'depth',
                'label' => 'Profundidad',
                'type' => 'number',
                'default' => 0,
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
