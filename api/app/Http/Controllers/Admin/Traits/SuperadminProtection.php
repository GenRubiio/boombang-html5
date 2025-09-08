<?php

namespace App\Http\Controllers\Admin\Traits;

trait SuperadminProtection
{
    /**
     * Apply Superadmin role protection to CRUD operations
     */
    protected function applySuperadminProtection()
    {
        $user = backpack_user();

        if (!$user) {
            abort(403, 'Debes estar autenticado.');
        }

        // Only Superadmin role has access to CRUD operations
        if (!$user->hasRole('Superadmin')) {
            abort(403, 'Solo usuarios con rol Superadmin pueden acceder a esta sección.');
        }
    }
}
