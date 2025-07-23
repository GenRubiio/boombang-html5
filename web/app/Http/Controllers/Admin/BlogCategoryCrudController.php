<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\BlogCategoryRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;

class BlogCategoryCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation {
        store as traitStore;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ReorderOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ShowOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\InlineCreateOperation;

    public function setup()
    {
        $this->crud->setModel("App\Models\BlogCategory");
        $this->crud->setRoute(config('backpack.base.route_prefix', 'admin') . '/blog-category');
        $this->crud->setEntityNameStrings('categoría blog', 'categorías blog');
    }

    protected function setupListOperation()
    {
        $this->crud->addColumn([
            'name' => 'name',
            'label' => trans('admin.menu_label'),
        ]);
        $this->crud->addColumn([
            'label' => trans('admin.menu_parent'),
            'type' => 'select',
            'name' => 'parent_id',
            'entity' => 'parent',
            'attribute' => 'name',
            'model' => "\App\Models\BlogCategory",
        ]);
        $this->crud->addColumn([
            'name' => 'active',
            'type' => 'btnToggle',
            'label' => trans('admin.active')
        ]);

        $this->crud->addColumn([  // select_multiple: n-n relationship (with pivot table)
            'label' => trans('admin.articles'), // Table column heading
            'type' => 'relationship_count',
            'name' => 'blogArticles', // the method that defines the relationship in your Model
            'wrapper' => [
                'href' => function ($crud, $column, $entry, $related_key) {
                    return backpack_url('blog-article?categoryId=' . $entry->getKey());
                },
            ],
        ]);
    }

    protected function setupShowOperation()
    {
        $this->setupListOperation();
        $this->crud->removeColumn('active');
        $this->crud->addColumn([
            'name' => 'active',
            'type' => 'boolean',
            'label' => trans('admin.active')
        ]);
    }

    protected function setupCreateOperation()
    {
        $this->crud->setValidation(BlogCategoryRequest::class);

        $this->crud->addFields([
            [
                'name' => 'name',
                'type' => 'text',
                'label' => trans('admin.name'),
            ],
            [
                'name' => 'slug',
                'type' => 'slug',
                'target'  => 'name',
                'label' => trans('admin.slug'),
                'hint' => trans('admin.slug_hint'),
            ],
            [
                'label' => trans('admin.parent_id'),
                'type' => 'select',
                'name' => 'parent_id',
                'entity' => 'parent',
                'attribute' => 'name',
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
            ]
        ]);
    }

    protected function setupUpdateOperation()
    {
        $this->crud->setValidation(BlogCategoryRequest::class);
        $this->crud->setOperationSetting('showDeleteButton', true);

        $this->crud->addFields([
            [
                'name' => 'name',
                'type' => 'text',
                'label' => trans('admin.name'),
            ],
            [
                'name' => 'slug',
                'type' => 'text',
                'label' => trans('admin.slug'),
                'attributes' => [
                    "required" => "required"
                ],
            ],
            [
                'label' => trans('admin.parent_id'),
                'type' => 'select',
                'name' => 'parent_id',
                'entity' => 'parent',
                'attribute' => 'name',
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
            ]
        ]);
    }

    protected function setupReorderOperation()
    {
        $this->crud->set('reorder.label', 'name');
        $this->crud->set('reorder.max_level', 2);
    }

    protected function store()
    {
        $response = $this->traitStore();
        storeReplicateOtherLocales($this->crud);
        return $response;
    }
}
