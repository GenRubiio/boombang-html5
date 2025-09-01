<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\MenuItemRequest;
use App\Services\External\GeminiAiService;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use App\Http\Controllers\Admin\Operations\ReorderMenuTopOperation;
use App\Http\Controllers\Admin\Operations\ReorderMenuLegalOperation;
use App\Http\Controllers\Admin\Operations\ReorderMenuFooterOperation;

class MenuItemCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation {
        store as traitStore;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation {
        update as traitUpdate;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ReorderOperation;
    use ReorderMenuTopOperation;
    use ReorderMenuFooterOperation;
    use ReorderMenuLegalOperation;

    public function setup()
    {
        $this->crud->setModel("App\Models\MenuItem");
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/menu-item');
        $this->crud->setEntityNameStrings('menu item', 'menu items');

        $this->crud->enableReorder('name', 2);

        $this->crud->operation('list', function () {
            $this->crud->addButton('top', 'reorder-menu', 'view', 'end');
            $this->crud->removeButton('reorder');
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
                'model' => "\App\Models\MenuItem",
            ]);
            $this->crud->addColumn([
                'name' => 'menu_top',
                'type' => 'btnToggle',
                'label' => trans('admin.menu_visible_top')
            ]);
            $this->crud->addColumn([
                'name' => 'menu_footer',
                'type' => 'btnToggle',
                'label' => trans('admin.menu_visible_footer')
            ]);
            $this->crud->addColumn([
                'name' => 'menu_legal',
                'type' => 'btnToggle',
                'label' => trans('admin.menu_visible_legal')
            ]);
            $this->crud->addColumn([
                'name' => 'active',
                'type' => 'btnToggle',
                'label' => trans('admin.active')
            ]);
        });
    }

    protected function setupCreateOperation()
    {
        $this->addFieldsMenuItems();
    }

    protected function setupUpdateOperation()
    {
        $this->addFieldsMenuItems();
    }

    protected function addFieldsMenuItems()
    {
        $this->crud->setValidation(MenuItemRequest::class);

        $this->crud->addFields([
            [
                'name' => 'name',
                'type' => 'text',
                'label' => trans('admin.menu_label'),
            ],
            [
                'name' => 'type,link,page_id',
                'label' => trans('admin.menu_type_link'),
                'type' => 'page_or_link',
                'page_model' => '\App\Models\Page',
            ],
            [
                'name' => 'image',
                'label' => trans('admin.image'),
                'type' => 'image',
            ],
            [
                'name' => 'menu_top',
                'label' => trans('admin.menu_visible_top'),
                'type' => 'radio',
                'options' => [
                    1 => trans('backpack::crud.yes'),
                    0 => trans('backpack::crud.no')
                ],
                'default' => 0,
                'inline' => true,
            ],
            [
                'name' => 'menu_footer',
                'label' => trans('admin.menu_visible_footer'),
                'type' => 'radio',
                'options' => [
                    1 => trans('backpack::crud.yes'),
                    0 => trans('backpack::crud.no')
                ],
                'default' => 0,
                'inline' => true,
            ],
            [
                'name' => 'menu_legal',
                'label' => trans('admin.menu_visible_legal'),
                'type' => 'radio',
                'options' => [
                    1 => trans('backpack::crud.yes'),
                    0 => trans('backpack::crud.no')
                ],
                'default' => 0,
                'inline' => true,
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
            [
                'name' => 'ai_translate',
                'label' => 'AI Translate',
                'type' => 'checkbox',
            ],
        ]);
    }

    protected function store()
    {
        $response = $this->traitStore();
        storeReplicateOtherLocales($this->crud);
        if ($this->crud->getRequest()->get('ai_translate')) {
            app(GeminiAiService::class)->translate($this->crud->entry);
        }
        return $response;
    }

    protected function update()
    {
        $response = $this->traitUpdate();
        if ($this->crud->getRequest()->get('ai_translate')) {
            app(GeminiAiService::class)->translate($this->crud->entry);
        }
        return $response;
    }

    protected function setupReorderOperation()
    {
        $this->crud->set('reorder.label', 'name');
        $this->crud->set('reorder.max_level', 1);
    }
}
