<?php

use App\Http\Controllers\RegistrationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Public/Home'))->name('home');
Route::get('/olimpiade', fn () => Inertia::render('Public/Olympiad'))->name('olympiad');
Route::get('/pendaftaran', fn () => Inertia::render('Public/Register'))->name('register');

Route::post('/pendaftaran/murid', [RegistrationController::class, 'storeStudent'])
    ->name('registrations.student');
Route::post('/pendaftaran/pengajar', [RegistrationController::class, 'storeTeacher'])
    ->name('registrations.teacher');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/login', fn () => Inertia::render('Admin/Login'))->name('login');
    Route::get('/', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');
    Route::get('/program', fn () => Inertia::render('Admin/Programs'))->name('programs');
    Route::get('/bank-soal', fn () => Inertia::render('Admin/BankSoal'))->name('banksoal');
    Route::get('/olimpiade', fn () => Inertia::render('Admin/Olympiads'))->name('olympiads');
    Route::get('/pendaftaran', fn () => Inertia::render('Admin/Registrations'))->name('registrations');
    Route::get('/pengajar', fn () => Inertia::render('Admin/Teachers'))->name('teachers');
    Route::get('/pengaturan', fn () => Inertia::render('Admin/Settings'))->name('settings');
});
