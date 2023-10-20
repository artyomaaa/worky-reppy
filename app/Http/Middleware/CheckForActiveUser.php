<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Foundation\Http\Middleware\CheckForMaintenanceMode as Middleware;
use \Illuminate\Http\Request;

class CheckForActiveUser extends Middleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Request  $request
     * @param  Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (auth()->user()->status !== 1) {
            return response()->json(['status' => false, 'message' => __('Inactive user'), 'forbidden' => true]);
        }

        return $next($request);
    }
}
