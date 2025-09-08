<?php

namespace App\Http\Controllers\Admin;

use Backpack\CRUD\app\Http\Controllers\CrudController;
use App\Http\Controllers\Admin\Traits\SuperadminProtection;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

class SettingCrudController extends CrudController
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


        $this->crud->setModel("App\Models\Setting");
        $this->crud->setEntityNameStrings(
            trans('backpack::settings.setting_singular'),
            trans('backpack::settings.setting_plural')
        );
        $this->crud->setRoute(backpack_url('setting'));
    }

    public function setupListOperation()
    {
        $this->crud->setOperationSetting('lineButtonsAsDropdown', true);

        // only show settings which are marked as active
        //$this->crud->addClause('where', 'active', 1);

        // columns to show in the table view
        $this->crud->setColumns([
            [
                'name' => 'type',
                'label' => trans('admin.type')
            ],
            [
                'name' => 'key',
                'label' => trans('admin.key'),
            ],
            [
                'name' => 'name',
                'label' => trans('backpack::settings.name'),
            ],
            [
                'name' => 'value',
                'label' => trans('backpack::settings.value'),
                'limit' => 30,
            ],
            [
                'name' => 'active',
                'type' => 'btnToggle',
                'label' => trans('admin.active')
            ]
        ]);
        $this->crud->addColumns([
            ['name' => 'active', 'type' => 'btnToggle', 'label' => trans('admin.active')]
        ]);
    }

    public function setupCreateOperation()
    {
        $this->crud->addFields([
            [
                'name' => 'key',
                'label' => trans('admin.key'),
                'type' => 'text',
                'hint' => trans('admin.key_hint'),
            ],
            [
                'name' => 'type',
                'label' => trans('admin.type'),
                'type' => 'enum',
            ],
            [
                'name' => 'name',
                'label' => trans('backpack::permissionmanager.name'),
                'type' => 'text',
            ],
            [
                'name' => 'description',
                'label' => trans('admin.description'),
                'type' => 'text',
            ],
            [
                'name' => 'field',
                'type' => 'hidden',
            ],
        ]);
    }

    public function setupUpdateOperation()
    {
        $this->crud->setOperationSetting('showDeleteButton', true);

        $this->crud->addFields([
            [
                'name' => 'key',
                'label' => trans('admin.key'),
                'type' => 'text',
                'attributes' => [
                    'disabled' => 'disabled',
                ],
            ],
            [
                'name' => 'type',
                'label' => trans('admin.type'),
                'type' => 'text',
                'attributes' => [
                    'disabled' => 'disabled',
                ],
            ],
            [
                'name' => 'name',
                'label' => trans('backpack::permissionmanager.name'),
                'type' => 'text',
            ],
            [
                'name' => 'description',
                'label' => trans('admin.description'),
                'type' => 'text',
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

        $this->crud->addField(json_decode($this->crud->getCurrentEntry()->field, true));
    }

    public function store()
    {
        $this->crud->setRequest(request()->merge(['field' => $this->crud->getRequest()->get('type')]));
        return $this->traitStore();
    }

    public function update()
    {
        return $this->traitUpdate();
    }
}
