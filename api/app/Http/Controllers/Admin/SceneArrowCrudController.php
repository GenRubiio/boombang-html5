<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\SceneArrowRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;


class SceneArrowCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ShowOperation;

    public function setup()
    {
        CRUD::setModel(\App\Models\SceneArrow::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/scene-arrow');
        CRUD::setEntityNameStrings('scene arrow', 'scene arrows');
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
    }

    protected function setupCreateOperation()
    {
        CRUD::setValidation(SceneArrowRequest::class);
        $this->crud->addField([
            'name' => 'name',
            'label' => 'Nombre',
            'type' => 'text',
        ]);
        $this->crud->addField([
            'name' => 'sprite_name',
            'label' => 'Nombre del sprite',
            'type' => 'text',
        ]);
        $this->crud->addField([
            'name' => 'image',
            'label' => 'Imagen',
            'type' => 'image',
            'upload' => true,
            'disk' => 'uploads', // in case you need to show images from
        ]);
    }

    protected function setupUpdateOperation()
    {
        $this->setupCreateOperation();
    }
}
