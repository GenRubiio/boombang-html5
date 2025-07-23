<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckActiveUser
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user && $user->active) {
            $user->tokens->each(function ($token) {
                $token->revoke();
            });
            Auth::guard('web')->logout();
            return response()->json(['error' => 'Account is not active'], 403);
        }
        return $next($request);
    }
}
