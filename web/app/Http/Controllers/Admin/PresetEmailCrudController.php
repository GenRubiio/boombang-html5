<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FormsEnum;
use App\Http\Requests\PresetEmailRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use App\Http\Controllers\Admin\Traits\SuperadminProtection;
use Backpack\LangFileManager\app\Models\Language;

class PresetEmailCrudController extends CrudController
{
    use SuperadminProtection;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;

    public function setup()
    {
        $this->applySuperadminProtection();


        $this->crud->setModel(\App\Models\PresetEmail::class);
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/preset-email');
        $this->crud->setEntityNameStrings('email predeterminado', 'emails predeterminados');
    }

    protected function setupListOperation()
    {
        $this->crud->addColumns([
            [
                'name' => 'form',
                'type' => 'text',
                'label' => trans('admin.form'),
            ],
            [
                'name' => 'email',
                'type' => 'text',
                'label' => trans('admin.email'),
            ],
            [
                'name' => 'language_communication',
                'type' => 'text',
                'label' => trans('admin.language_communication'),
            ],
            [
                'name' => 'active',
                'type' => 'btnToggle',
                'label' => trans('admin.active')
            ]
        ]);
    }

    protected function setupCreateOperation()
    {
        $this->addFieldsPresetEmails();
    }

    protected function setupUpdateOperation()
    {
        $this->crud->setOperationSetting('showDeleteButton', true);

        $this->addFieldsPresetEmails();
    }

    protected function addFieldsPresetEmails()
    {
        $this->crud->setValidation(PresetEmailRequest::class);

        $allLangs = Language::all()->pluck('name', 'abbr')->toArray();
        $defaultLang = Language::where('default', 1)->first()->get('abbr');

        $this->crud->addFields([
            [
                'name' => 'form',
                'label' => trans('admin.form'),
                'type' => 'select2_from_array',
                'options' => FormsEnum::toAssociativeArray(),
                'allows_null' => false,
                'default' => 'all',
            ],
            [
                'name' => 'email',
                'label' => trans('admin.email'),
                'type' => 'email',
                'placeholder' => 'info@domain.com',
            ],
            [
                'name' => 'language_communication',
                'label' => trans('admin.language_communication'),
                'type' => 'select2_from_array',
                'options' => $allLangs,
                'allows_null' => false,
                'default' => $defaultLang,
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
}
