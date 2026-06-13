<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\EventScoreRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

/**
 * Class EventScoreCrudController
 * @package App\Http\Controllers\Admin
 * @property-read \Backpack\CRUD\app\Library\CrudPanel\CrudPanel $crud
 */
class EventScoreCrudController extends CrudController
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
        CRUD::setModel(\App\Models\EventScore::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/event-score');
        CRUD::setEntityNameStrings('event score', 'event scores');
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

        // if opened from Event, filter by event_id query param
        if (request()->has('event_id')) {
            $this->crud->addClause('where', 'event_id', '=', request()->get('event_id'));
        }

        /**
         * Columns can be defined using the fluent syntax:
         * - CRUD::column('price')->type('number');
         */
            CRUD::addColumn([
                'name' => 'event',
                'type' => 'select',
                'label' => 'Event',
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
        CRUD::setValidation(EventScoreRequest::class);
        // fields based on EventScore::$fillable
        CRUD::addFields([
            [
                'label' => 'User',
                'type' => 'select',
                'name' => 'user_id',
                'entity' => 'user',
                'attribute' => 'username',
                'model' => \App\Models\User::class,
            ],
            [
                'label' => 'Event',
                'type' => 'select',
                'name' => 'event_id',
                'entity' => 'event',
                'attribute' => 'name',
                'model' => \App\Models\Event::class,
            ],
            [
                'name' => 'score',
                'type' => 'number',
                'label' => 'Score',
            ],
        ]);

        /**
         * Fields can be defined using the fluent syntax:
         * - CRUD::field('price')->type('number');
         */
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
