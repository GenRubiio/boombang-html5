<?php

namespace App\Traits\Pages\Partials;

use App\Models\Page;

trait BaseTemplate
{
    protected function base()
    {
        $this->crud->addField([
            'name' => 'name',
            'label' => trans('admin.page_name'),
            'type' => 'text',
            'wrapperAttributes' => [
                'class' => 'form-group col-md-6',
            ],
            'attributes' => (request()->route()->getAction()['operation'] == 'update' ? ['readonly' => 'readonly'] : []),
            'tab' => $this->base_tab,
        ]);

        $this->crud->addField([
            'name' => 'title',
            'label' => trans('admin.page_title'),
            'type' => 'text',
            // 'disabled' => 'disabled'
            'tab' => $this->base_tab,
        ]);

        if (request()->route()->getAction()['operation'] == 'update' && isset($this->crud->entry)) {
            $pages = Page::whereNull('parent_id')->where('id', '<>', $this->crud->entry->id)->get()->pluck(
                'name',
                'id'
            );
        } else {
            $pages = Page::whereNull('parent_id')->get()->pluck('name', 'id');
        }

        $this->crud->addField([
            'name' => 'parent_id',
            'label' => trans('admin.parent_id_page'),
            'type' => 'select2_from_array',
            'options' => $pages,
            'allows_null' => true,
            'tab' => $this->base_tab,
        ]);

        if (request()->route()->getAction()['operation'] == 'create') {
            $this->crud->addField([
                'name' => 'slug',
                'label' => trans('admin.slug'),
                'target' => 'title', // will turn the title input into a slug
                'type' => 'slug',
                'hint' => trans('admin.slug_hint'),
                'tab' => $this->base_tab,
            ]);
        } else {
            $this->crud->addField([
                'name' => 'slug',
                'label' => trans('admin.slug'),
                'type' => 'text',
                'attributes' => [
                    "required" => "required"
                ],
                'hint' => trans('admin.slug_update_hint'),
                'tab' => $this->base_tab,
            ]);
        }

        $this->crud->addField([
            'name' => 'auth_required',
            'label' => trans('admin.auth_required'),
            'type' => 'radio',
            'options' => [
                1 => trans('backpack::crud.yes'),
                0 => trans('backpack::crud.no')
            ],
            'default' => 0,
            'inline' => true,
            'tab' => $this->base_tab,
        ]);

        if (request()->route()->getAction()['operation'] == 'create') {
            $this->crud->addFields([
                [
                    'name' => 'exists_blade',
                    'label' => trans('admin.create_blade'),
                    'type' => 'radio',
                    'options' => [
                        1 => trans('backpack::crud.yes'),
                        0 => trans('backpack::crud.no')
                    ],
                    'default' => 0,
                    'inline' => true,
                    'tab' => $this->base_tab,
                ],
                [
                    'name' => 'create_menu_item_header',
                    'label' => trans('admin.create_menu_item_header'),
                    'type' => 'radio',
                    'options' => [
                        1 => trans('backpack::crud.yes'),
                        0 => trans('backpack::crud.no')
                    ],
                    'default' => 0,
                    'inline' => true,
                    'wrapperAttributes' => [
                        'class' => 'form-group col-md-3',
                    ],
                    'tab' => $this->base_tab,
                ],
                [
                    'name' => 'create_menu_item_footer',
                    'label' => trans('admin.create_menu_item_footer'),
                    'type' => 'radio',
                    'options' => [
                        1 => trans('backpack::crud.yes'),
                        0 => trans('backpack::crud.no')
                    ],
                    'default' => 0,
                    'inline' => true,
                    'wrapperAttributes' => [
                        'class' => 'form-group col-md-3',
                    ],
                    'tab' => $this->base_tab,
                ],
                [
                    'name' => 'create_menu_item_legal',
                    'label' => trans('admin.create_menu_item_legal'),
                    'type' => 'radio',
                    'options' => [
                        1 => trans('backpack::crud.yes'),
                        0 => trans('backpack::crud.no')
                    ],
                    'default' => 0,
                    'inline' => true,
                    'wrapperAttributes' => [
                        'class' => 'form-group col-md-3',
                    ],
                    'tab' => $this->base_tab,
                ],
            ]);
        }

        if (request()->route()->getAction()['operation'] == 'update') {
            $this->crud->addField([
                'name' => 'active',
                'label' => trans('admin.active'),
                'type' => 'radio',
                'options' => [
                    1 => trans('backpack::crud.yes'),
                    0 => trans('backpack::crud.no')
                ],
                'default' => 0,
                'inline' => true,
                'tab' => $this->base_tab,
            ]);
        }
    }
}
