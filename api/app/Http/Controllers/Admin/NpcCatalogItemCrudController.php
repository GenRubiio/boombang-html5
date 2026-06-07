<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\NpcCatalogItemRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use App\Http\Controllers\Admin\Traits\SuperadminProtection;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

class NpcCatalogItemCrudController extends CrudController
{
    use SuperadminProtection;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation {
        store as traitStore;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation {
        update as traitUpdate;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;

    public function setup()
    {
        $this->applySuperadminProtection();

        CRUD::setModel(\App\Models\NpcCatalogItem::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/npc-catalog-item');
        CRUD::setEntityNameStrings('asignación de objeto a NPC', 'asignaciones de objetos a NPCs');
    }

    protected function setupListOperation()
    {
        CRUD::setColumns([
            [
                'name' => 'id',
                'label' => 'ID',
                'type' => 'text',
            ],
            [
                'name' => 'npc_id',
                'label' => 'NPC',
                'type' => 'select',
                'entity' => 'npc',
                'attribute' => 'name',
                'model' => 'App\Models\Npc',
            ],
            [
                'name' => 'catalog_item_id',
                'label' => 'Objeto del Catálogo',
                'type' => 'select',
                'entity' => 'catalogItem',
                'attribute' => 'name',
                'model' => 'App\Models\CatalogItem',
            ],
            [
                'name' => 'active',
                'label' => 'Activo',
                'type' => 'check',
            ],
        ]);

        // Filtros
        $this->crud->filter('npc_id')
            ->type('select2')
            ->label('NPC')
            ->values(function () {
                return \App\Models\Npc::where('type', 'objects')->pluck('name', 'id')->toArray();
            })
            ->whenActive(function ($value) {
                $this->crud->addClause('where', 'npc_id', $value);
            });
    }

    protected function setupCreateOperation()
    {
        CRUD::setValidation(NpcCatalogItemRequest::class);

        $this->crud->addFields([
            [
                'name' => 'npc_id',
                'label' => 'NPC',
                'type' => 'select2',
                'entity' => 'npc',
                'attribute' => 'name',
                'model' => 'App\Models\Npc',
                'options' => (function ($query) {
                    return $query->where('type', 'objects')->where('active', true)->get();
                }),
                'hint' => 'Solo se muestran NPCs de tipo "Objects" activos',
                'tab' => 'General',
            ],
            [
                'name' => 'catalog_item_id',
                'label' => 'Objeto del Catálogo',
                'type' => 'select2',
                'entity' => 'catalogItem',
                'attribute' => 'name',
                'model' => 'App\Models\CatalogItem',
                'tab' => 'General',
            ],
            [
                'name' => 'active',
                'label' => 'Activo',
                'type' => 'checkbox',
                'default' => true,
                'tab' => 'General',
            ],
        ]);

        // Campo repeatable para gestionar los requisitos
        $this->crud->addField([
            'name' => 'requirements',
            'label' => 'Requisitos para Reclamar este Objeto',
            'type' => 'repeatable',
            'fields' => [
                [
                    'name' => 'required_catalog_item_id',
                    'label' => 'Objeto Requerido (opcional)',
                    'type' => 'select2',
                    'model' => 'App\Models\CatalogItem',
                    'attribute' => 'name',
                    'wrapper' => ['class' => 'form-group col-md-6'],
                ],
                [
                    'name' => 'required_quantity',
                    'label' => 'Cantidad',
                    'type' => 'number',
                    'default' => 1,
                    'attributes' => ['min' => 1],
                    'wrapper' => ['class' => 'form-group col-md-2'],
                ],
                [
                    'name' => 'required_gold_coins',
                    'label' => 'Oro',
                    'type' => 'number',
                    'default' => 0,
                    'attributes' => ['min' => 0],
                    'wrapper' => ['class' => 'form-group col-md-2'],
                ],
                [
                    'name' => 'required_silver_coins',
                    'label' => 'Plata',
                    'type' => 'number',
                    'default' => 0,
                    'attributes' => ['min' => 0],
                    'wrapper' => ['class' => 'form-group col-md-2'],
                ],
            ],
            'new_item_label' => 'Añadir Requisito',
            'init_rows' => 0,
            'min_rows' => 0,
            'max_rows' => 10,
            'tab' => 'Requisitos',
            'hint' => 'Define qué objetos y/o créditos necesita el usuario para reclamar este objeto del NPC.<br><strong>Importante:</strong> Cada requisito debe tener al menos un objeto O créditos.',
        ]);
    }

    protected function setupUpdateOperation()
    {
        $this->setupCreateOperation();

        // Cargar requisitos existentes del CatalogItem asignado
        $npcCatalogItem = $this->crud->getCurrentEntry();
        if ($npcCatalogItem && $npcCatalogItem->catalogItem) {
            $catalogItem = $npcCatalogItem->catalogItem;
            if ($catalogItem->requirements) {
                $existingRequirements = $catalogItem->requirements->map(function ($req) {
                    return [
                        'required_catalog_item_id' => $req->required_catalog_item_id,
                        'required_quantity' => $req->required_quantity,
                        'required_gold_coins' => $req->required_gold_coins,
                        'required_silver_coins' => $req->required_silver_coins,
                    ];
                })->toArray();

                $this->crud->modifyField('requirements', ['value' => $existingRequirements]);
            }
        }
    }

    protected function store()
    {
        $response = $this->traitStore();

        // Guardar requisitos
        $this->saveRequirements();

        return $response;
    }

    protected function update()
    {
        $response = $this->traitUpdate();

        // Guardar requisitos
        $this->saveRequirements();

        return $response;
    }

    /**
     * Guardar los requisitos del CatalogItem asignado al NPC
     */
    protected function saveRequirements()
    {
        $npcCatalogItem = $this->crud->entry;
        $catalogItem = $npcCatalogItem->catalogItem;
        $requirements = $this->crud->getRequest()->get('requirements', []);

        // Eliminar requisitos existentes del CatalogItem
        $catalogItem->requirements()->delete();

        // Guardar nuevos requisitos
        if (!empty($requirements) && is_array($requirements)) {
            foreach ($requirements as $requirement) {
                // Validar que al menos tenga un valor
                $hasItem = !empty($requirement['required_catalog_item_id']);
                $hasGold = !empty($requirement['required_gold_coins']) && $requirement['required_gold_coins'] > 0;
                $hasSilver = !empty($requirement['required_silver_coins']) && $requirement['required_silver_coins'] > 0;

                if ($hasItem || $hasGold || $hasSilver) {
                    \App\Models\CatalogItemRequirement::create([
                        'catalog_item_id' => $catalogItem->id,
                        'required_catalog_item_id' => $requirement['required_catalog_item_id'] ?? null,
                        'required_quantity' => $requirement['required_quantity'] ?? 1,
                        'required_gold_coins' => $requirement['required_gold_coins'] ?? 0,
                        'required_silver_coins' => $requirement['required_silver_coins'] ?? 0,
                    ]);
                }
            }
        }
    }
}
