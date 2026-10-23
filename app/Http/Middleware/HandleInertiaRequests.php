<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Admin\SeoController;
use App\Models\FeedbackSubmission;
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
            'auth' => fn () => [
                'user' => ($request->user('admin') ?? $request->user('web')) ? [
                    'id' => ($request->user('admin') ?? $request->user('web'))->id,
                    'name' => ($request->user('admin') ?? $request->user('web'))->name,
                    'email' => ($request->user('admin') ?? $request->user('web'))->email,
                ] : null,
                'portal' => $request->user('portal') ? [
                    'id' => $request->user('portal')->id,
                    'name' => $request->user('portal')->name,
                    'contact' => $request->user('portal')->contact,
                    'type' => $request->user('portal')->isTeacher() ? 'teacher' : 'parent',
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'ticket' => fn () => $request->session()->get('ticket'),
            ],
            'appLogo' => fn () => $this->getLogoUrl(),
            'pendingRegistrationCount' => fn () => $this->getPendingRegistrationCount($request),
            'pendingRegistrationCounts' => fn () => $this->getPendingRegistrationCounts($request),
            'pendingFeedbackCount' => fn () => $this->getPendingFeedbackCount($request),
            'allowedMenus' => fn () => $this->getAllowedMenuIds($request),
            'allowedActions' => fn () => $this->getAllowedActions($request),
            'impersonation' => fn () => $this->getImpersonationState($request),
            'seoSettings' => fn () => $this->getSeoSettings($request),
            'url' => fn () => $request->url(),
            'portalAuth' => fn () => $this->getPortalAuth($request),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function getPortalAuth(Request $request): ?array
    {
        if (! $request->is('portal/*') && ! $request->is('portal')) {
            return null;
        }

        $user = $request->user('portal');

        if (! $user) {
            return null;
        }

        if ($user->isTeacher()) {
            return [
                'name' => $user->name,
                'contact' => $user->contact,
                'email' => $user->email,
                'type' => 'teacher',
                'photo_url' => $user->teacher?->photo_path
                    ? Storage::disk('public')->url($user->teacher->photo_path)
                    : null,
            ];
        }

        $students = $user->students()->where('is_active', true)->get();
        if ($students->isEmpty() && $user->student) {
            $students = collect([$user->student]);
        }

        $selectedId = (int) $request->session()->get('portal.selected_student_id');
        if (! $students->contains('id', $selectedId)) {
            $selectedId = $students->first()?->id;
            if ($selectedId) {
                $request->session()->put('portal.selected_student_id', $selectedId);
            }
        }

        return [
            'name' => $user->name,
            'contact' => $user->contact,
            'email' => $user->email,
            'type' => 'parent',
            'students' => $students->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'photo_url' => $s->photo_path ? Storage::disk('public')->url($s->photo_path) : null,
                'level' => $s->level,
                'school_name' => $s->school_name,
                'program' => $s->program,
            ])->values()->all(),
            'selected_student_id' => $selectedId,
        ];
    }

    private function getLogoUrl(): ?string
    {
        // First try SEO settings (new centralized location)
        $seoContent = PageContent::where('slug', 'seo-settings')->first()?->content;
        $path = Arr::get($seoContent ?? [], 'contact.logo.path');

        if ($path) {
            return Storage::url($path);
        }

        // Fallback to legacy landing logo
        $content = PageContent::where('slug', 'logo')->first()?->content;
        $path = Arr::get($content ?? [], 'media.logo.path');

        return $path ? Storage::url($path) : null;
    }

    private function getPendingRegistrationCount(Request $request): int
    {
        $counts = $this->getPendingRegistrationCounts($request);

        return $counts['total'] ?? 0;
    }

    private function getPendingFeedbackCount(Request $request): int
    {
        if ((! $request->is('admin/*') && ! $request->is('admin')) || ! $request->user('admin')) {
            return 0;
        }

        return FeedbackSubmission::query()
            ->where(function ($query): void {
                $query->whereNull('admin_reply')
                    ->orWhere('admin_reply', '');
            })
            ->count();
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

    private function getSeoSettings(Request $request): ?array
    {
        // Load SEO settings for all pages (colors apply to admin too)
        return SeoController::getPublicSettings();
    }
}
