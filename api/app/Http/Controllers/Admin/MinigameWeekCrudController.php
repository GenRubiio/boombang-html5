<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\MinigameWeekRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

/**
 * Class MinigameWeekCrudController
 * @package App\Http\Controllers\Admin
 * @property-read \Backpack\CRUD\app\Library\CrudPanel\CrudPanel $crud
 */
class MinigameWeekCrudController extends CrudController
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
        CRUD::setModel(\App\Models\MinigameWeek::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/minigame-week');
        CRUD::setEntityNameStrings('minigame week', 'minigame weeks');
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

        /**
         * Columns can be defined using the fluent syntax:
         * - CRUD::column('price')->type('number');
         */
            // add button to view scores for the week and back to parent minigame
            $this->crud->addButtonFromView('line', 'week_scores', 'minigame_week_scores', 'beginning');
            $this->crud->addButtonFromView('line', 'back_to_minigame', 'back_to_minigame', 'end');

            CRUD::addColumn([
                'name' => 'minigame',
                'type' => 'select',
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
        CRUD::setValidation(MinigameWeekRequest::class);
        // fields based on MinigameWeek::$fillable
        CRUD::addFields([
            [
                'label' => 'Minigame',
                'type' => 'select',
                'name' => 'minigame_id',
                'entity' => 'minigame',
                'attribute' => 'name',
                'model' => \App\Models\Minigame::class,
            ],
            [
                'name' => 'week_number',
                'type' => 'number',
                'label' => 'Week Number',
            ],
            [
                'name' => 'year',
                'type' => 'number',
                'label' => 'Year',
            ],
            [
                'name' => 'start_date',
                'type' => 'datetime',
                'label' => 'Start Date',
            ],
            [
                'name' => 'end_date',
                'type' => 'datetime',
                'label' => 'End Date',
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
