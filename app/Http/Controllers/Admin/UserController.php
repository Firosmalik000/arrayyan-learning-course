<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResetPortalAccountPasswordRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\PortalAccount;
use App\Models\Role;
use App\Models\User;
use App\Support\InviteUserService;
use App\Support\PermissionCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(private InviteUserService $inviteUserService) {}

    public function index(): Response
    {
        $roles = Role::query()
            ->where('guard_name', PermissionCatalog::GUARD)
            ->orderBy('name')
            ->get();

        $users = User::query()
            ->with('roles')
            ->orderBy('created_at', 'desc')
            ->get();

        $portalAccounts = PortalAccount::query()
            ->with([
                'student:id,name',
                'students:id,name,parent_portal_account_id',
                'teacher:id,name',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        $rolesByName = $roles->keyBy('name');
        $usersPayload = $users->map(function (User $user) use ($rolesByName) {
            $primaryRole = $user->roles->first();
            $primaryRoleLabel = $primaryRole?->label
                ?: $rolesByName->get($primaryRole?->name ?? '')?->label
                ?: $primaryRole?->name;

            $userRoles = $user->roles->map(function (Role $role) use ($rolesByName) {
                $label = $rolesByName->get($role->name)?->label;

                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'label' => $label ?: $role->name,
                ];
            })->values();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $userRoles,
                'primary_role' => $primaryRoleLabel ?: 'Belum ada role',
                'status' => $user->email_verified_at ? 'Aktif' : 'Nonaktif',
                'created_at' => $user->created_at,
            ];
        })->values();

        $totalUsers = $users->count();
        $teacherAccounts = $portalAccounts
            ->where('type', PortalAccount::TYPE_TEACHER)
            ->map(fn (PortalAccount $account): array => $this->portalAccountPayload($account))
            ->values();
        $parentAccounts = $portalAccounts
            ->whereIn('type', [PortalAccount::TYPE_PARENT, PortalAccount::TYPE_STUDENT])
            ->map(fn (PortalAccount $account): array => $this->portalAccountPayload($account))
            ->values();

        $stats = [
            ['label' => 'Total Akun', 'value' => $totalUsers + $portalAccounts->count(), 'tone' => 'violet'],
            ['label' => 'Portal Admin', 'value' => $totalUsers, 'tone' => 'amber'],
            ['label' => 'Portal Guru', 'value' => $teacherAccounts->count(), 'tone' => 'rose'],
            ['label' => 'Portal Orang Tua', 'value' => $parentAccounts->count(), 'tone' => 'emerald'],
        ];

        $rolesPayload = $roles->map(function (Role $role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'label' => $role->label ?: $role->name,
            ];
        })->values();

        $invites = $users
            ->whereNull('email_verified_at')
            ->map(function (User $user) use ($rolesByName) {
                $role = $user->roles->first();
                $label = $rolesByName->get($role?->name ?? '')?->label
                    ?: $role?->name
                    ?: 'Belum ada role';

                return [
                    'email' => $user->email,
                    'role' => $label,
                    'status' => 'Menunggu',
                ];
            })
            ->values()
            ->all();

        $canImpersonate = Auth::guard(PermissionCatalog::GUARD)
            ->user()
            ?->hasRole('administrator', PermissionCatalog::GUARD) ?? false;

        return Inertia::render('Admin/Users', [
            'stats' => $stats,
            'users' => $usersPayload,
            'portalAccounts' => [
                'teachers' => $teacherAccounts,
                'parents' => $parentAccounts,
            ],
            'roles' => $rolesPayload,
            'invites' => $invites,
            'canImpersonate' => $canImpersonate,
        ]);
    }

    /**
     * @return array{
     *     id: int,
     *     name: string,
     *     email: ?string,
     *     contact: string,
     *     portal: string,
     *     linked_names: list<string>,
     *     status: string,
     *     must_change_password: bool,
     *     last_login_at: mixed,
     *     created_at: mixed
     * }
     */
    private function portalAccountPayload(PortalAccount $account): array
    {
        $linkedNames = $account->isTeacher()
            ? collect([$account->teacher?->name])
            : $account->students
                ->pluck('name')
                ->push($account->student?->name);

        return [
            'id' => $account->id,
            'name' => $account->name,
            'email' => $account->email,
            'contact' => $account->contact,
            'portal' => $account->isTeacher() ? 'Portal Guru' : 'Portal Orang Tua',
            'linked_names' => $linkedNames->filter()->unique()->values()->all(),
            'status' => $account->is_active ? 'Aktif' : 'Nonaktif',
            'must_change_password' => $account->must_change_password,
            'last_login_at' => $account->last_login_at,
            'created_at' => $account->created_at,
        ];
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $role = Role::query()
            ->where('guard_name', PermissionCatalog::GUARD)
            ->findOrFail($request->integer('role_id'));

        $temporaryPassword = Str::random(12);
        $user = User::create([
            'name' => $request->string('name')->value(),
            'email' => $request->string('email')->value(),
            'password' => bcrypt($temporaryPassword),
        ]);

        $user->syncRoles([$role]);
        $this->inviteUserService->send(
            $user,
            $role,
            Auth::guard(PermissionCatalog::GUARD)->user(),
            $temporaryPassword
        );

        return back()->with('success', 'Undangan berhasil dibuat dan email dikirim.');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $role = Role::query()
            ->where('guard_name', PermissionCatalog::GUARD)
            ->findOrFail($request->integer('role_id'));

        $user->update([
            'name' => $request->string('name')->value(),
        ]);

        $user->syncRoles([$role]);

        return back()->with('success', 'Data user berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if (Auth::guard(PermissionCatalog::GUARD)->id() === $user->id) {
            return back()->with('success', 'Tidak bisa menghapus akun sendiri.');
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus.');
    }

    public function invite(User $user): RedirectResponse
    {
        $role = $user->roles()
            ->where('guard_name', PermissionCatalog::GUARD)
            ->first();

        if (! $role) {
            return back()->with('success', 'User belum memiliki role.');
        }

        $temporaryPassword = Str::random(12);
        $user->forceFill([
            'password' => bcrypt($temporaryPassword),
            'email_verified_at' => null,
        ])->save();

        $this->inviteUserService->send(
            $user,
            $role,
            Auth::guard(PermissionCatalog::GUARD)->user(),
            $temporaryPassword
        );

        return back()->with('success', 'Undangan berhasil dikirim ulang.');
    }

    public function resetPortalPassword(
        ResetPortalAccountPasswordRequest $request,
        PortalAccount $portalAccount
    ): RedirectResponse {
        $portalAccount->forceFill([
            'password' => Hash::make($request->string('password')->value()),
            'must_change_password' => true,
            'remember_token' => Str::random(60),
        ])->save();

        return back()->with('success', 'Password akun portal berhasil direset. Pengguna wajib mengganti password saat login berikutnya.');
    }

    public function impersonate(User $user): RedirectResponse
    {
        $guard = PermissionCatalog::GUARD;
        $actor = Auth::guard($guard)->user();
        $impersonator = $this->resolveImpersonator();
        $impersonatorId = $impersonator?->id ?? $actor?->id;

        if (
            ! $this->isAdministrator($actor)
            && ! $this->isAdministrator($impersonator)
        ) {
            abort(403);
        }

        if ($actor && $actor->id === $user->id) {
            return back()->with('success', 'Anda sudah menggunakan akun ini.');
        }

        Auth::guard($guard)->login($user);
        if ($impersonatorId) {
            session()->put('impersonator_id', $impersonatorId);
        }

        return redirect()->to($this->resolveImpersonationRedirect($user))
            ->with('success', 'Berhasil masuk sebagai '.$user->name.'.');
    }

    public function stopImpersonate(Request $request): RedirectResponse
    {
        $impersonatorId = $request->session()->pull('impersonator_id');

        if (! $impersonatorId) {
            return back()->with('success', 'Tidak sedang dalam mode impersonate.');
        }

        $impersonator = User::query()->find($impersonatorId);

        if (! $impersonator) {
            return redirect()->route('admin.dashboard')
                ->with('success', 'Akun impersonator tidak ditemukan.');
        }

        Auth::guard(PermissionCatalog::GUARD)->login($impersonator);

        return redirect()->route('admin.dashboard')
            ->with('success', 'Kembali ke akun '.$impersonator->name.'.');
    }

    private function resolveImpersonator(): ?User
    {
        $impersonatorId = session('impersonator_id');
        if (! $impersonatorId) {
            return null;
        }

        return User::query()->find($impersonatorId);
    }

    private function isAdministrator(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasRole('administrator', PermissionCatalog::GUARD);
    }

    private function resolveImpersonationRedirect(User $user): string
    {
        if ($this->isAdministrator($user) || $this->canViewMenu($user, 'dashboard')) {
            return route('admin.dashboard');
        }

        $menuIds = collect(PermissionCatalog::MENUS)->pluck('id')->all();
        $permissions = $user->getAllPermissions()->pluck('name')->all();

        foreach ($menuIds as $menuId) {
            if (! in_array(PermissionCatalog::buildPermissionName($menuId, 'view'), $permissions, true)) {
                continue;
            }

            $routeName = $this->routeForMenu($menuId);
            if ($routeName) {
                return route($routeName);
            }
        }

        return route('admin.dashboard');
    }

    private function canViewMenu(User $user, string $menuId): bool
    {
        return $user->can(PermissionCatalog::buildPermissionName($menuId, 'view'));
    }

    private function routeForMenu(string $menuId): ?string
    {
        return match ($menuId) {
            'dashboard' => 'admin.dashboard',
            'landing' => 'admin.landing',
            'program' => 'admin.programs',
            'bank-soal' => 'admin.banksoal',
            'olimpiade' => 'admin.olympiads',
            'pendaftaran' => 'admin.registrations.students',
            'pelajar' => 'admin.students',
            'pengajar' => 'admin.teachers',
            'akses-menu' => 'admin.access-menu',
            'roles' => 'admin.roles',
            'users' => 'admin.users',
            default => null,
        };
    }
}
