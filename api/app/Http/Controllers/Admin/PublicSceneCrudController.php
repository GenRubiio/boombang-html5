<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MenuTypeEnum;
use App\Http\Requests\PublicSceneRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Prologue\Alerts\Facades\Alert;
use App\Http\Controllers\Admin\Traits\SuperadminProtection;


class PublicSceneCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use SuperadminProtection;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation {
        store as traitStore;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation {
        update as traitUpdate;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ReorderOperation;

    public function setup()
    {
        $this->applySuperadminProtection();

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

        // Add duplicate button
        $this->crud->addButtonFromModelFunction('line', 'duplicate', 'duplicateButton', 'beginning');
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
                'name' => 'npc_id',
                'label' => 'NPC Asociado',
                'type' => 'select',
                'entity' => 'npc',
                'model' => "App\Models\Npc",
                'attribute' => 'name',
                'tab' => 'General'
            ],
            [
                'name' => 'sound',
                'label' => 'Sonido',
                'type' => 'upload',
                'upload' => true,
                'disk' => 'uploads',
                'tab' => 'General'
            ],
            [
                'name' => 'darkening',
                'label' => 'Oscurecimiento',
                'type' => 'checkbox',
                'default' => true,
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
                'tab' => 'Mapa',
                'default' => 30
            ],
            [
                'name' => 'map_height',
                'label' => 'Alto del mapa',
                'type' => 'number',
                'tab' => 'Mapa',
                'default' => 30
            ],
            [
                'name' => 'big_scene',
                'label' => 'Escena Grande',
                'type' => 'checkbox',
                'default' => false,
                'tab' => 'Mapa'
            ],
            [
                'name' => 'start_x',
                'label' => 'Posición inicial X',
                'type' => 'number',
                'tab' => 'Mapa',
                'default' => 11
            ],
            [
                'name' => 'start_y',
                'label' => 'Posición inicial Y',
                'type' => 'number',
                'tab' => 'Mapa',
                'default' => 11
            ],
            [
                'name' => 'start_z',
                'label' => 'Posición inicial Z',
                'type' => 'number',
                'tab' => 'Mapa',
                'default' => 4,
                'attributes' => ["step" => "1", "min" => "0", "max" => "8"],
            ],
            [
                'name' => 'assets_data_repeatable',
                'label' => 'Assets',
                'type' => 'json',
                'view_namespace' => 'json-field-for-backpack::fields',
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
                        'name' => 'image',
                        'label' => 'Image',
                        'type' => 'upload',
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
                        'name' => 'show_from',
                        'type' => 'time',
                        'label' => 'Show From',
                        'wrapper' => ['class' => 'form-group col-md-4'],
                        'default' => '00:00',
                    ],
                    [
                        'name' => 'show_to',
                        'type' => 'time',
                        'label' => 'Show To',
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
            ],
            [
                'name' => 'scene_items_pivot',
                'label' => 'Items de la Escena',
                'type' => 'json',
                'view_namespace' => 'json-field-for-backpack::fields',
                'fake' => true,
                'store_in' => 'scene_items_pivot',
                'subfields' => [
                    [
                        'name' => 'scene_item_id',
                        'label' => 'Item',
                        'type' => 'select',
                        'model' => "App\Models\SceneItem",
                        'attribute' => 'name',
                        'wrapper' => ['class' => 'form-group col-md-12'],
                    ],
                    [
                        'name' => 'activate_time',
                        'label' => 'Tiempo de Activación',
                        'type' => 'number',
                        'default' => 180,
                        'attributes' => ["step" => "1", "min" => "1"],
                        'hint' => 'Tiempo en segundos que tarda el item en caer cundo se cumple la condición de mínimo de usuarios',
                        'wrapper' => ['class' => 'form-group col-md-6'],
                    ],
                    [
                        'name' => 'desactivate_time',
                        'label' => 'Tiempo de Desactivación',
                        'type' => 'number',
                        'default' => 15,
                        'attributes' => ["step" => "1", "min" => "1"],
                        'hint' => 'Tiempo en segundos que tarda el item en desaparecer después de haber caído',
                        'wrapper' => ['class' => 'form-group col-md-6'],
                    ],
                    [
                        'name' => 'min_users',
                        'label' => 'Mínimo de Usuarios',
                        'type' => 'number',
                        'default' => 1,
                        'attributes' => ["step" => "1", "min" => "1"],
                        'wrapper' => ['class' => 'form-group col-md-4'],
                    ],
                    [
                        'name' => 'sum_points',
                        'label' => 'Puntos a Sumar',
                        'type' => 'number',
                        'default' => 0,
                        'attributes' => ["step" => "1"],
                        'wrapper' => ['class' => 'form-group col-md-4'],
                    ],
                    [
                        'name' => 'sum_points_to_user_attribute',
                        'label' => 'Sumar Puntos a Atributo de Usuario',
                        'type' => 'checkbox',
                        'default' => false,
                        'wrapper' => ['class' => 'form-group col-md-4'],
                    ],
                    [
                        'name' => 'user_attribute_name',
                        'label' => 'Nombre del Atributo de Usuario',
                        'type' => 'text',
                        'hint' => 'Solo se usa si "Sumar Puntos a Atributo de Usuario" está marcado',
                        'wrapper' => ['class' => 'form-group col-md-6'],
                    ],
                    [
                        'name' => 'event_id',
                        'label' => 'Evento Asociado',
                        'type' => 'select',
                        'model' => "App\Models\Event",
                        'attribute' => 'name',
                        'wrapper' => ['class' => 'form-group col-md-6'],
                    ],
                    [
                        'name' => 'catalog_item_id',
                        'label' => 'Catalog Item Asociado',
                        'type' => 'select',
                        'model' => "App\Models\CatalogItem",
                        'attribute' => 'name',
                        'wrapper' => ['class' => 'form-group col-md-6'],
                    ]
                ],
                'new_item_label' => 'Añadir Item',
                'reorder' => true,
                'tab' => 'Items',
            ],
            [
                'name' => 'arrows_data',
                'label' => 'Flechas de la Escena',
                'type' => 'json',
                'view_namespace' => 'json-field-for-backpack::fields',
                'fake' => true,
                'store_in' => 'arrows',
                'subfields' => [
                    [
                        'name' => 'scene_arrow_id',
                        'label' => 'Flecha',
                        'type' => 'select',
                        'model' => "App\Models\SceneArrow",
                        'attribute' => 'name',
                        'wrapper' => ['class' => 'form-group col-md-4'],
                    ],
                    [
                        'name' => 'position_x',
                        'label' => 'Posición X',
                        'type' => 'number',
                        'default' => 11,
                        'hint' => 'Posición en el eje X de la flecha',
                        'wrapper' => ['class' => 'form-group col-md-4'],
                    ],
                    [
                        'name' => 'position_y',
                        'label' => 'Posición Y',
                        'type' => 'number',
                        'default' => 11,
                        'hint' => 'Posición en el eje Y de la flecha',
                        'wrapper' => ['class' => 'form-group col-md-4'],
                    ],
                    [
                        'name' => 'public_scene_id',
                        'label' => 'Escena Destino',
                        'type' => 'select',
                        'model' => "App\Models\PublicScene",
                        'attribute' => 'name',
                        'wrapper' => ['class' => 'form-group col-md-12'],
                    ],
                    [
                        'name' => 'position_door_x',
                        'label' => 'Posición Door X',
                        'type' => 'number',
                        'default' => 11,
                        'hint' => 'Posición en el eje X de la puerta',
                        'wrapper' => ['class' => 'form-group col-md-4'],
                    ],
                    [
                        'name' => 'position_door_y',
                        'label' => 'Posición Door Y',
                        'type' => 'number',
                        'default' => 11,
                        'hint' => 'Posición en el eje Y de la puerta',
                        'wrapper' => ['class' => 'form-group col-md-4'],
                    ],
                    [
                        'name' => 'position_door_z',
                        'label' => 'Posición Door Z',
                        'type' => 'number',
                        'default' => 2,
                        'hint' => 'Posición en el eje Z de la puerta',
                        'wrapper' => ['class' => 'form-group col-md-4'],
                    ],
                ],
                'new_item_label' => 'Añadir Flecha',
                'reorder' => true,
                'tab' => 'Arrows',
            ],
            [
                'name' => 'traps_data',
                'label' => 'Trampas de la Escena',
                'type' => 'json',
                'view_namespace' => 'json-field-for-backpack::fields',
                'fake' => true,
                'store_in' => 'traps_data',
                'subfields' => [
                    [
                        'name' => 'position_x',
                        'label' => 'Posición X',
                        'type' => 'number',
                        'default' => 11,
                        'hint' => 'Posición en el eje X de la trampa',
                        'wrapper' => ['class' => 'form-group col-md-4'],
                    ],
                    [
                        'name' => 'position_y',
                        'label' => 'Posición Y',
                        'type' => 'number',
                        'default' => 11,
                        'hint' => 'Posición en el eje Y de la trampa',
                        'wrapper' => ['class' => 'form-group col-md-4'],
                    ],
                    [
                        'name' => 'coconut_type',
                        'label' => 'Tipo de Coco',
                        'type' => 'select_from_array',
                        'options' => [
                            0 => 'Coco',
                            1 => 'Bola de nieve',
                            2 => 'Zapato',
                            3 => 'Pastel',
                            4 => 'Maceta',
                            5 => 'Avispas',
                            6 => 'Basura',
                            7 => 'Sandía',
                            8 => 'Yunque',
                            9 => 'Piano',
                        ],
                        'default' => 0,
                        'wrapper' => ['class' => 'form-group col-md-4'],
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
                'new_item_label' => 'Añadir Trampa',
                'reorder' => true,
                'tab' => 'Trampas',
            ],
        ]);
    }

    protected function setupUpdateOperation()
    {
        $this->setupCreateOperation();
    }

    public function store()
    {
        $this->crud->hasAccessOrFail('create');

        // Execute the FormRequest authorization and validation, if one is required
        $request = $this->crud->validateRequest();

        // Register any Model Events defined on fields
        $this->crud->registerFieldEvents();

        // Insert item in the db
        $item = $this->crud->create($this->crud->getStrippedSaveRequest($request));
        $this->data['entry'] = $this->crud->entry = $item;

        // Handle scene_items_pivot relationship
        $this->handleSceneItemsPivot($item, $request);

        // Handle traps relationship
        $this->handlePublicSceneTraps($item, $request);

        // Show a success message
        Alert::success(trans('backpack::crud.insert_success'))->flash();

        // Save the redirect choice for next time
        $this->crud->setSaveAction();

        return $this->crud->performSaveAction($item->getKey());
    }

    public function update()
    {
        $this->crud->hasAccessOrFail('update');

        // Execute the FormRequest authorization and validation, if one is required
        $request = $this->crud->validateRequest();

        // Register any Model Events defined on fields
        $this->crud->registerFieldEvents();

        // Update the row in the db
        $item = $this->crud->update(
            $request->get($this->crud->model->getKeyName()),
            $this->crud->getStrippedSaveRequest($request)
        );
        $this->data['entry'] = $this->crud->entry = $item;

        // Handle scene_items_pivot relationship
        $this->handleSceneItemsPivot($item, $request);

        // Handle traps relationship
        $this->handlePublicSceneTraps($item, $request);

        // Show a success message
        Alert::success(trans('backpack::crud.update_success'))->flash();

        // Save the redirect choice for next time
        $this->crud->setSaveAction();

        return $this->crud->performSaveAction($item->getKey());
    }

    private function handleSceneItemsPivot($publicScene, $request)
    {
        $pivotData = $request->get('scene_items_pivot');

        if (!empty($pivotData)) {
            if (is_string($pivotData)) {
                $pivotData = json_decode($pivotData, true);
            }

            if (is_array($pivotData)) {
                $syncData = [];
                foreach ($pivotData as $item) {
                    if (isset($item['scene_item_id']) && !empty($item['scene_item_id'])) {
                        $syncData[$item['scene_item_id']] = [
                            'activate_time' => $item['activate_time'] ?? null,
                            'desactivate_time' => $item['desactivate_time'] ?? null,
                            'min_users' => $item['min_users'] ?? 1,
                            'sum_points' => $item['sum_points'] ?? 0,
                            'sum_points_to_user_attribute' => isset($item['sum_points_to_user_attribute']) ? (bool)$item['sum_points_to_user_attribute'] : false,
                            'user_attribute_name' => $item['user_attribute_name'] ?? null,
                            'event_id' => $item['event_id'] ?? null,
                            'catalog_item_id' => $item['catalog_item_id'] ?? null,
                        ];
                    }
                }

                // Sincronizar la relación
                $publicScene->items()->sync($syncData);
            }
        } else {
            // Si no hay datos, limpiar la relación
            $publicScene->items()->sync([]);
        }
    }

    private function handlePublicSceneTraps($publicScene, $request)
    {
        $trapsData = $request->get('traps_data');

        // Primero eliminamos todas las trampas existentes
        $publicScene->traps()->delete();

        if (!empty($trapsData)) {
            if (is_string($trapsData)) {
                $trapsData = json_decode($trapsData, true);
            }

            if (is_array($trapsData)) {
                foreach ($trapsData as $trapData) {
                    if (isset($trapData['position_x']) && isset($trapData['position_y'])) {
                        $publicScene->traps()->create([
                            'position_x' => $trapData['position_x'],
                            'position_y' => $trapData['position_y'],
                            'coconut_type' => $trapData['coconut_type'] ?? 0,
                            'active' => isset($trapData['active']) ? (bool)$trapData['active'] : true,
                        ]);
                    }
                }
            }
        }
    }

    protected function setupReorderOperation()
    {
        // define which model attribute will be shown on draggable elements
        $this->crud->set('reorder.label', 'name');
        // define how deep the admin is allowed to nest the items
        // for infinite levels, set it to 0
        $this->crud->set('reorder.max_level', 2);

        // if you don't fully trust the input in your database, you can set 
        // "escaped" to true, so that the label is escaped before being shown
        // you can also enable it globally in config/backpack/operations/reorder.php
        $this->crud->set('reorder.escaped', true);
    }

    public function duplicate($id)
    {
        $this->crud->hasAccessOrFail('create');

        // Get the original record
        $original = $this->crud->model->findOrFail($id);

        // Create array with all attributes except id and timestamps
        $attributes = $original->toArray();
        unset($attributes['id']);
        unset($attributes['created_at']);
        unset($attributes['updated_at']);

        // Modify the name to indicate it's a duplicate
        $attributes['name'] = $attributes['name'] . ' (Copia)';

        // Handle assets_data duplication with file copying
        if (!empty($attributes['assets_data'])) {
            $attributes['assets_data'] = $this->duplicateAssetsData($attributes['assets_data'], $attributes['name']);
        }

        // Create the new record
        $duplicate = $this->crud->model->create($attributes);

        // Handle pivot relationships - duplicate scene items relationships
        if ($original->items()->exists()) {
            $pivotData = [];
            foreach ($original->items as $item) {
                $pivotData[$item->id] = [
                    'activate_time' => $item->pivot->activate_time,
                    'desactivate_time' => $item->pivot->desactivate_time,
                    'min_users' => $item->pivot->min_users,
                    'sum_points' => $item->pivot->sum_points,
                    'sum_points_to_user_attribute' => $item->pivot->sum_points_to_user_attribute,
                    'user_attribute_name' => $item->pivot->user_attribute_name,
                    'event_id' => $item->pivot->event_id,
                    'catalog_item_id' => $item->pivot->catalog_item_id,
                ];
            }
            $duplicate->items()->sync($pivotData);
        }

        // Handle traps - duplicate traps
        if ($original->traps()->exists()) {
            foreach ($original->traps as $trap) {
                $duplicate->traps()->create([
                    'position_x' => $trap->position_x,
                    'position_y' => $trap->position_y,
                    'coconut_type' => $trap->coconut_type,
                    'active' => $trap->active,
                ]);
            }
        }

        Alert::success('Registro duplicado exitosamente')->flash();

        return redirect($this->crud->route);
    }

    private function duplicateAssetsData($assetsData, $newName)
    {
        if (is_string($assetsData)) {
            $assetsData = json_decode($assetsData, true);
        }

        if (!is_array($assetsData)) {
            return $assetsData;
        }

        $newAssetsData = $assetsData;
        $newDestinationPath = "uploads/public-scene/" . \Illuminate\Support\Str::slug($newName) . "/assets";

        // Create new directory for duplicated assets
        if (!\Illuminate\Support\Facades\File::exists($newDestinationPath)) {
            \Illuminate\Support\Facades\File::makeDirectory($newDestinationPath, 0777, true, true);
        }

        // Process each asset and copy files
        foreach ($newAssetsData as $key => &$asset) {
            if (isset($asset['image']) && !empty($asset['image']) && is_string($asset['image'])) {
                $originalPath = $asset['image'];
                if (\Illuminate\Support\Facades\File::exists($originalPath)) {
                    $filename = basename($originalPath);
                    $newPath = $newDestinationPath . '/' . $filename;
                    \Illuminate\Support\Facades\File::copy($originalPath, $newPath);
                    $asset['image'] = $newPath;
                }
            }
        }

        return json_encode($newAssetsData);
    }
}
