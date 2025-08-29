<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MenuTypeEnum;
use App\Http\Requests\PublicSceneRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;

class PublicSceneCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;

    public function setup()
    {
        $this->crud->setModel(\App\Models\PublicScene::class);
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/public-scene');
        $this->crud->setEntityNameStrings('escena pública', 'escenas públicas');
    }

    protected function setupListOperation()
    {
        $this->crud->addColumn(['name' => 'id', 'label' => 'ID']);
        $this->crud->addColumn(['name' => 'name', 'label' => 'Nombre']);
        $this->crud->addColumn(['name' => 'type', 'label' => 'Tipo']);
        $this->crud->addColumn([
            'name' => 'menu_type', 
            'label' => 'Tipo de menú',
            'type' => 'select_from_array',
            'options' => MenuTypeEnum::toAssociativeArray(),
        ]);
        $this->crud->addColumn([
            'name' => 'active',
            'label' => 'Activo',
            'type' => 'check',
        ]);
    }

    protected function setupCreateOperation()
    {
        $this->crud->setValidation(PublicSceneRequest::class);

        $this->crud->addFields([
            [
                'name' => 'name',
                'label' => 'Nombre',
                'type' => 'text',
                'tab' => 'General'
            ],
            [
                'name' => 'type',
                'label' => 'Tipo',
                'type' => 'text',
                'tab' => 'General'
            ],
            [
                'name' => 'max_users',
                'label' => 'Máximo de usuarios',
                'type' => 'number',
                'tab' => 'General'
            ],
            [
                'name' => 'menu_type',
                'label' => 'Tipo de Menú',
                'type' => 'select_from_array',
                'options' => MenuTypeEnum::toAssociativeArray(),
                'tab' => 'General'
            ],
            [
                'name' => 'active',
                'label' => 'Activo',
                'type' => 'checkbox',
                'default' => true,
                'tab' => 'General'
            ],
            [
                'name' => 'map',
                'label' => 'Mapa',
                'type' => 'textarea',
                'tab' => 'Mapa'
            ],
            [
                'name' => 'map_width',
                'label' => 'Ancho del mapa',
                'type' => 'number',
                'tab' => 'Mapa'
            ],
            [
                'name' => 'map_height',
                'label' => 'Alto del mapa',
                'type' => 'number',
                'tab' => 'Mapa'
            ],
            [
                'name' => 'start_x',
                'label' => 'Posición inicial X',
                'type' => 'number',
                'tab' => 'Mapa'
            ],
            [
                'name' => 'start_y',
                'label' => 'Posición inicial Y',
                'type' => 'number',
                'tab' => 'Mapa'
            ],
            [
                'name' => 'start_z',
                'label' => 'Posición inicial Z',
                'type' => 'number',
                'tab' => 'Mapa'
            ]
        ]);
    }

    protected function setupUpdateOperation()
    {
        $this->setupCreateOperation();
    }
}
