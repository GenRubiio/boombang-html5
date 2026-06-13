<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\MinigameScoreRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

/**
 * Class MinigameScoreCrudController
 * @package App\Http\Controllers\Admin
 * @property-read \Backpack\CRUD\app\Library\CrudPanel\CrudPanel $crud
 */
class MinigameScoreCrudController extends CrudController
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
        CRUD::setModel(\App\Models\MinigameScore::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/minigame-score');
        CRUD::setEntityNameStrings('minigame score', 'minigame scores');
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

        // if opened from Minigame, filter by minigame_id query param
        if (request()->has('minigame_id')) {
            $this->crud->addClause('where', 'minigame_id', '=', request()->get('minigame_id'));
        }

        /**
         * Columns can be defined using the fluent syntax:
         * - CRUD::column('price')->type('number');
         */
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
        CRUD::setValidation(MinigameScoreRequest::class);
        // fields based on MinigameScore::$fillable
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
                'label' => 'Minigame Week',
                'type' => 'select',
                'name' => 'minigame_week_id',
                'entity' => 'minigameWeek',
                'attribute' => 'week_number',
                'model' => \App\Models\MinigameWeek::class,
            ],
            [
                'label' => 'Minigame',
                'type' => 'select',
                'name' => 'minigame_id',
                'entity' => 'minigame',
                'attribute' => 'name',
                'model' => \App\Models\Minigame::class,
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
