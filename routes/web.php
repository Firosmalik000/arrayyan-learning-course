<?php

use App\Http\Controllers\Admin\AccessMenuController;
use App\Http\Controllers\Admin\BankSoalController;
use App\Http\Controllers\Admin\MasterDataController;
use App\Http\Controllers\Admin\OlympiadController;
use App\Http\Controllers\Admin\ProgramController;
use App\Http\Controllers\Admin\RegistrationController as AdminRegistrationController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SeoController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\LandingContentController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\SitemapController;
use App\Models\BankSoal;
use App\Models\Olympiad;
use App\Models\Program;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

Route::get('/', [LandingContentController::class, 'show'])->name('home');
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/olimpiade', function () {
    return Inertia::render('Public/Olympiad', [
        'olympiads' => Olympiad::query()
            ->where('is_active', true)
            ->latest()
            ->get()
            ->map(function (Olympiad $olympiad) {
                return [
                    'id' => $olympiad->id,
                    'slug' => $olympiad->slug,
                    'name' => $olympiad->name,
                    'level' => $olympiad->level,
                    'schedule' => $olympiad->schedule,
                    'selection_system' => $olympiad->selection_system,
                    'category' => $olympiad->category,
                    'fee' => $olympiad->fee,
                    'notes' => $olympiad->notes,
                    'image_url' => $olympiad->image_path ? Storage::url($olympiad->image_path) : null,
                ];
            }),
    ]);
})->name('olympiad');
Route::get('/olimpiade/{slug}', function ($slug) {
    $olympiad = Olympiad::query()
        ->where('slug', $slug)
        ->where('is_active', true)
        ->first();

    return Inertia::render('Public/Olympiad/Detail', [
        'slug' => $slug,
        'olympiad' => $olympiad ? [
            'id' => $olympiad->id,
            'slug' => $olympiad->slug,
            'name' => $olympiad->name,
            'level' => $olympiad->level,
            'schedule' => $olympiad->schedule,
            'selection_system' => $olympiad->selection_system,
            'category' => $olympiad->category,
            'fee' => $olympiad->fee,
            'notes' => $olympiad->notes,
            'image_url' => $olympiad->image_path ? Storage::url($olympiad->image_path) : null,
        ] : null,
    ]);
})->name('olympiad.detail');
Route::get('/pendaftaran', fn () => Inertia::render('Public/Register', [
    'programs' => Program::query()
        ->where('is_active', true)
        ->orderBy('name')
        ->get(['id', 'name', 'level']),
]))->name('register');
Route::get('/program', [LandingContentController::class, 'programs'])->name('programs');
Route::get('/program/{program}', [LandingContentController::class, 'programDetail'])
    ->name('programs.detail');
Route::get('/bank-soal', [LandingContentController::class, 'bankSoal'])->name('banksoal');
Route::get('/bank-soal/{slug}', function ($slug) {
    $bankSoal = BankSoal::query()
        ->where('slug', $slug)
        ->where('is_active', true)
        ->first();

    return Inertia::render('Public/BankSoal/Detail', [
        'slug' => $slug,
        'bankSoal' => $bankSoal ? [
            'id' => $bankSoal->id,
            'slug' => $bankSoal->slug,
            'name' => $bankSoal->name,
            'category' => $bankSoal->category,
            'level' => $bankSoal->level,
            'format' => $bankSoal->format,
            'questions' => $bankSoal->questions,
            'description' => $bankSoal->description,
            'links' => $bankSoal->links ?? [],
            'tone' => $bankSoal->tone,
        ] : null,
    ]);
})->name('banksoal.detail');

Route::get('/login', [AuthenticatedSessionController::class, 'create'])
    ->middleware('guest')
    ->name('login');
Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest')
    ->name('login.store');
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::post('/pendaftaran/murid', [RegistrationController::class, 'storeStudent'])
    ->name('registrations.student');
Route::post('/pendaftaran/pengajar', [RegistrationController::class, 'storeTeacher'])
    ->name('registrations.teacher');

Route::get('/admin/login', [AuthenticatedSessionController::class, 'create'])
    ->middleware('guest')
    ->name('admin.login');

Route::prefix('admin')->name('admin.')->middleware('auth:admin')->group(function () {
    Route::get('/', [MasterDataController::class, 'dashboard'])
        ->middleware('role_or_permission:administrator|dashboard.view,admin')
        ->name('dashboard');
    Route::get('/landing', [LandingContentController::class, 'edit'])
        ->middleware('role_or_permission:administrator|landing.view,admin')
        ->name('landing');
    Route::put('/landing', [LandingContentController::class, 'update'])
        ->middleware('role_or_permission:administrator|landing.edit,admin')
        ->name('landing.update');
    Route::get('/program', [MasterDataController::class, 'programs'])
        ->middleware('role_or_permission:administrator|program.view,admin')
        ->name('programs');
    Route::post('/program', [ProgramController::class, 'store'])
        ->middleware('role_or_permission:administrator|program.create,admin')
        ->name('programs.store');
    Route::put('/program/{program}', [ProgramController::class, 'update'])
        ->middleware('role_or_permission:administrator|program.edit,admin')
        ->name('programs.update');
    Route::delete('/program/{program}', [ProgramController::class, 'destroy'])
        ->middleware('role_or_permission:administrator|program.delete,admin')
        ->name('programs.destroy');
    Route::get('/bank-soal', [MasterDataController::class, 'bankSoal'])
        ->middleware('role_or_permission:administrator|bank-soal.view,admin')
        ->name('banksoal');
    Route::post('/bank-soal', [BankSoalController::class, 'store'])
        ->middleware('role_or_permission:administrator|bank-soal.create,admin')
        ->name('banksoal.store');
    Route::put('/bank-soal/{bankSoal}', [BankSoalController::class, 'update'])
        ->middleware('role_or_permission:administrator|bank-soal.edit,admin')
        ->name('banksoal.update');
    Route::delete('/bank-soal/{bankSoal}', [BankSoalController::class, 'destroy'])
        ->middleware('role_or_permission:administrator|bank-soal.delete,admin')
        ->name('banksoal.destroy');
    Route::get('/olimpiade', [MasterDataController::class, 'olympiads'])
        ->middleware('role_or_permission:administrator|olimpiade.view,admin')
        ->name('olympiads');
    Route::post('/olimpiade', [OlympiadController::class, 'store'])
        ->middleware('role_or_permission:administrator|olimpiade.create,admin')
        ->name('olympiads.store');
    Route::put('/olimpiade/{olympiad}', [OlympiadController::class, 'update'])
        ->middleware('role_or_permission:administrator|olimpiade.edit,admin')
        ->name('olympiads.update');
    Route::delete('/olimpiade/{olympiad}', [OlympiadController::class, 'destroy'])
        ->middleware('role_or_permission:administrator|olimpiade.delete,admin')
        ->name('olympiads.destroy');
    Route::get('/pendaftaran', [MasterDataController::class, 'registrations'])
        ->middleware('role_or_permission:administrator|pendaftaran.view,admin')
        ->name('registrations');
    Route::get('/pendaftaran/pelajar', [MasterDataController::class, 'registrationsStudents'])
        ->middleware('role_or_permission:administrator|pendaftaran.view,admin')
        ->name('registrations.students');
    Route::get('/pendaftaran/pengajar', [MasterDataController::class, 'registrationsTeachers'])
        ->middleware('role_or_permission:administrator|pendaftaran.view,admin')
        ->name('registrations.teachers');
    Route::post('/pendaftaran/murid/{studentRegistration}/approve', [AdminRegistrationController::class, 'approveStudent'])
        ->middleware('role_or_permission:administrator|pendaftaran.approve,admin')
        ->name('registrations.student.approve');
    Route::post('/pendaftaran/murid/{studentRegistration}/reject', [AdminRegistrationController::class, 'rejectStudent'])
        ->middleware('role_or_permission:administrator|pendaftaran.reject,admin')
        ->name('registrations.student.reject');
    Route::delete('/pendaftaran/murid/{studentRegistration}', [AdminRegistrationController::class, 'destroyStudent'])
        ->middleware('role_or_permission:administrator|pendaftaran.delete,admin')
        ->name('registrations.student.destroy');
    Route::post('/pendaftaran/pengajar/{teacherRegistration}/approve', [AdminRegistrationController::class, 'approveTeacher'])
        ->middleware('role_or_permission:administrator|pendaftaran.approve,admin')
        ->name('registrations.teacher.approve');
    Route::post('/pendaftaran/pengajar/{teacherRegistration}/reject', [AdminRegistrationController::class, 'rejectTeacher'])
        ->middleware('role_or_permission:administrator|pendaftaran.reject,admin')
        ->name('registrations.teacher.reject');
    Route::delete('/pendaftaran/pengajar/{teacherRegistration}', [AdminRegistrationController::class, 'destroyTeacher'])
        ->middleware('role_or_permission:administrator|pendaftaran.delete,admin')
        ->name('registrations.teacher.destroy');
    Route::get('/pengajar', [MasterDataController::class, 'teachers'])
        ->middleware('role_or_permission:administrator|pengajar.view,admin')
        ->name('teachers');
    Route::post('/pengajar', [TeacherController::class, 'store'])
        ->middleware('role_or_permission:administrator|pengajar.create,admin')
        ->name('teachers.store');
    Route::put('/pengajar/{teacher}', [TeacherController::class, 'update'])
        ->middleware('role_or_permission:administrator|pengajar.edit,admin')
        ->name('teachers.update');
    Route::delete('/pengajar/{teacher}', [TeacherController::class, 'destroy'])
        ->middleware('role_or_permission:administrator|pengajar.delete,admin')
        ->name('teachers.destroy');
    Route::get('/pelajar', [MasterDataController::class, 'students'])
        ->middleware('role_or_permission:administrator|pelajar.view,admin')
        ->name('students');
    Route::put('/pelajar/{student}', [StudentController::class, 'update'])
        ->middleware('role_or_permission:administrator|pelajar.edit,admin')
        ->name('students.update');
    Route::delete('/pelajar/{student}', [StudentController::class, 'destroy'])
        ->middleware('role_or_permission:administrator|pelajar.delete,admin')
        ->name('students.destroy');
    Route::get('/seo', [SeoController::class, 'edit'])
        ->middleware('role_or_permission:administrator|seo.view,admin')
        ->name('seo');
    Route::put('/seo', [SeoController::class, 'update'])
        ->middleware('role_or_permission:administrator|seo.edit,admin')
        ->name('seo.update');
    Route::get('/akses-menu', [AccessMenuController::class, 'index'])
        ->middleware('role_or_permission:administrator|akses-menu.view,admin')
        ->name('access-menu');
    Route::put('/akses-menu', [AccessMenuController::class, 'update'])
        ->middleware('role_or_permission:administrator|akses-menu.edit,admin')
        ->name('access-menu.update');
    Route::get('/roles', [RoleController::class, 'index'])
        ->middleware('role_or_permission:administrator|roles.view,admin')
        ->name('roles');
    Route::post('/roles', [RoleController::class, 'store'])
        ->middleware('role_or_permission:administrator|roles.create,admin')
        ->name('roles.store');
    Route::put('/roles/{role}', [RoleController::class, 'update'])
        ->middleware('role_or_permission:administrator|roles.edit,admin')
        ->name('roles.update');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])
        ->middleware('role_or_permission:administrator|roles.delete,admin')
        ->name('roles.destroy');
    Route::get('/users', [UserController::class, 'index'])
        ->middleware('role_or_permission:administrator|users.view,admin')
        ->name('users');
    Route::post('/users', [UserController::class, 'store'])
        ->middleware('role_or_permission:administrator|users.create,admin')
        ->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])
        ->middleware('role_or_permission:administrator|users.edit,admin')
        ->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])
        ->middleware('role_or_permission:administrator|users.delete,admin')
        ->name('users.destroy');
    Route::post('/users/{user}/invite', [UserController::class, 'invite'])
        ->middleware('role_or_permission:administrator|users.edit,admin')
        ->name('users.invite');
    Route::post('/users/{user}/impersonate', [UserController::class, 'impersonate'])
        ->name('users.impersonate');
    Route::post('/impersonate/stop', [UserController::class, 'stopImpersonate'])
        ->name('impersonate.stop');
});
