<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Redirect;
use Symfony\Component\HttpFoundation\Response;

class RedirectToWwwMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (substr($request->header('host'), 0, 4) != 'www.' && App::environment() === 'production' && env('FORCE_WWW', false)) {
            $request->headers->set('host', 'www.' . $request->header('host'));

            return Redirect::to($request->path());
        }

        return $next($request);
    }
}
