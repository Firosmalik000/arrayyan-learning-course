<?php

use App\Http\Controllers\Admin\AcademicController;
use App\Http\Controllers\Admin\AccessMenuController;
use App\Http\Controllers\Admin\BankSoalController;
use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\MasterDataController;
use App\Http\Controllers\Admin\OlympiadController;
use App\Http\Controllers\Admin\OlympiadRegistrationAdminController;
use App\Http\Controllers\Admin\OpsController;
use App\Http\Controllers\Admin\PackageController;
use App\Http\Controllers\Admin\ProgramController;
use App\Http\Controllers\Admin\RegistrationController as AdminRegistrationController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SeoController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\BankSoalAccessController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\LandingContentController;
use App\Http\Controllers\OlympiadCertificateController;
use App\Http\Controllers\OlympiadRegistrationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Portal\PortalAuthController;
use App\Http\Controllers\Portal\PortalController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\StatusCheckController;
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
Route::get('/olimpiade/{slug}/daftar', [OlympiadRegistrationController::class, 'create'])->name('olympiad.register');
Route::post('/olimpiade/{slug}/daftar', [OlympiadRegistrationController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('olympiad.register.store');
Route::get('/olimpiade/{slug}/sertifikat', [OlympiadCertificateController::class, 'show'])->name('olympiad.certificate');
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
            'is_paid' => $olympiad->isPaid(),
            'quota' => $olympiad->quota,
            'quota_filled' => $olympiad->quotaFilled(),
            'quota_remaining' => $olympiad->quotaRemaining(),
            'registration_deadline' => $olympiad->registration_deadline,
            'is_registration_open' => $olympiad->is_registration_open,
            'closed_reason' => $olympiad->registrationClosedReason(),
            'winners' => $olympiad->winners ?? [],
            'notes' => $olympiad->notes,
            'image_url' => $olympiad->image_path ? Storage::url($olympiad->image_path) : null,
        ] : null,
    ]);
})->name('olympiad.detail');
Route::get('/pendaftaran', fn () => Inertia::render('Public/Register', [
    'programs' => Program::query()
        ->with([
            'teacher:id,name',
            'packages' => fn ($query) => $query
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('level')
                ->orderBy('sessions'),
        ])
        ->where('is_active', true)
        ->orderBy('name')
        ->get()
        ->map(fn (Program $program) => [
            'id' => $program->id,
            'slug' => $program->slug,
            'name' => $program->name,
            'level' => $program->level,
            'price' => $program->price,
            'quota' => $program->quota,
            'quota_remaining' => $program->quotaRemaining(),
            'is_full' => ! $program->hasAvailableQuota(),
            'duration' => $program->duration,
            'packages' => $program->packages->map(fn ($package) => [
                'id' => $package->id,
                'name' => $package->name,
                'level' => $package->level,
                'sessions' => $package->sessions,
                'intensity' => $package->intensity,
                'price' => $package->price,
                'max_participants' => $package->max_participants,
                'mode' => $package->mode,
                'schedule' => $package->schedule,
                'display_name' => $package->displayName(),
            ])->values()->all(),
        ])
        ->values()
        ->all(),
]))->name('register');
Route::get('/program', [LandingContentController::class, 'programs'])->name('programs');
Route::get('/program/{program}', [LandingContentController::class, 'programDetail'])
    ->name('programs.detail');
Route::get('/blog', [BlogController::class, 'index'])->name('blog');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.detail');
Route::get('/faq', [BlogController::class, 'faq'])->name('faq');
Route::get('/bank-soal', [LandingContentController::class, 'bankSoal'])->name('banksoal');
Route::get('/bank-soal/{slug}', function ($slug) {
    $bankSoal = BankSoal::query()
        ->where('slug', $slug)
        ->where('is_active', true)
        ->first();

    $bankSoal?->increment('view_count');

    $unlocked = $bankSoal
        ? BankSoalAccessController::hasAccess($bankSoal, request())
        : false;

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
            'links' => $unlocked
                ? collect($bankSoal->links ?? [])->map(fn (array $link) => [
                    'id' => $link['id'] ?? null,
                    'label' => $link['label'] ?? 'Unduh',
                ])->values()->all()
                : [],
            'unlocked' => $unlocked,
            'has_lock' => (bool) $bankSoal->passkey || (bool) BankSoalAccessController::globalPasskey(),
            'view_count' => $bankSoal->view_count,
            'download_count' => $bankSoal->download_count,
            'image_url' => $bankSoal->image_path ? Storage::url($bankSoal->image_path) : null,
            'tone' => $bankSoal->tone,
        ] : null,
    ]);
})->name('banksoal.detail');
Route::post('/bank-soal/{slug}/unlock', [BankSoalAccessController::class, 'unlock'])
    ->middleware('throttle:10,1')
    ->name('banksoal.unlock');
Route::get('/bank-soal/{slug}/unduh/{linkId}', [BankSoalAccessController::class, 'download'])
    ->middleware('throttle:60,1')
    ->name('banksoal.download');

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
    ->middleware('throttle:10,1')
    ->name('registrations.student');
Route::post('/pendaftaran/pengajar', [RegistrationController::class, 'storeTeacher'])
    ->middleware('throttle:10,1')
    ->name('registrations.teacher');
Route::get('/pendaftaran/berhasil/{registrationType}/{ticket}', [RegistrationController::class, 'success'])
    ->where('registrationType', 'murid|pengajar')
    ->where('ticket', 'ALC-\d{4}-\d{5}')
    ->name('registrations.success');
Route::get('/cek-status', [StatusCheckController::class, 'show'])
    ->middleware('throttle:60,1')
    ->name('status.check');
Route::get('/pembayaran', fn () => redirect()->route('portal.invoices'))
    ->name('payments.show');
Route::get('/bayar', fn () => redirect()->route('portal.invoices'))
    ->name('bayar');
Route::post('/bayar/{invoice}/upload', [PaymentController::class, 'upload'])
    ->middleware('throttle:10,1')
    ->name('bayar.upload');

Route::get('/admin/login', [AuthenticatedSessionController::class, 'create'])
    ->middleware('guest')
    ->name('admin.login');

Route::get('/portal/login', [PortalAuthController::class, 'create'])->name('portal.login');
Route::post('/portal/login', [PortalAuthController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('portal.login.store');

Route::prefix('portal')->name('portal.')->middleware('auth:portal')->group(function () {
    Route::post('/logout', [PortalAuthController::class, 'destroy'])->name('logout');

    Route::middleware('portal.password')->group(function () {
        Route::get('/', [PortalController::class, 'dashboard'])->name('dashboard');
        Route::get('/jadwal', [PortalController::class, 'schedule'])->name('schedule');
        Route::get('/absensi', [PortalController::class, 'attendance'])->name('attendance');
        Route::get('/nilai', [PortalController::class, 'grades'])->name('grades');
        Route::get('/tagihan', [PortalController::class, 'invoices'])->name('invoices');
        Route::post('/tagihan/{invoice}/bayar', [PortalController::class, 'uploadPayment'])
            ->middleware('throttle:10,1')
            ->name('invoices.pay');
        Route::get('/kelas/{classGroup}', [PortalController::class, 'classDetail'])->name('classes.show');
        Route::post('/kelas/{classGroup}/absensi', [PortalController::class, 'storeClassAttendance'])->name('classes.attendance.store');
        Route::post('/kelas/{classGroup}/nilai', [PortalController::class, 'storeClassGrades'])->name('classes.grades.store');
        Route::post('/kelas/{classGroup}/jadwal', [PortalController::class, 'storeClassSchedule'])->name('classes.schedules.store');
        Route::put('/jadwal/{schedule}', [PortalController::class, 'updateClassSchedule'])->name('classes.schedules.update');
        Route::delete('/jadwal/{schedule}', [PortalController::class, 'destroyClassSchedule'])->name('classes.schedules.destroy');
        Route::post('/kelas/{classGroup}/generate-pertemuan', [PortalController::class, 'generateClassSessions'])->name('classes.sessions.generate');
        Route::get('/profil', [PortalController::class, 'profile'])->name('profile');
        Route::post('/pilih-anak/{student}', [PortalController::class, 'switchStudent'])->name('switch_student');
        Route::post('/tambah-program', [PortalController::class, 'storeProgram'])->name('programs.store');
    });

    Route::get('/password', [PortalController::class, 'password'])->name('password');
    Route::put('/password', [PortalController::class, 'updatePassword'])->name('password.update');
});

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
    Route::post('/paket', [PackageController::class, 'store'])
        ->middleware('role_or_permission:administrator|program.create,admin')
        ->name('packages.store');
    Route::put('/paket/{package}', [PackageController::class, 'update'])
        ->middleware('role_or_permission:administrator|program.edit,admin')
        ->name('packages.update');
    Route::delete('/paket/{package}', [PackageController::class, 'destroy'])
        ->middleware('role_or_permission:administrator|program.delete,admin')
        ->name('packages.destroy');
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
    Route::get('/olimpiade/pendaftaran', [OlympiadRegistrationAdminController::class, 'index'])
        ->middleware('role_or_permission:administrator|olimpiade.view,admin')
        ->name('olympiad-registrations');
    Route::post('/olimpiade/pendaftaran/{registration}/approve', [OlympiadRegistrationAdminController::class, 'approve'])
        ->middleware('role_or_permission:administrator|olimpiade.approve,admin')
        ->name('olympiad-registrations.approve');
    Route::post('/olimpiade/pendaftaran/{registration}/reject', [OlympiadRegistrationAdminController::class, 'reject'])
        ->middleware('role_or_permission:administrator|olimpiade.reject,admin')
        ->name('olympiad-registrations.reject');
    Route::post('/olimpiade/pendaftaran/{registration}/fee-paid', [OlympiadRegistrationAdminController::class, 'markFeePaid'])
        ->middleware('role_or_permission:administrator|olimpiade.approve,admin')
        ->name('olympiad-registrations.fee-paid');
    Route::delete('/olimpiade/pendaftaran/{registration}', [OlympiadRegistrationAdminController::class, 'destroy'])
        ->middleware('role_or_permission:administrator|olimpiade.delete,admin')
        ->name('olympiad-registrations.destroy');
    Route::get('/pendaftaran', [MasterDataController::class, 'registrations'])
        ->middleware('role_or_permission:administrator|pendaftaran.view,admin')
        ->name('registrations');
    Route::get('/pendaftaran/pelajar', [MasterDataController::class, 'registrationsStudents'])
        ->middleware('role_or_permission:administrator|pendaftaran.view,admin')
        ->name('registrations.students');
    Route::get('/pendaftaran/pengajar', [MasterDataController::class, 'registrationsTeachers'])
        ->middleware('role_or_permission:administrator|pendaftaran.view,admin')
        ->name('registrations.teachers');
    Route::post('/pendaftaran/murid/bulk-approve', [AdminRegistrationController::class, 'bulkApproveStudents'])
        ->middleware('role_or_permission:administrator|pendaftaran.approve,admin')
        ->name('registrations.student.bulk-approve');
    Route::post('/pendaftaran/murid/{studentRegistration}/approve', [AdminRegistrationController::class, 'approveStudent'])
        ->middleware('role_or_permission:administrator|pendaftaran.approve,admin')
        ->name('registrations.student.approve');
    Route::post('/pendaftaran/murid/{studentRegistration}/reject', [AdminRegistrationController::class, 'rejectStudent'])
        ->middleware('role_or_permission:administrator|pendaftaran.reject,admin')
        ->name('registrations.student.reject');
    Route::post('/pendaftaran/murid/{studentRegistration}/resend-email', [AdminRegistrationController::class, 'resendStudentEmail'])
        ->middleware('role_or_permission:administrator|pendaftaran.approve,admin')
        ->name('registrations.student.resend-email');
    Route::delete('/pendaftaran/murid/{studentRegistration}', [AdminRegistrationController::class, 'destroyStudent'])
        ->middleware('role_or_permission:administrator|pendaftaran.delete,admin')
        ->name('registrations.student.destroy');
    Route::post('/pendaftaran/pengajar/bulk-approve', [AdminRegistrationController::class, 'bulkApproveTeachers'])
        ->middleware('role_or_permission:administrator|pendaftaran.approve,admin')
        ->name('registrations.teacher.bulk-approve');
    Route::post('/pendaftaran/pengajar/{teacherRegistration}/approve', [AdminRegistrationController::class, 'approveTeacher'])
        ->middleware('role_or_permission:administrator|pendaftaran.approve,admin')
        ->name('registrations.teacher.approve');
    Route::post('/pendaftaran/pengajar/{teacherRegistration}/reject', [AdminRegistrationController::class, 'rejectTeacher'])
        ->middleware('role_or_permission:administrator|pendaftaran.reject,admin')
        ->name('registrations.teacher.reject');
    Route::post('/pendaftaran/pengajar/{teacherRegistration}/resend-email', [AdminRegistrationController::class, 'resendTeacherEmail'])
        ->middleware('role_or_permission:administrator|pendaftaran.approve,admin')
        ->name('registrations.teacher.resend-email');
    Route::delete('/pendaftaran/pengajar/{teacherRegistration}', [AdminRegistrationController::class, 'destroyTeacher'])
        ->middleware('role_or_permission:administrator|pendaftaran.delete,admin')
        ->name('registrations.teacher.destroy');
    Route::get('/akademik', [AcademicController::class, 'index'])
        ->middleware('role_or_permission:administrator|akademik.view,admin')
        ->name('academic');
    Route::post('/akademik/kelas', [AcademicController::class, 'storeClass'])
        ->middleware('role_or_permission:administrator|akademik.create,admin')
        ->name('academic.classes.store');
    Route::put('/akademik/kelas/{classGroup}', [AcademicController::class, 'updateClass'])
        ->middleware('role_or_permission:administrator|akademik.edit,admin')
        ->name('academic.classes.update');
    Route::delete('/akademik/kelas/{classGroup}', [AcademicController::class, 'destroyClass'])
        ->middleware('role_or_permission:administrator|akademik.delete,admin')
        ->name('academic.classes.destroy');
    Route::post('/akademik/kelas/{classGroup}/anggota', [AcademicController::class, 'addMember'])
        ->middleware('role_or_permission:administrator|akademik.create,admin')
        ->name('academic.members.store');
    Route::delete('/akademik/anggota/{member}', [AcademicController::class, 'removeMember'])
        ->middleware('role_or_permission:administrator|akademik.delete,admin')
        ->name('academic.members.destroy');
    Route::post('/akademik/kelas/{classGroup}/jadwal', [AcademicController::class, 'storeSchedule'])
        ->middleware('role_or_permission:administrator|akademik.create,admin')
        ->name('academic.schedules.store');
    Route::put('/akademik/jadwal/{schedule}', [AcademicController::class, 'updateSchedule'])
        ->middleware('role_or_permission:administrator|akademik.edit,admin')
        ->name('academic.schedules.update');
    Route::delete('/akademik/jadwal/{schedule}', [AcademicController::class, 'destroySchedule'])
        ->middleware('role_or_permission:administrator|akademik.delete,admin')
        ->name('academic.schedules.destroy');
    Route::post('/akademik/kelas/{classGroup}/absensi', [AcademicController::class, 'storeAttendance'])
        ->middleware('role_or_permission:administrator|akademik.edit,admin')
        ->name('academic.attendance.store');
    Route::post('/akademik/kelas/{classGroup}/generate-pertemuan', [AcademicController::class, 'generateSessions'])
        ->middleware('role_or_permission:administrator|akademik.edit,admin')
        ->name('academic.sessions.generate');
    Route::post('/akademik/kelas/{classGroup}/nilai', [AcademicController::class, 'storeGrades'])
        ->middleware('role_or_permission:administrator|akademik.edit,admin')
        ->name('academic.grades.store');
    Route::get('/akademik/kelas/{classGroup}/export/{type}', [AcademicController::class, 'export'])
        ->middleware('role_or_permission:administrator|akademik.export,admin')
        ->name('academic.export');
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
    Route::get('/keuangan', [InvoiceController::class, 'index'])
        ->middleware('role_or_permission:administrator|keuangan.view,admin')
        ->name('keuangan');
    Route::post('/keuangan/invoice/{invoice}/confirm', [InvoiceController::class, 'confirm'])
        ->middleware('role_or_permission:administrator|keuangan.approve,admin')
        ->name('keuangan.invoice.confirm');
    Route::post('/keuangan/invoice/{invoice}/decline', [InvoiceController::class, 'declineInvoice'])
        ->middleware('role_or_permission:administrator|keuangan.reject,admin')
        ->name('keuangan.invoice.decline');
    Route::post('/keuangan/payment/{payment}/verify', [InvoiceController::class, 'verify'])
        ->middleware('role_or_permission:administrator|keuangan.approve,admin')
        ->name('keuangan.verify');
    Route::post('/keuangan/payment/{payment}/decline', [InvoiceController::class, 'decline'])
        ->middleware('role_or_permission:administrator|keuangan.reject,admin')
        ->name('keuangan.decline');
    Route::post('/keuangan/from-registration/{studentRegistration}', [InvoiceController::class, 'createForRegistration'])
        ->middleware('role_or_permission:administrator|keuangan.create,admin')
        ->name('keuangan.create-from-registration');
    Route::get('/keuangan/export', [InvoiceController::class, 'export'])
        ->middleware('role_or_permission:administrator|keuangan.export,admin')
        ->name('keuangan.export');
    Route::get('/pendaftaran/export/{type}', [AdminRegistrationController::class, 'exportRegistrations'])
        ->where('type', 'murid|pengajar')
        ->middleware('role_or_permission:administrator|pendaftaran.export,admin')
        ->name('registrations.export');
    Route::get('/pelajar/{student}/kartu', [StudentController::class, 'card'])
        ->middleware('role_or_permission:administrator|pelajar.view,admin')
        ->name('students.card');
    Route::get('/konten', [ContentController::class, 'index'])
        ->middleware('role_or_permission:administrator|konten.view,admin')
        ->name('content');
    Route::post('/konten/posts', [ContentController::class, 'storePost'])
        ->middleware('role_or_permission:administrator|konten.create,admin')
        ->name('content.posts.store');
    Route::put('/konten/posts/{post}', [ContentController::class, 'updatePost'])
        ->middleware('role_or_permission:administrator|konten.edit,admin')
        ->name('content.posts.update');
    Route::delete('/konten/posts/{post}', [ContentController::class, 'destroyPost'])
        ->middleware('role_or_permission:administrator|konten.delete,admin')
        ->name('content.posts.destroy');
    Route::post('/konten/testimoni', [ContentController::class, 'storeTestimonial'])
        ->middleware('role_or_permission:administrator|konten.create,admin')
        ->name('content.testimonials.store');
    Route::put('/konten/testimoni/{testimonial}', [ContentController::class, 'updateTestimonial'])
        ->middleware('role_or_permission:administrator|konten.edit,admin')
        ->name('content.testimonials.update');
    Route::delete('/konten/testimoni/{testimonial}', [ContentController::class, 'destroyTestimonial'])
        ->middleware('role_or_permission:administrator|konten.delete,admin')
        ->name('content.testimonials.destroy');
    Route::post('/konten/faq', [ContentController::class, 'storeFaq'])
        ->middleware('role_or_permission:administrator|konten.create,admin')
        ->name('content.faqs.store');
    Route::put('/konten/faq/{faq}', [ContentController::class, 'updateFaq'])
        ->middleware('role_or_permission:administrator|konten.edit,admin')
        ->name('content.faqs.update');
    Route::delete('/konten/faq/{faq}', [ContentController::class, 'destroyFaq'])
        ->middleware('role_or_permission:administrator|konten.delete,admin')
        ->name('content.faqs.destroy');
    Route::post('/konten/revisi/{revision}/restore', [ContentController::class, 'restoreRevision'])
        ->middleware('role_or_permission:administrator|landing.edit,admin')
        ->name('content.revisions.restore');
    Route::get('/notifikasi', [OpsController::class, 'notifications'])
        ->middleware('role_or_permission:administrator|dashboard.view,admin')
        ->name('notifications');
    Route::get('/aktivitas', [OpsController::class, 'activities'])
        ->middleware('role_or_permission:administrator|users.view,admin')
        ->name('activities');
});
