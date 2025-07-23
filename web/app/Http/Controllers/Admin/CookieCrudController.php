<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CookieCategoriesEnum;
use App\Http\Requests\CookieRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

class CookieCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ReorderOperation;

    public function setup()
    {
        CRUD::setModel(\App\Models\Cookie::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/cookie');
        CRUD::setEntityNameStrings(trans('admin.cookie'), trans('admin.cookies'));
    }

    protected function setupListOperation()
    {
        $this->setListFilters();
        $this->crud->setOperationSetting('lineButtonsAsDropdown', true);
        CRUD::setColumns([
            [
                'name' => 'id',
                'label' => trans('admin.id')
            ],
            [
                'name' => 'category',
                'label' => trans('admin.category'),
                'type' => 'select_from_array',
                'options' => CookieCategoriesEnum::toAssociativeArray(),
            ],
            [
                'name' => 'name',
                'type' => 'text',
                'label' => trans('admin.name'),
            ],
            [
                'name' => 'description',
                'type' => 'textarea',
                'label' => trans('admin.description'),
            ],
            [
                'name' => 'duration',
                'type' => 'number',
                'label' => trans('admin.duration_min'),
            ],
            [
                'name' => 'active',
                'type' => 'btnToggle',
                'label' => trans('admin.active')
            ],
        ]);
    }

    protected function setupReorderOperation()
    {
        $this->crud->set('reorder.label', 'name');
        $this->crud->set('reorder.max_level', 1);
    }

    private function setListFilters()
    {
        $this->crud->filter('category')
            ->type('select2_multiple')
            ->label('Category')
            ->values(function () {
                return CookieCategoriesEnum::toAssociativeArray();
            })
            ->placeholder('Select categories')
            ->whenActive(function ($value) {
                $this->crud->addClause('whereIn', 'category', json_decode($value));
            });
    }

    protected function setupCreateOperation()
    {
        CRUD::setValidation(CookieRequest::class);

        $this->crud->addFields([
            [
                'name' => 'category',
                'label' => trans('admin.category'),
                'type' => 'select2_from_array',
                'options' => CookieCategoriesEnum::toAssociativeArray(),
            ],
            [
                'name' => 'name',
                'type' => 'text',
                'label' => trans('admin.name'),
                'hint' => trans('admin.cookies_name_hint'),
            ],
            [
                'name' => 'description',
                'type' => 'textarea',
                'label' => trans('admin.description'),
                'hint' => trans('admin.cookies_description_hint'),
            ],
            [
                'name' => 'duration',
                'type' => 'number',
                'label' => trans('admin.duration_min'),
                'attributes' => [
                    'min' => 1,
                    'step' => 1,
                ],
                'default' => 60,
                'hint' => trans('admin.cookies_duration_hint'),
            ],
            [
                'name' => 'active',
                'label' => trans('admin.active'),
                'type' => 'radio',
                'options' => [
                    1 => trans('backpack::crud.yes'),
                    0 => trans('backpack::crud.no')
                ],
                'default' => 0,
                'inline' => true,
            ],
        ]);
    }

    protected function setupUpdateOperation()
    {
        $this->setupCreateOperation();
    }
}
