<?php

namespace App\Http\Middleware;

use App\Support\AdminContext\AdminContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCanAccessAdminContext
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(AdminContext::canAccess($request->user()), 403);

        return $next($request);
    }
}
