<?php

namespace App\Http\Controllers\Admin;

use App\Models\ParametricTable;
use Exception;
use Illuminate\Support\Str;
use Prologue\Alerts\Facades\Alert;
use App\Exceptions\GenericException;
use App\Http\Requests\ParametricTableRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use App\Http\Controllers\Admin\Traits\SuperadminProtection;
use App\Tasks\ParametricTables\CreateParamTableValueTask;

class ParametricTableCrudController extends CrudController
{
    use SuperadminProtection;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation {
        store as traitStore;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;

    public function setup()
    {
        $this->applySuperadminProtection();

        $this->crud->setModel(\App\Models\ParametricTable::class);
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/parametric-table');
        $this->crud->setEntityNameStrings('tabla paramétrica', 'tablas paramétricas');

        if (env('APP_ENV') != 'local') {
            $this->crud->removeButton('delete');
        }
    }

    protected function setupListOperation()
    {
        $this->crud->addButtonFromView('line', 'parametric-table-values', 'parametric-table-values', 'beginning');
        $this->crud->addColumn([
            'name' => 'id',
            'label' => trans('admin.parametric-table-id'),
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'table_name',
            'label' => trans('admin.parametric-table-name'),
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'table_description',
            'label' => trans('admin.parametric-table-description'),
            'type' => 'textarea',
        ]);
        $this->crud->addColumn([
            'name' => 'count_values',
            'label' => trans('admin.parametric-table-count'),
            'type' => 'number',
        ]);
        $this->crud->addColumn([
            'name' => 'resource',
            'label' => trans('admin.parametric-table-api-resource'),
            'type' => 'btnToggle',
        ]);
    }

    protected function setupCreateOperation()
    {
        $this->crud->setValidation(ParametricTableRequest::class);

        $this->crud->addFields([
            [
                'name' => 'table_name',
                'label' => trans('admin.parametric-table-name'),
                'type' => 'text',
                'tab' => 'Tabla'
            ],
            [
                'name' => 'table_description',
                'label' => trans('admin.parametric-table-description'),
                'type' => 'textarea',
                'tab' => 'Tabla'
            ],
            [
                'name' => 'name',
                'label' => trans('admin.name'),
                'type' => 'text',
                'tab' => 'Tabla'
            ],
            [
                'name' => 'resource',
                'type' => 'checkbox',
                'label' => trans('admin.parametric-table-api-resource'),
                'default' => false,
                'tab' => 'Tabla'
            ]
        ]);

        if (env('APP_ENV') == 'local') {
            $this->crud->addFields([
                [
                    'name' => 'create_model_table_values',
                    'label' => trans('admin.parametric-table-create-model'),
                    'type' => 'checkbox',
                    'default' => true,
                    'tab' => 'Configuración (Valores)'
                ],
                [
                    'name' => 'create_backpack_table_values',
                    'label' => trans('admin.parametric-table-create-crud'),
                    'type' => 'checkbox',
                    'default' => false,
                    'tab' => 'Configuración (Valores)'
                ],
                [
                    'name' => 'create_hexagonal_table_values',
                    'label' => trans('admin.parametric-table-create-hexagonal'),
                    'type' => 'checkbox',
                    'default' => false,
                    'tab' => 'Configuración (Valores)'
                ],
            ]);
        }
    }

    protected function setupUpdateOperation()
    {
        $this->crud->setValidation(ParametricTableRequest::class);

        $this->crud->addFields([
            [
                'name' => 'id',
                'label' => trans('admin.parametric-table-id'),
                'type' => 'text',
                'attributes' => [
                    'readonly' => 'readonly',
                ],
            ],
            [
                'name' => 'table_name',
                'label' => trans('admin.parametric-table-name'),
                'type' => 'text',
            ],
            [
                'name' => 'table_description',
                'label' => trans('admin.parametric-table-description'),
                'type' => 'textarea',
            ],
            [
                'name' => 'name',
                'label' => trans('admin.name'),
                'type' => 'text',
            ],
            [
                'name' => 'resource',
                'type' => 'checkbox',
                'label' => trans('admin.parametric-table-api-resource'),
                'default' => true,
            ],
        ]);
    }

    public function store()
    {
        $tableName = Str::slug(request()->input('table_name'), '_');
        if (ParametricTable::where('id', $tableName)->count()) {
            Alert::add('error', 'El ID ya existe')->flash();
            return back();
        }
        $createModel = request()->input('create_model_table_values') ?? false;
        $createBackpackCrud = request()->input('create_backpack_table_values') ?? false;
        $createHexagonalStructure = request()->input('create_hexagonal_table_values') ?? false;
        try {
            (new CreateParamTableValueTask($tableName, $createModel, $createBackpackCrud, $createHexagonalStructure))->run();
            return $this->traitStore();
        } catch (GenericException | Exception $e) {
            Alert::add('error', $e->getMessage())->flash();
            return back();
        }
    }
}
