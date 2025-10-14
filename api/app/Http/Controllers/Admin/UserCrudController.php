<?php

namespace App\Http\Controllers\Admin;

use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\PermissionManager\app\Http\Requests\UserStoreCrudRequest as StoreRequest;
use Backpack\PermissionManager\app\Http\Requests\UserUpdateCrudRequest as UpdateRequest;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Admin\Traits\SuperadminProtection;

class UserCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation {
        store as traitStore;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation {
        update as traitUpdate;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use SuperadminProtection;

    public function setup()
    {
        $this->applySuperadminProtection();

        $this->crud->setModel(config('backpack.permissionmanager.models.user'));
        $this->crud->setEntityNameStrings(trans('backpack::permissionmanager.user'), trans('backpack::permissionmanager.users'));
        $this->crud->setRoute(backpack_url('user'));
    }

    public function setupListOperation()
    {
        $this->crud->addButtonFromView('line', 'user_catalog_items', 'user_catalog_items', 'beginning');

        $this->crud->addColumns([
            [
                'name'  => 'id',
                'label' => 'ID',
                'type'  => 'number',
            ],
            [
                'name'  => 'username',
                'label' => 'Username',
                'type'  => 'text',
            ],
            [
                'name'  => 'email',
                'label' => trans('backpack::permissionmanager.email'),
                'type'  => 'email',
            ],
            [ // n-n relationship (with pivot table)
                'label'     => trans('backpack::permissionmanager.roles'), // Table column heading
                'type'      => 'select_multiple',
                'name'      => 'roles', // the method that defines the relationship in your Model
                'entity'    => 'roles', // the method that defines the relationship in your Model
                'attribute' => 'name', // foreign key attribute that is shown to user
                'model'     => config('permission.models.role'), // foreign key model
            ],
            [ // n-n relationship (with pivot table)
                'label'     => trans('backpack::permissionmanager.extra_permissions'), // Table column heading
                'type'      => 'select_multiple',
                'name'      => 'permissions', // the method that defines the relationship in your Model
                'entity'    => 'permissions', // the method that defines the relationship in your Model
                'attribute' => 'name', // foreign key attribute that is shown to user
                'model'     => config('permission.models.permission'), // foreign key model
            ],
        ]);

        if (backpack_pro()) {
            // Role Filter
            $this->crud->addFilter(
                [
                    'name'  => 'role',
                    'type'  => 'dropdown',
                    'label' => trans('backpack::permissionmanager.role'),
                ],
                config('permission.models.role')::all()->pluck('name', 'id')->toArray(),
                function ($value) { // if the filter is active
                    $this->crud->addClause('whereHas', 'roles', function ($query) use ($value) {
                        $query->where('role_id', '=', $value);
                    });
                }
            );

            // Extra Permission Filter
            $this->crud->addFilter(
                [
                    'name'  => 'permissions',
                    'type'  => 'select2',
                    'label' => trans('backpack::permissionmanager.extra_permissions'),
                ],
                config('permission.models.permission')::all()->pluck('name', 'id')->toArray(),
                function ($value) { // if the filter is active
                    $this->crud->addClause('whereHas', 'permissions', function ($query) use ($value) {
                        $query->where('permission_id', '=', $value);
                    });
                }
            );
        }
    }

    public function setupCreateOperation()
    {
        $this->addUserFields();
        $this->crud->setValidation(StoreRequest::class);
    }

    public function setupUpdateOperation()
    {
        $this->addUserFields();
        $this->crud->setValidation(UpdateRequest::class);
    }

    public function setupShowOperation()
    {
        // automatically add the columns
        $this->crud->column('name');
        $this->crud->column('email');
        $this->crud->column([
            // two interconnected entities
            'label'             => trans('backpack::permissionmanager.user_role_permission'),
            'field_unique_name' => 'user_role_permission',
            'type'              => 'checklist_dependency',
            'name'              => 'roles_permissions',
            'subfields'         => [
                'primary' => [
                    'label'            => trans('backpack::permissionmanager.role'),
                    'name'             => 'roles', // the method that defines the relationship in your Model
                    'entity'           => 'roles', // the method that defines the relationship in your Model
                    'entity_secondary' => 'permissions', // the method that defines the relationship in your Model
                    'attribute'        => 'name', // foreign key attribute that is shown to user
                    'model'            => config('permission.models.role'), // foreign key model
                ],
                'secondary' => [
                    'label'            => mb_ucfirst(trans('backpack::permissionmanager.permission_singular')),
                    'name'             => 'permissions', // the method that defines the relationship in your Model
                    'entity'           => 'permissions', // the method that defines the relationship in your Model
                    'entity_primary'   => 'roles', // the method that defines the relationship in your Model
                    'attribute'        => 'name', // foreign key attribute that is shown to user
                    'model'            => config('permission.models.permission'), // foreign key model,
                ],
            ],
        ]);
        $this->crud->column('created_at');
        $this->crud->column('updated_at');
    }

    /**
     * Store a newly created resource in the database.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store()
    {
        $this->crud->setRequest($this->crud->validateRequest());
        $this->crud->setRequest($this->handlePasswordInput($this->crud->getRequest()));
        $this->crud->unsetValidation(); // validation has already been run

        return $this->traitStore();
    }

    /**
     * Update the specified resource in the database.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update()
    {
        $this->crud->setRequest($this->crud->validateRequest());
        $this->crud->setRequest($this->handlePasswordInput($this->crud->getRequest()));
        $this->crud->unsetValidation(); // validation has already been run

        return $this->traitUpdate();
    }

    /**
     * Handle password input fields.
     */
    protected function handlePasswordInput($request)
    {
        // Remove fields not present on the user.
        $request->request->remove('password_confirmation');
        $request->request->remove('roles_show');
        $request->request->remove('permissions_show');

        // Encrypt password if specified.
        if ($request->input('password')) {
            $request->request->set('password', Hash::make($request->input('password')));
        } else {
            $request->request->remove('password');
        }

        return $request;
    }

    protected function addUserFields()
    {
        $this->crud->addFields([
            [
                'name'  => 'name',
                'label' => trans('backpack::permissionmanager.name'),
                'type'  => 'text',
                'tab'   => 'User Details',
            ],
            [
                'name'  => 'email',
                'label' => trans('backpack::permissionmanager.email'),
                'type'  => 'email',
                'tab'   => 'User Details',
            ],
            [
                'name'  => 'password',
                'label' => trans('backpack::permissionmanager.password'),
                'type'  => 'password',
                'tab'   => 'User Details',
            ],
            [
                'name'  => 'password_confirmation',
                'label' => trans('backpack::permissionmanager.password_confirmation'),
                'type'  => 'password',
                'tab'   => 'User Details',
            ],
            [
                // two interconnected entities
                'label'             => trans('backpack::permissionmanager.user_role_permission'),
                'field_unique_name' => 'user_role_permission',
                'type'              => 'checklist_dependency',
                'name'              => 'roles,permissions',
                'subfields'         => [
                    'primary' => [
                        'label'            => trans('backpack::permissionmanager.roles'),
                        'name'             => 'roles', // the method that defines the relationship in your Model
                        'entity'           => 'roles', // the method that defines the relationship in your Model
                        'entity_secondary' => 'permissions', // the method that defines the relationship in your Model
                        'attribute'        => 'name', // foreign key attribute that is shown to user
                        'model'            => config('permission.models.role'), // foreign key model
                        'pivot'            => true, // on create&update, do you need to add/delete pivot table entries?]
                        'number_columns'   => 3, //can be 1,2,3,4,6
                    ],
                    'secondary' => [
                        'label'          => mb_ucfirst(trans('backpack::permissionmanager.permission_plural')),
                        'name'           => 'permissions', // the method that defines the relationship in your Model
                        'entity'         => 'permissions', // the method that defines the relationship in your Model
                        'entity_primary' => 'roles', // the method that defines the relationship in your Model
                        'attribute'      => 'name', // foreign key attribute that is shown to user
                        'model'          => config('permission.models.permission'), // foreign key model
                        'pivot'          => true, // on create&update, do you need to add/delete pivot table entries?]
                        'number_columns' => 3, //can be 1,2,3,4,6
                    ],
                ],
                'tab' => 'User Details',
            ],
            [
                'name'  => 'username',
                'label' => 'Username',
                'type'  => 'text',
                'tab'   => 'Game Stats',
            ],
            [
                'name'  => 'description',
                'label' => 'Description',
                'type'  => 'textarea',
                'tab'   => 'Game Stats',
            ],
            [
                'name'  => 'gold_coins',
                'label' => 'Gold Coins',
                'type'  => 'number',
                'tab'   => 'Game Stats',
                'wrapper' => ['class' => 'form-group col-md-6'],
            ],
            [
                'name'  => 'silver_coins',
                'label' => 'Silver Coins',
                'type'  => 'number',
                'tab'   => 'Game Stats',
                'wrapper' => ['class' => 'form-group col-md-6'],
            ],
            [
                'name'  => 'rings_won',
                'label' => 'Rings Won',
                'type'  => 'number',
                'tab'   => 'Game Stats',
            ],
            [
                'name'  => 'coconuts_caught',
                'label' => 'Coconuts Caught',
                'type'  => 'number',
                'tab'   => 'Game Stats',
            ],
            [
                'name'  => 'uppercuts_sent',
                'label' => 'Uppercuts Sent',
                'type'  => 'number',
                'tab'   => 'Game Stats',
                'wrapper' => ['class' => 'form-group col-md-6'],
            ],
            [
                'name'  => 'uppercuts_received',
                'label' => 'Uppercuts Received',
                'type'  => 'number',
                'tab'   => 'Game Stats',
                'wrapper' => ['class' => 'form-group col-md-6'],
            ],
            [
                'name'  => 'coconuts_sent',
                'label' => 'Coconuts Sent',
                'type'  => 'number',
                'tab'   => 'Game Stats',
                'wrapper' => ['class' => 'form-group col-md-6'],
            ],
            [
                'name'  => 'coconuts_received',
                'label' => 'Coconuts Received',
                'type'  => 'number',
                'tab'   => 'Game Stats',
                'wrapper' => ['class' => 'form-group col-md-6'],
            ],
            [
                'name'  => 'phaser_rendering_type',
                'label' => 'Phaser Rendering Type',
                'type'  => 'text',
                'tab'   => 'Game Settings',
            ],
            [
                'name'  => 'phaser_antialias',
                'label' => 'Phaser Antialias',
                'type'  => 'boolean',
                'tab'   => 'Game Settings',
                'wrapper' => ['class' => 'form-group col-md-6'],
            ],
            [
                'name'  => 'phaser_antialias_gl',
                'label' => 'Phaser Antialias GL',
                'type'  => 'boolean',
                'tab'   => 'Game Settings',
                'wrapper' => ['class' => 'form-group col-md-6'],
            ],
            [
                'name'  => 'phaser_pixel_art',
                'label' => 'Phaser Pixel Art',
                'type'  => 'boolean',
                'tab'   => 'Game Settings',
                'wrapper' => ['class' => 'form-group col-md-6'],
            ],
            [
                'name'  => 'phaser_round_pixels',
                'label' => 'Phaser Round Pixels',
                'type'  => 'boolean',
                'tab'   => 'Game Settings',
                'wrapper' => ['class' => 'form-group col-md-6'],
            ],
            [
                'name'  => 'phaser_power_preference',
                'label' => 'Phaser Power Preference',
                'type'  => 'text',
                'tab'   => 'Game Settings',
            ],
            [
                'name'  => 'phaser_scene_sound_volume',
                'label' => 'Phaser Scene Sound Volume',
                'type'  => 'number',
                'tab'   => 'Game Settings',
            ],
            [
                'name'  => 'phaser_scene_sound_muted',
                'label' => 'Phaser Scene Sound Muted',
                'type'  => 'boolean',
                'tab'   => 'Game Settings',
            ],
            [
                'name' => 'is_bot',
                'label' => 'Is Bot',
                'type' => 'checkbox',
                'tab' => 'Bot Settings',
            ],
            [
                'name' => 'bot_system_prompt',
                'label' => 'Bot System Prompt',
                'type' => 'textarea',
                'tab' => 'Bot Settings',
            ],
        ]);
    }
}
