<?php

use App\Http\Middleware\EnsurePortalPasswordChanged;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
            'portal.password' => EnsurePortalPasswordChanged::class,
        ]);

        $middleware->redirectGuestsTo(function (Request $request): string {
            if ($request->is('portal') || $request->is('portal/*')) {
                return route('login');
            }

            return route('login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            $status = $response->getStatusCode();

            if ($status === 419) {
                if ($request->header('X-Inertia')) {
                    return back()->with([
                        'message' => 'Sesi telah kedaluwarsa, silakan coba lagi.',
                    ]);
                }

                return Inertia\Inertia::render('Error', ['status' => 419])
                    ->toResponse($request)
                    ->setStatusCode(419);
            }

            $isHtmlRequest = $request->header('X-Inertia') || (! $request->expectsJson() && ! $request->is('api/*'));

            if ($isHtmlRequest && in_array($status, [401, 403, 404, 429, 500, 503], true)) {
                if ($status === 500 && config('app.debug') && app()->environment('local')) {
                    return $response;
                }

                return Inertia\Inertia::render('Error', [
                    'status' => $status,
                    'message' => $exception instanceof HttpExceptionInterface
                        ? ($exception->getMessage() ?: null)
                        : null,
                ])->toResponse($request)->setStatusCode($status);
            }

            return $response;
        });
    })->create();
