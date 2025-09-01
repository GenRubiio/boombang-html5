<?php

namespace App\Http\Controllers\Admin;

use App\Models\MenuItem;
use Illuminate\Support\Str;
use App\Traits\PageTemplates;
// VALIDATION: change the requests to match your own file names if you need form validation
use App\Http\Requests\PageRequest;
use App\Services\External\GeminiAiService;
use Backpack\CRUD\app\Http\Controllers\CrudController;

class PageCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation {
        store as traitStore;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation {
        update as traitUpdate;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use PageTemplates;

    public function setup()
    {
        $this->crud->setModel(config('backpack.pagemanager.page_model_class', 'Backpack\PageManager\app\Models\Page'));
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/page');
        $this->crud->setEntityNameStrings(trans('backpack::pagemanager.page'), trans('backpack::pagemanager.pages'));
        $this->crud->setDefaultPageLength(25);
    }

    protected function setupListOperation()
    {
        if (!backpack_user()->hasRole('Superadmin')) {
            $this->crud->removeButton('create');
        }

        $this->crud->setDefaultPageLength(25);
        $this->crud->setOperationSetting('lineButtonsAsDropdown', false);
        $this->crud->addButtonFromView('line', 'see-page', 'see-page', 'ending');

        $this->crud->addColumns([
            [
                'name' => 'id',
                'label' => trans('admin.id'),
            ],
            [
                'name' => 'name',
                'label' => trans('backpack::pagemanager.name'),
            ],
            [
                'name' => 'template',
                'label' => trans('backpack::pagemanager.template'),
                'type' => 'model_function',
                'function_name' => 'getTemplateName',
            ],
            [
                'name' => 'slug',
                'label' => trans('backpack::pagemanager.slug'),
            ],
            [
                'name' => 'active',
                'type' => 'btnToggle',
                'label' => trans('admin.active')
            ]
        ]);

        if (!isSuperAdmin()) {
            //TODO si eliminamos la page no eliminamos la blade ni las galleries asociadas.
            $this->crud->removeButton('delete');
        }
    }

    // -----------------------------------------------
    // Overwrites of CrudController
    // -----------------------------------------------

    protected function setupCreateOperation()
    {
        $this->addDefaultPageFields(\Request::input('template'));
        $this->useTemplate(\Request::input('template'));

        $this->crud->setValidation(PageRequest::class);
    }

    protected function setupUpdateOperation()
    {
        // if the template in the GET parameter is missing, figure it out from the db
        $template = \Request::input('template') ?? $this->crud->getCurrentEntry()->template;

        $this->addDefaultPageFields($template);
        $this->useTemplate($template);

        $this->crud->setValidation(PageRequest::class);
    }

    // -----------------------------------------------
    // Methods that are particular to the PageManager.
    // -----------------------------------------------

    /**
     * Populate the create/update forms with basic fields, that all pages need.
     *
     * @param string $template The name of the template that should be used in the current form.
     */
    public function addDefaultPageFields($template = false)
    {
        // Solo mantenemos el campo del template, el resto estan en el trait
        $this->crud->addField([
            'name' => 'template',
            'label' => trans('backpack::pagemanager.template'),
            'type' => 'select_page_template',
            'view_namespace' => 'pagemanager::fields',
            'options' => $this->getTemplatesArray(),
            'value' => $template,
            'allows_null' => false,
            'wrapperAttributes' => [
                'class' => 'form-group col-md-6',
            ],
            'tab' => $this->base_tab,
        ]);
        $this->crud->addField([
            'name' => 'ai_translate',
            'label' => 'AI Translate',
            'type' => 'checkbox',
            'tab' => $this->base_tab,
        ]);
    }

    /**
     * Add the fields defined for a specific template.
     *
     * @param  string $template_name The name of the template that should be used in the current form.
     */
    public function useTemplate($template_name = false)
    {
        $templates = $this->getTemplates();

        // set the default template
        if ($template_name == false) {
            $template_name = $templates[0]->name;
        }

        // actually use the template
        if ($template_name) {
            $this->{$template_name}();
        }
    }

    /**
     * Get all defined templates.
     */
    public function getTemplates($template_name = false)
    {
        $templates_trait = new \ReflectionClass('App\Traits\PageTemplates');
        $templates = $templates_trait->getMethods(\ReflectionMethod::IS_PRIVATE);

        if (!count($templates)) {
            abort(503, trans('backpack::pagemanager.template_not_found'));
        }

        return $templates;
    }

    /**
     * Get all defined template as an array.
     *
     * Used to populate the template dropdown in the create/update forms.
     */
    public function getTemplatesArray()
    {
        $templates = $this->getTemplates();

        foreach ($templates as $template) {
            $templates_array[$template->name] = str_replace('_', ' ', Str::title($template->name));
        }

        return $templates_array;
    }

    protected function store()
    {
        $this->crud->getRequest()->merge(['name' => str_replace(' ', '', ucwords($this->crud->getRequest()->name))]);

        $response = $this->traitStore();
        $this->createMenuItems($this->crud->entry, $this->crud->getRequest());
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

    protected function createMenuItems($entry, $request): void
    {
        $createMenuItemHeader = $request->get('create_menu_item_header') ?? false;
        $createMenuItemFooter = $request->get('create_menu_item_footer') ?? false;
        $createMenuItemLegal = $request->get('create_menu_item_legal') ?? false;

        if ($createMenuItemHeader || $createMenuItemFooter || $createMenuItemLegal) {
            $menuItem = new MenuItem();
            $menuItem->name = $entry->title;
            $menuItem->type = 'page_link';
            $menuItem->page_id = $entry->id;
            $menuItem->menu_top = $createMenuItemHeader;
            $menuItem->menu_footer = $createMenuItemFooter;
            $menuItem->menu_legal = $createMenuItemLegal;
            $menuItem->active = 1;
            $menuItem->save();
        }
    }
}
