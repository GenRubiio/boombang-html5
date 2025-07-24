<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RequestExecutionTimeMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true); // Record start time

        $response = $next($request);

        $duration = microtime(true) - $start; // Calculate execution time
        Log::channel('request_execution_time')->info("Request to \"/{$request->path()}\" took {$duration} seconds");

        return $response;
    }
}
