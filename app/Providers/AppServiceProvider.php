<?php

namespace App\Providers;

use App\Support\PermissionCatalog;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (! $this->app->environment('local')) {
            Vite::useHotFile(storage_path('app/vite.hot'));
        }

        Gate::before(function ($user): ?bool {
            if (! $user) {
                return null;
            }

            return $user->hasRole('administrator', PermissionCatalog::GUARD) ? true : null;
        });
    }
}
