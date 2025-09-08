<?php

namespace App\Http\Controllers\Admin\Traits;

use Backpack\CRUD\app\Library\CrudPanel\CrudPanel;

trait SuperadminProtection
{
    /**
     * @var CrudPanel
     */
    public $crud;

    public function applySuperadminProtection()
    {
        if (!backpack_user()) {
            abort(401, 'No has iniciado sesión.');
        }

        if (!backpack_user()->hasRole('Superadmin')) {
            $this->crud->denyAccess(['list', 'create', 'update', 'delete']);
            abort(403, 'No tienes permisos para acceder a esta sección.');
        }
    }
}
