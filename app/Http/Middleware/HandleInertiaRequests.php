<?php

namespace App\Http\Middleware;

use App\Models\PageContent;
use App\Models\StudentRegistration;
use App\Models\TeacherRegistration;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
            'appLogo' => fn () => $this->getLogoUrl(),
            'pendingRegistrationCount' => fn () => $this->getPendingRegistrationCount($request),
            'pendingRegistrationCounts' => fn () => $this->getPendingRegistrationCounts($request),
            'allowedMenus' => fn () => $this->getAllowedMenuIds($request),
            'allowedActions' => fn () => $this->getAllowedActions($request),
            'impersonation' => fn () => $this->getImpersonationState($request),
        ];
    }

    private function getLogoUrl(): ?string
    {
        $content = PageContent::where('slug', 'logo')->first()?->content;
        $path = Arr::get($content ?? [], 'media.logo.path');

        return $path ? Storage::url($path) : null;
    }

    private function getPendingRegistrationCount(Request $request): int
    {
        $counts = $this->getPendingRegistrationCounts($request);

        return $counts['total'] ?? 0;
    }

    /**
     * @return array{total:int, student:int, teacher:int}
     */
    private function getPendingRegistrationCounts(Request $request): array
    {
        if (! $request->is('admin/*') && ! $request->is('admin')) {
            return [
                'total' => 0,
                'student' => 0,
                'teacher' => 0,
            ];
        }

        $studentPending = StudentRegistration::query()->where('status', 'pending')->count();
        $teacherPending = TeacherRegistration::query()->where('status', 'pending')->count();

        return [
            'total' => $studentPending + $teacherPending,
            'student' => $studentPending,
            'teacher' => $teacherPending,
        ];
    }

    private function getImpersonationState(Request $request): array
    {
        if (! $request->is('admin/*') && ! $request->is('admin')) {
            return ['active' => false];
        }

        $impersonatorId = $request->session()->get('impersonator_id');
        if (! $impersonatorId) {
            return ['active' => false];
        }

        $impersonator = User::query()->select('id', 'name', 'email')->find($impersonatorId);

        return [
            'active' => true,
            'impersonator' => $impersonator
                ? [
                    'id' => $impersonator->id,
                    'name' => $impersonator->name,
                    'email' => $impersonator->email,
                ]
                : null,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function getAllowedMenuIds(Request $request): array
    {
        if (! $request->is('admin/*') && ! $request->is('admin')) {
            return [];
        }

        $user = $request->user();
        if (! $user) {
            return [];
        }

        $menuIds = collect(PermissionCatalog::MENUS)->pluck('id')->all();
        if ($user->hasRole('administrator', PermissionCatalog::GUARD)) {
            return $menuIds;
        }

        $permissions = $user->getAllPermissions()->pluck('name')->all();

        return collect($menuIds)
            ->filter(function (string $menuId) use ($permissions) {
                return in_array(PermissionCatalog::buildPermissionName($menuId, 'view'), $permissions, true);
            })
            ->values()
            ->all();
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function getAllowedActions(Request $request): array
    {
        if (! $request->is('admin/*') && ! $request->is('admin')) {
            return [];
        }

        $user = $request->user();
        if (! $user) {
            return [];
        }

        $menuIds = collect(PermissionCatalog::MENUS)->pluck('id')->all();
        $actions = PermissionCatalog::ACTIONS;

        if ($user->hasRole('administrator', PermissionCatalog::GUARD)) {
            return collect($menuIds)
                ->mapWithKeys(fn (string $menuId) => [$menuId => $actions])
                ->all();
        }

        $permissions = $user->getAllPermissions()->pluck('name')->all();
        $allowed = [];

        foreach ($permissions as $permissionName) {
            [$menuId, $action] = array_pad(explode('.', $permissionName, 2), 2, null);
            if (! $menuId || ! $action) {
                continue;
            }

            if (! in_array($menuId, $menuIds, true) || ! in_array($action, $actions, true)) {
                continue;
            }

            $allowed[$menuId] ??= [];
            $allowed[$menuId][] = $action;
        }

        foreach ($allowed as $menuId => $menuActions) {
            $allowed[$menuId] = array_values(array_unique($menuActions));
        }

        return $allowed;
    }
}
