<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsSuperadmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = backpack_user();

        if (!$user) {
            abort(403, 'Debes estar autenticado.');
        }

        if (!$user->hasRole('Superadmin')) {
            abort(403, 'Solo usuarios con rol Superadmin pueden acceder a esta sección.');
        }

        return $next($request);
    }
}
