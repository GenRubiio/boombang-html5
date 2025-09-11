<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\UserCatalogItemRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use App\Http\Controllers\Admin\Traits\SuperadminProtection;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

/**
 * Class UserCatalogItemCrudController
 * @package App\Http\Controllers\Admin
 * @property-read \Backpack\CRUD\app\Library\CrudPanel\CrudPanel $crud
 */
class UserCatalogItemCrudController extends CrudController
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

        CRUD::setModel(\App\Models\UserCatalogItem::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/user-catalog-item');
        CRUD::setEntityNameStrings('user catalog item', 'user catalog items');

        if (request()->has('user_id')) {
            $userId = request('user_id');
            $user = \App\Models\User::find($userId);
            $this->crud->addClause('where', 'user_id', '=', $userId);

            $this->data['breadcrumbs'] = [
                trans('backpack::crud.admin') => backpack_url('dashboard'),
                trans('backpack::permissionmanager.users') => backpack_url('user'),
                'Items' => false,
            ];

            if ($user) {
                $this->crud->setHeading('Items for ' . $user->name);
            }
        }
    }

    /**
     * Define what happens when the List operation is loaded.
     * 
     * @see  https://backpackforlaravel.com/docs/crud-operation-list-entries
     * @return void
     */
    protected function setupListOperation()
    {
        $this->crud->addFilter([
            'name'  => 'user_id',
            'type'  => 'select2',
            'label' => 'User',
        ], function () {
            return \App\Models\User::all()->pluck('username', 'id')->toArray();
        }, function ($value) {
            $this->crud->addClause('where', 'user_id', $value);
        });

        $this->crud->addColumn([
            'name' => 'id',
            'label' => 'ID',
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'user_id',
            'label' => 'User',
            'type' => 'select',
            'entity' => 'user',
            'attribute' => 'username',
            'model' => "App\Models\User",
        ]);
        $this->crud->addColumn([
            'name' => 'catalog_item_id',
            'label' => 'Catalog Item',
            'type' => 'select',
            'entity' => 'catalogItem',
            'attribute' => 'name',
            'model' => "App\Models\CatalogItem",
        ]);
        $this->crud->addColumn([
            'name' => 'show_in_inventory',
            'label' => 'Show in inventory',
            'type' => 'boolean',
        ]);
        $this->crud->addColumn([
            'name' => 'expires_at',
            'label' => 'Expires at',
            'type' => 'datetime',
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
        CRUD::setValidation(UserCatalogItemRequest::class);

        $this->crud->addFields([
            [
                'name' => 'user_id',
                'label' => 'User',
                'type' => 'select2',
                'entity' => 'user',
                'attribute' => 'username',
                'model' => "App\\Models\\User",
                'defaultValue' => request('user_id')
            ],
            [
                'name' => 'catalog_item_id',
                'label' => 'Catalog Item',
                'type' => 'select2',
                'entity' => 'catalogItem',
                'attribute' => 'name',
                'model' => "App\\Models\\CatalogItem",
            ],
            [
                'name' => 'show_in_inventory',
                'label' => 'Show in inventory',
                'type' => 'checkbox',
                'default' => true,
            ],
            [
                'name' => 'expires_at',
                'label' => 'Expires at',
                'type' => 'datetime'
            ]
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
