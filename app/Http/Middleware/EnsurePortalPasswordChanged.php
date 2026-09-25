<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsurePortalPasswordChanged
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('portal')->user();

        if ($user && $user->must_change_password && ! $request->routeIs('portal.password*')) {
            return redirect()->route('portal.password');
        }

        return $next($request);
    }
}
