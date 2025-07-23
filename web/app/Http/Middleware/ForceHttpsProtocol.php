<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\App;

class ForceHttpsProtocol
{
    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request
     * @param \Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (!$request->secure() && App::environment() === 'production' && env('FORCE_HTTPS', false)) {
            return redirect()->secure($request->getRequestUri());
        }

        return $next($request);
    }
}
