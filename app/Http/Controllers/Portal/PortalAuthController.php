<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class PortalAuthController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        return app(AuthenticatedSessionController::class)->create($request);
    }

    public function store(Request $request): RedirectResponse
    {
        return app(AuthenticatedSessionController::class)->store($request);
    }

    public function destroy(Request $request): RedirectResponse
    {
        return app(AuthenticatedSessionController::class)->destroy($request);
    }
}
