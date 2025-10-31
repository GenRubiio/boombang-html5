<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\PrivateSceneConfigRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use App\Http\Controllers\Admin\Traits\SuperadminProtection;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

/**
 * Class PrivateSceneConfigCrudController
 * @package App\Http\Controllers\Admin
 * @property-read \Backpack\CRUD\app\Library\CrudPanel\CrudPanel $crud
 */
class PrivateSceneConfigCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use SuperadminProtection;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;

    /**
     * Configure the CrudPanel object. Apply settings to all operations.
     * 
     * @return void
     */
    public function setup()
    {
        $this->applySuperadminProtection();

        CRUD::setModel(\App\Models\PrivateSceneConfig::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/private-scene-config');
        CRUD::setEntityNameStrings('private scene config', 'private scene configs');
    }

    /**
     * Define what happens when the List operation is loaded.
     * 
     * @see  https://backpackforlaravel.com/docs/crud-operation-list-entries
     * @return void
     */
    protected function setupListOperation()
    {
        CRUD::addColumn([
            'name' => 'id',
            'label' => 'ID',
            'type' => 'text',
        ]);

        CRUD::addColumn([
            'name' => 'image',
            'label' => 'Imagen',
            'type' => 'image',
        ]);

        CRUD::addColumn([
            'name' => 'name',
            'label' => 'Nombre',
            'type' => 'text',
        ]);

        CRUD::addColumn([
            'name' => 'type',
            'label' => 'Isla',
            'type' => 'select',
            'entity' => 'islandsConfig',
            'attribute' => 'name',
            'model' => "App\\Models\\IslandsConfig",
        ]);

        CRUD::addColumn([
            'name' => 'active',
            'label' => 'Activo',
            'type' => 'btnToggle',
        ]);
    }

    /**
     * Define what happens when the Create operation is loaded.
     * 
     * @see https://backpackforlaravel.com/docs/crud-operation-create
     * @return void
     */
    protected function setupCreateOperation()
    {
        CRUD::setValidation(PrivateSceneConfigRequest::class);
        CRUD::addField([
            'name' => 'island_type',
            'label' => 'Isla',
            'type' => 'select2',
            'entity' => 'islandsConfig',
            'attribute' => 'name',
            'model' => "App\\Models\\IslandsConfig",
            'tab' => 'General'
        ]);

        CRUD::addField([
            'name' => 'name',
            'label' => 'Nombre',
            'type' => 'text',
            'tab' => 'General'
        ]);

        CRUD::addField([
            'name' => 'image',
            'label' => 'Imagen',
            'type' => 'image',
            'disk'  => 'uploads',
            'upload' => true,
            'hint' => 'Imagen representativa de la escena.',
            'tab' => 'General'
        ]);

        CRUD::addField([
            'name' => 'max_users',
            'label' => 'Máximo de usuarios',
            'type' => 'number',
            'default' => 10,
            'attributes' => ["step" => "1", "min" => "1", "max" => "50"],
            'tab' => 'Map'
        ]);

        CRUD::addField([
            'name' => 'map_width',
            'label' => 'Ancho del mapa',
            'type' => 'number',
            'default' => 30,
            'attributes' => ["step" => "1", "min" => "10", "max" => "100"],
            'tab' => 'Map'
        ]);

        CRUD::addField([
            'name' => 'map_height',
            'label' => 'Alto del mapa',
            'type' => 'number',
            'default' => 30,
            'attributes' => ["step" => "1", "min" => "10", "max" => "100"],
            'tab' => 'Map'
        ]);

        CRUD::addField([
            'name' => 'map',
            'label' => 'Configuración del mapa',
            'type' => 'textarea',
            'hint' => 'Configuración del mapa en formato de texto.',
            'tab' => 'Map'
        ]);

        CRUD::addField([
            'name' => 'start_x',
            'label' => 'Posición inicial X',
            'type' => 'number',
            'default' => 11,
            'attributes' => ["step" => "1", "min" => "0"],
            'tab' => 'Map'
        ]);

        CRUD::addField([
            'name' => 'start_y',
            'label' => 'Posición inicial Y',
            'type' => 'number',
            'default' => 11,
            'attributes' => ["step" => "1", "min" => "0"],
            'tab' => 'Map'
        ]);

        CRUD::addField([
            'name' => 'start_z',
            'label' => 'Posición inicial Z',
            'type' => 'number',
            'default' => 2,
            'attributes' => ["step" => "1", "min" => "0"],
            'tab' => 'Map'
        ]);

        CRUD::addField([
            'name' => 'default_colors',
            'label' => 'Colores por defecto',
            'type'  => 'json',
            'view_namespace' => 'json-field-for-backpack::fields',
            'hint' => 'Colores por defecto para la escena.',
            'tab' => 'Map'
        ]);

        CRUD::addField([
            'name' => 'assets_data_repeatable',
            'label' => 'Assets',
            'type' => 'repeatable',
            'subfields' => [
                [
                    'name' => 'position_x',
                    'type' => 'number',
                    'default' => 0,
                    'label' => 'Position X',
                    'wrapper' => ['class' => 'form-group col-md-4'],
                ],
                [
                    'name' => 'position_y',
                    'type' => 'number',
                    'default' => 0,
                    'label' => 'Position Y',
                    'wrapper' => ['class' => 'form-group col-md-4'],
                ],
                [
                    'name' => 'depth',
                    'type' => 'number',
                    'default' => 0,
                    'label' => 'Depth',
                    'wrapper' => ['class' => 'form-group col-md-4'],
                ],
                [
                    'name' => 'color_item_key',
                    'type' => 'text',
                    'default' => '',
                    'label' => 'Color Item Key',
                    'wrapper' => ['class' => 'form-group col-md-4'],
                ],
                [
                    'name' => 'image',
                    'label' => 'Image',
                    'type' => 'image',
                    'disk'  => 'uploads',
                    'upload' => true,
                ],
                [
                    'name' => 'scale',
                    'type' => 'number',
                    'label' => 'Scale',
                    'attributes' => ["step" => "1", "min" => "1"],
                    'default' => 1,
                    'wrapper' => ['class' => 'form-group col-md-4'],
                ],
                [
                    'name' => 'is_background',
                    'label' => 'Is Background',
                    'type' => 'radio',
                    'options' => [
                        1 => trans('backpack::crud.yes'),
                        0 => trans('backpack::crud.no')
                    ],
                    'default' => 0,
                    'inline' => true,
                ],
                [
                    'name' => 'show_controller',
                    'label' => 'Show Controller',
                    'type' => 'radio',
                    'options' => [
                        1 => trans('backpack::crud.yes'),
                        0 => trans('backpack::crud.no')
                    ],
                    'default' => 0,
                    'inline' => true,
                ],
                [
                    'name' => 'active',
                    'label' => 'Activo',
                    'type' => 'radio',
                    'options' => [
                        1 => trans('backpack::crud.yes'),
                        0 => trans('backpack::crud.no')
                    ],
                    'default' => 1,
                    'inline' => true,
                ]
            ],
            'new_item_label' => 'Add',
            'reorder' => true,
            'fake' => true,
            'store_in' => 'assets_data',
            'tab' => 'Assets Data',
        ]);

        CRUD::addField([
            'name' => 'active',
            'label' => 'Activo',
            'type' => 'checkbox',
            'default' => true,
            'tab' => 'General'
        ]);
    }

    /**
     * Define what happens when the Update operation is loaded.
     * 
     * @see https://backpackforlaravel.com/docs/crud-operation-update
     * @return void
     */
    protected function setupUpdateOperation()
    {
        $this->setupCreateOperation();
    }
}
