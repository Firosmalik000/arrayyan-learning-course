<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\LandingContentController;
use App\Http\Controllers\RegistrationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [LandingContentController::class, 'show'])->name('home');
Route::get('/olimpiade', fn () => Inertia::render('Public/Olympiad'))->name('olympiad');
Route::get('/olimpiade/{slug}', fn ($slug) => Inertia::render('Public/Olympiad/Detail', ['slug' => $slug]))->name('olympiad.detail');
Route::get('/pendaftaran', fn () => Inertia::render('Public/Register'))->name('register');
Route::get('/bank-soal', fn () => Inertia::render('Public/BankSoal'))->name('banksoal');
Route::get('/bank-soal/{slug}', fn ($slug) => Inertia::render('Public/BankSoal/Detail', ['slug' => $slug]))->name('banksoal.detail');

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

Route::prefix('admin')->name('admin.')->middleware('auth')->group(function () {
    Route::get('/', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');
    Route::get('/landing', [LandingContentController::class, 'edit'])->name('landing');
    Route::put('/landing', [LandingContentController::class, 'update'])->name('landing.update');
    Route::get('/program', fn () => Inertia::render('Admin/Programs'))->name('programs');
    Route::get('/bank-soal', fn () => Inertia::render('Admin/BankSoal'))->name('banksoal');
    Route::get('/olimpiade', fn () => Inertia::render('Admin/Olympiads'))->name('olympiads');
    Route::get('/pendaftaran', fn () => Inertia::render('Admin/Registrations'))->name('registrations');
    Route::get('/pengajar', fn () => Inertia::render('Admin/Teachers'))->name('teachers');
    Route::get('/pengaturan', fn () => Inertia::render('Admin/Settings'))->name('settings');
    Route::get('/roles', fn () => Inertia::render('Admin/Roles'))->name('roles');
    Route::get('/akses-menu', fn () => Inertia::render('Admin/AccessMenu'))->name('access-menu');
    Route::get('/users', fn () => Inertia::render('Admin/Users'))->name('users');
});
