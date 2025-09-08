<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\ParametricTableValueUpdateRequest;
use App\Models\ParametricTableValue;
use Illuminate\Support\Facades\Route;
use App\Http\Requests\ParametricTableValueCreateRequest;
use App\Models\ParametricTable;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use App\Http\Controllers\Admin\Traits\SuperadminProtection;

class ParametricTableValueCrudController extends CrudController
{
    use SuperadminProtection;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ShowOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ReorderOperation;

    protected $parametricTableId;
    protected $parametricTable;

    public function setup()
    {
        $this->applySuperadminProtection();

        $this->crud->setModel(ParametricTableValue::class);
        $this->parametricTableId = Route::current()->parameter('parametric_table_id');
        $this->crud->setRoute('admin/parametric-table/' . $this->parametricTableId . '/parametric-table-value');
        $this->parametricTable = ParametricTable::find($this->parametricTableId);
        if ($this->parametricTableId) {
            $this->crud->setEntityNameStrings('valor a ' . $this->parametricTable->table_name, 'Valores de tabla paramétrica ' . $this->parametricTable->table_name);
        } else {
            $this->crud->setEntityNameStrings('valor', 'Valores de tabla paramétrica');
        }
        $this->breadCrumbs();
        $this->listFilter();

        if (!isAdminOrSuperadmin()) {
            abort(403);
        }
    }

    protected function breadCrumbs()
    {
        $this->data['breadcrumbs'] = [
            trans('backpack::crud.admin') => backpack_url('dashboard'),
            'Tablas Paramétricas' => backpack_url('parametric-table'),
            'Valores' => backpack_url("parametric-table/" . $this->parametricTableId . "/parametric-table-value"),
            trans('backpack::crud.list') => false,
        ];
    }

    protected function listFilter()
    {
        $this->crud->addClause('where', 'parametric_table_id', $this->parametricTableId)
            ->ordered();
    }


    protected function setupListOperation()
    {
        $this->crud->addColumns([
            /*
            [
                'label' => 'Tabla',
                'type' => 'select',
                'name' => 'parametric_table_id',
                'entity' => 'parametricTable',
                'attribute' => 'table_name',
                'model' => "App\Models\ParametricTable",
            ],
            */
            [
                'name' => 'id',
                'label' => trans('admin.id'),
                'type' => 'text',
            ],
            [
                'name' => 'name',
                'label' => trans('admin.name'),
                'type' => 'text',
            ],
            [
                'name' => 'value',
                'label' => trans('admin.value'),
                'type' => 'text',
            ],
            [
                'name' => 'resource',
                'type' => 'btnToggle',
                'label' => trans('admin.parametric-table-api-resource'),
            ],
            [
                'name' => 'visible',
                'type' => 'btnToggle',
                'label' => trans('admin.visible'),
            ],
            [
                'name' => 'active',
                'type' => 'btnToggle',
                'label' => trans('admin.active'),
            ]
        ]);
    }

    protected function setupCreateOperation()
    {
        $this->crud->setValidation(ParametricTableValueCreateRequest::class);

        $this->crud->addFields([
            [
                'name' => 'parametric_table_id',
                'type' => 'hidden',
                'value' => $this->parametricTableId
            ],
            [
                'name' => 'name',
                'label' => trans('admin.key') . ' - ' . trans('admin.name'),
                'type' => 'text',
            ],
            [
                'name' => 'value',
                'label' => trans('admin.value'),
                'type' => 'text',
            ],
            [
                'name' => 'description',
                'label' => trans('admin.description'),
                'type' => 'textarea',
            ],
            [
                'name' => 'resource',
                'type' => 'checkbox',
                'label' => trans('admin.parametric-table-api-resource'),
                'default' => true,
            ],
            [
                'name' => 'visible',
                'type' => 'checkbox',
                'label' => trans('admin.visible'),
                'default' => true,
            ],
            [
                'name' => 'active',
                'type' => 'checkbox',
                'label' => trans('admin.active'),
                'default' => true,
            ],
        ]);
    }

    protected function setupUpdateOperation()
    {
        $this->crud->setValidation(ParametricTableValueUpdateRequest::class);

        $this->crud->addFields([
            [
                'name' => 'id',
                'label' => trans('admin.id'),
                'type' => 'text',
                'attributes' => [
                    'readonly' => 'readonly',
                ],
            ],
            [
                'name' => 'name',
                'label' => trans('admin.key') . ' - ' . trans('admin.name'),
                'type' => 'text',
                'attributes' => [
                    'readonly' => 'readonly',
                ],
            ],
            [
                'name' => 'value',
                'label' => trans('admin.value'),
                'type' => 'text',
            ],
            [
                'name' => 'description',
                'label' => trans('admin.description'),
                'type' => 'textarea',
            ],
            [
                'name' => 'resource',
                'type' => 'checkbox',
                'label' => trans('admin.parametric-table-api-resource'),
                'default' => true,
            ],
            [
                'name' => 'visible',
                'type' => 'checkbox',
                'label' => trans('admin.visible'),
                'default' => true,
            ],
            [
                'name' => 'active',
                'type' => 'checkbox',
                'label' => trans('admin.active'),
                'default' => true,
            ],
        ]);
    }

    protected function setupReorderOperation()
    {
        $this->crud->set('reorder.label', 'name');
        $this->crud->set('reorder.max_level', 1);
    }
}
