<?php

namespace App\Http\Controllers\Admin;

use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

class LeadCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ShowOperation;

    public function setup()
    {
        if (!isAdminOrSuperadmin()) {
            abort(403);
        }

        $this->crud->setModel(\App\Models\Lead::class);
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/lead');
        $this->crud->setEntityNameStrings('lead', 'leads');
    }

    protected function setupListOperation()
    {
        $this->crud->addColumns([
            [
                'name' => 'email',
                'type' => 'text',
                'label' => trans('admin.email'),
            ],
            [
                'name' => 'form_name',
                'type' => 'text',
                'label' => trans('admin.form_name'),
            ],
            [
                'name' => 'url_origin',
                'type' => 'text',
                'label' => trans('admin.url_origin'),
            ],
            [
                'name' => 'accept_terms',
                'type' => 'text',
                'label' => trans('admin.accept_terms')
            ],
            [
                'name' => 'accept_notifications',
                'type' => 'text',
                'label' => trans('admin.accept_notifications')
            ],
            [
                'name' => 'active',
                'type' => 'text',
                'label' => trans('admin.active')
            ]
        ]);
    }

    protected function setupShowOperation()
    {
        $this->crud->addColumns([
            [
                'name' => 'name',
                'type' => 'text',
                'label' => trans('admin.name'),
            ],
            [
                'name' => 'surname',
                'type' => 'text',
                'label' => trans('admin.surname'),
            ],
            [
                'name' => 'email',
                'type' => 'text',
                'label' => trans('admin.email'),
            ],
            [
                'name' => 'telephone',
                'type' => 'text',
                'label' => trans('admin.telephone'),
            ],
            [
                'name' => 'city',
                'type' => 'text',
                'label' => trans('admin.city'),
            ],
            [
                'name' => 'message',
                'type' => 'text',
                'label' => trans('admin.message'),
            ],
            [
                'name' => 'form_name',
                'type' => 'text',
                'label' => trans('admin.form_name'),
            ],
            [
                'name' => 'url_origin',
                'type' => 'text',
                'label' => trans('admin.url_origin'),
            ],
            [
                'name' => 'accept_terms',
                'type' => 'text',
                'label' => trans('admin.accept_terms')
            ],
            [
                'name' => 'accept_notifications',
                'type' => 'text',
                'label' => trans('admin.accept_notifications')
            ],
            [
                'name' => 'active',
                'type' => 'text',
                'label' => trans('admin.active')
            ]
        ]);
    }

    /**
     * Backpack field for preview email blade
        $this->crud->addField([
            'name' => 'preview_email',
            'type'  => 'custom_html',
            'view' => view($blade, [
                'data' => $emailData
            ])->render(),
            'tab' => 'Preview mail'
        ]);
     */
}
