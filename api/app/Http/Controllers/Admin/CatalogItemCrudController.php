<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\CatalogItemRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;

class CatalogItemCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;

    public function setup()
    {
        $this->crud->setModel(\App\Models\CatalogItem::class);
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/catalog-item');
        $this->crud->setEntityNameStrings('artículo de catálogo', 'artículos de catálogo');
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
            'name' => 'category_id',
            'label' => 'Categoría',
            'type' => 'select',
            'entity' => 'category',
            'attribute' => 'name',
            'model' => "App\Models\CatalogCategory",
        ]);
        $this->crud->addColumn([
            'name' => 'price',
            'label' => 'Precio',
            'type' => 'number',
        ]);
        $this->crud->addColumn([
            'name' => 'is_active',
            'label' => 'Activo',
            'type' => 'btnToggle',
        ]);
    }

    protected function setupCreateOperation()
    {
        $this->crud->setValidation(CatalogItemRequest::class);

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
                'type' => 'textarea',
                'tab' => 'General'
            ],
            [
                'name' => 'category_id',
                'label' => 'Categoría',
                'type' => 'select2',
                'entity' => 'category',
                'attribute' => 'name',
                'model' => "App\Models\CatalogCategory",
                'tab' => 'General'
            ],
            [
                'name' => 'sprite_name',
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
                'name' => 'spreadsheet',
                'label' => 'Phaser Spreadsheet',
                'type' => 'upload',
                'upload' => true,
                'tab' => 'General'
            ],
            [
                'name' => 'atlas',
                'label' => 'Phaser Atlas',
                'type' => 'upload',
                'upload' => true,
                'tab' => 'General'
            ],
            [
                'name' => 'price',
                'label' => 'Precio',
                'type' => 'number',
                'tab' => 'Precios'
            ],
            [
                'name' => 'price_type',
                'label' => 'Tipo de Precio',
                'type' => 'select_from_array',
                'options' => [
                    'golden_coins' => 'Monedas Doradas',
                    'silver_coins' => 'Monedas Plateadas',
                ],
                'tab' => 'Precios'
            ],
            [
                'name' => 'discount',
                'label' => 'Descuento',
                'type' => 'number',
                'tab' => 'Precios'
            ],
            [
                'name' => 'stars',
                'label' => 'Estrellas',
                'type' => 'select_from_array',
                'options' => [
                    1 => '1 Estrella',
                    2 => '2 Estrellas',
                    3 => '3 Estrellas',
                    4 => '4 Estrellas',
                    5 => '5 Estrellas',
                ],
                'tab' => 'Configuración'
            ],
            [
                'name' => 'map_size',
                'label' => 'Tamaño del Mapa',
                'type' => 'text',
                'tab' => 'Configuración'
            ],
            [
                'name' => 'in_lobby_gacha',
                'label' => 'En Lobby Gacha',
                'type' => 'checkbox',
                'tab' => 'Configuración'
            ],
            [
                'name' => 'show_in_inventory',
                'label' => 'Mostrar en Inventario',
                'type' => 'checkbox',
                'default' => true,
                'tab' => 'Configuración'
            ],
            [
                'name' => 'is_purchasable',
                'label' => 'Comprable',
                'type' => 'checkbox',
                'default' => true,
                'tab' => 'Configuración'
            ],
            [
                'name' => 'is_active',
                'label' => 'Activo',
                'type' => 'checkbox',
                'default' => true,
                'tab' => 'Configuración'
            ]
        ]);
    }

    protected function setupUpdateOperation()
    {
        $this->setupCreateOperation();
    }
}
