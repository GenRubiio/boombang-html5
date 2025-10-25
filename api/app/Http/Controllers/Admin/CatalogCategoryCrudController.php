<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\CatalogCategoryRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use App\Http\Controllers\Admin\Traits\SuperadminProtection;

class CatalogCategoryCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use SuperadminProtection;

    public function setup()
    {
        $this->applySuperadminProtection();
        
        $this->crud->setModel(\App\Models\CatalogCategory::class);
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/catalog-category');
        $this->crud->setEntityNameStrings('categoría de catálogo', 'categorías de catálogo');
    }

    protected function setupListOperation()
    {
        $this->crud->addColumn([
            'name' => 'name',
            'label' => 'Nombre',
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'image',
            'label' => 'Imagen',
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'description',
            'label' => 'Descripción',
            'type' => 'textarea',
        ]);
        $this->crud->addColumn([
            'name' => 'is_active',
            'label' => 'Activo',
            'type' => 'btnToggle',
        ]);
    }

    protected function setupCreateOperation()
    {
        $this->crud->setValidation(CatalogCategoryRequest::class);

        $this->crud->addFields([
            [
                'name' => 'name',
                'label' => 'Nombre',
                'type' => 'text',
            ],
            [
                'name' => 'image',
                'label' => 'Imagen',
                'type' => 'text',
            ],
            [
                'name' => 'description',
                'label' => 'Descripción',
                'type' => 'textarea',
            ],
            [
                'name' => 'is_active',
                'type' => 'checkbox',
                'label' => 'Activo',
                'default' => true
            ]
        ]);
    }

    protected function setupUpdateOperation()
    {
        $this->setupCreateOperation();
    }
}