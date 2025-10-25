<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\RewardRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

/**
 * Class RewardCrudController
 * @package App\Http\Controllers\Admin
 * @property-read \Backpack\CRUD\app\Library\CrudPanel\CrudPanel $crud
 */
class RewardCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
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
        CRUD::setModel(\App\Models\Reward::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/reward');
        CRUD::setEntityNameStrings('reward', 'rewards');
    }

    /**
     * Define what happens when the List operation is loaded.
     * 
     * @see  https://backpackforlaravel.com/docs/crud-operation-list-entries
     * @return void
     */
    protected function setupListOperation()
    {
        CRUD::setFromDb(); // set columns from db columns.
        // support filtering by event or minigame when navigated from parent
        if (request()->has('event_id')) {
            $this->crud->addClause('where', 'event_id', '=', request()->get('event_id'));
        }
        if (request()->has('minigame_id')) {
            $this->crud->addClause('where', 'minigame_id', '=', request()->get('minigame_id'));
        }

        /**
         * Columns can be defined using the fluent syntax:
         * - CRUD::column('price')->type('number');
         */
            CRUD::addColumn([
                'name' => 'event',
                'type' => 'relationship',
                'label' => 'Event',
            ]);
            CRUD::addColumn([
                'name' => 'minigame',
                'type' => 'relationship',
                'label' => 'Minigame',
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
        CRUD::setValidation(RewardRequest::class);
        // fields based on Reward::$fillable
        CRUD::addFields([
            [
                'label' => 'Minigame',
                'type' => 'select2',
                'name' => 'minigame_id',
                'entity' => 'minigame',
                'attribute' => 'name',
                'model' => \App\Models\Minigame::class,
            ],
            [
                'label' => 'Event',
                'type' => 'select2',
                'name' => 'event_id',
                'entity' => 'event',
                'attribute' => 'name',
                'model' => \App\Models\Event::class,
            ],
            [
                'label' => 'Catalog Item',
                'type' => 'select2',
                'name' => 'catalog_item_id',
                'entity' => 'catalogItem',
                'attribute' => 'name',
                'model' => \App\Models\CatalogItem::class,
            ],
            [
                'name' => 'quantity',
                'type' => 'number',
                'label' => 'Quantity',
            ],
            [
                'name' => 'rank_from',
                'type' => 'number',
                'label' => 'Rank From',
            ],
            [
                'name' => 'rank_to',
                'type' => 'number',
                'label' => 'Rank To',
            ],
        ]);

        /**
         * Fields can be defined using the fluent syntax:
         * - CRUD::field('price')->type('number');
         */
            CRUD::addField([
                'name' => 'event',
                'type' => 'relationship',
                'label' => 'Event',
            ]);
            CRUD::addField([
                'name' => 'minigame',
                'type' => 'relationship',
                'label' => 'Minigame',
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
