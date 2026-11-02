<?php

use App\Models\ClassGroup;
use App\Models\Program;
use App\Models\Role;
use App\Models\Student;
use App\Models\User;
use App\Support\AttendancePdf;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function (): void {
    Permission::findOrCreate('akademik.export', PermissionCatalog::GUARD);
    $role = Role::create(['name' => 'administrator', 'label' => 'Administrator', 'guard_name' => PermissionCatalog::GUARD]);
    $this->admin = User::factory()->create();
    $this->admin->assignRole($role);
    $this->actingAs($this->admin, PermissionCatalog::GUARD);
    $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
    $this->classGroup = ClassGroup::create(['program_id' => $program->id, 'name' => 'Kelas A', 'is_active' => true]);
});

function addPdfStudent(ClassGroup $classGroup, string $name, string $school = 'Sekolah A', string $status = 'active'): Student
{
    $student = Student::create(['name' => $name, 'school_name' => $school, 'parent_contact' => '081234567890']);
    $classGroup->members()->create(['student_id' => $student->id, 'status' => $status, 'joined_at' => '2026-01-01']);

    return $student;
}

it('downloads an actual PDF for the selected month and student search', function (): void {
    $student = addPdfStudent($this->classGroup, 'Aisyah (Putri)');
    addPdfStudent($this->classGroup, 'Budi');
    addPdfStudent($this->classGroup, 'Aisyah Selesai', status: 'completed');
    $otherClass = ClassGroup::create(['program_id' => $this->classGroup->program_id, 'name' => 'Other', 'is_active' => true]);
    addPdfStudent($otherClass, 'Aisyah Kelas Lain');
    foreach (['2026-10-03' => 'hadir', '2026-11-04' => 'hadir', '2026-11-05' => 'izin', '2026-11-06' => 'belum_absen'] as $date => $status) {
        $this->classGroup->attendances()->create(['student_id' => $student->id, 'date' => $date, 'status' => $status]);
    }
    $response = $this->get(route('admin.academic.attendance.pdf', [
        'classGroup' => $this->classGroup, 'month' => '2026-11', 'search' => 'aISYah',
    ]));
    $response->assertSuccessful()->assertDownload("absensi-{$this->classGroup->id}-2026-11.pdf")
        ->assertHeader('Content-Type', 'application/pdf');
    $pdf = $response->streamedContent();
    expect($pdf)->toStartWith('%PDF-1.4')->toContain('%%EOF', 'November 2026', 'Aisyah \\(Putri\\)', '(04/11)', '(50%)')
        ->not->toContain('(03/10)', '(Budi)', 'Aisyah Selesai', 'Aisyah Kelas Lain');
    expect($pdf)->toContain('/BaseFont /Helvetica-Bold', '(MURID DALAM LAPORAN)', '(TINGKAT KEHADIRAN)');
    preg_match('/\(CATATAN TERISI\) Tj ET\s+[^\n]+\(([^)]+)\) Tj/', $pdf, $summary);
    expect($summary[1])->toBe('2');
});

it('filters by school using literal case insensitive matches', function (): void {
    addPdfStudent($this->classGroup, 'Murid Cocok', 'SMP 100%');
    addPdfStudent($this->classGroup, 'Murid Lain', 'SMP 1000');
    $pdf = app(AttendancePdf::class)->render($this->classGroup, '2026-11', 'smp 100%');
    expect($pdf)->toContain('(Murid Cocok)')->not->toContain('(Murid Lain)');
});

it('exports all active students when the search is empty including completed classes', function (): void {
    addPdfStudent($this->classGroup, 'Aisyah');
    addPdfStudent($this->classGroup, 'Budi');
    $this->classGroup->update(['is_active' => false]);
    $pdf = $this->get(route('admin.academic.attendance.pdf', ['classGroup' => $this->classGroup, 'month' => '2026-11']))
        ->assertSuccessful()->streamedContent();
    expect($pdf)->toContain('(Aisyah)', '(Budi)');
});

it('rejects invalid export filters', function (array $query, string $field): void {
    $this->getJson(route('admin.academic.attendance.pdf', ['classGroup' => $this->classGroup, ...$query]))
        ->assertUnprocessable()->assertJsonValidationErrors($field);
})->with([
    'missing month' => [[], 'month'],
    'invalid month' => [['month' => '2026-13'], 'month'],
    'wrong format' => [['month' => '2026-11-01'], 'month'],
    'array search' => [['month' => '2026-11', 'search' => ['x']], 'search'],
    'long search' => [['month' => '2026-11', 'search' => str_repeat('a', 256)], 'search'],
]);

it('requires export permission and authentication', function (): void {
    $url = route('admin.academic.attendance.pdf', ['classGroup' => $this->classGroup, 'month' => '2026-11']);
    auth(PermissionCatalog::GUARD)->logout();
    $this->get($url)->assertRedirect();
    $user = User::factory()->create();
    $this->actingAs($user, PermissionCatalog::GUARD)->get($url)->assertForbidden();
    $user->givePermissionTo('akademik.export');
    $this->get($url)->assertSuccessful();
});

it('returns not found for an unknown class', function (): void {
    $this->get(route('admin.academic.attendance.pdf', ['classGroup' => 999999, 'month' => '2026-11']))->assertNotFound();
});

it('provides the named PDF download URL to the academic page', function (): void {
    $this->get(route('admin.academic'))->assertSuccessful()->assertInertia(fn ($page) => $page
        ->component('Admin/Academic', false)
        ->where('classes.0.attendance_pdf_url', route('admin.academic.attendance.pdf', $this->classGroup))
    );
});

it('handles no matching students and projects scheduled days in an empty month', function (): void {
    $this->classGroup->schedules()->create(['day_of_week' => 1, 'start_time' => '09:00', 'end_time' => '10:00']);
    $pdf = app(AttendancePdf::class)->render($this->classGroup, '2026-02');
    expect($pdf)->toContain('Tidak ada murid sesuai filter.', '(02/02)', '(23/02)')->not->toContain('(02/03)');
});

it('paginates students and dates with repeated headings and valid object offsets', function (): void {
    for ($index = 1; $index <= 15; $index++) {
        $student = addPdfStudent($this->classGroup, 'Murid '.str_pad((string) $index, 2, '0', STR_PAD_LEFT));
    }
    for ($day = 1; $day <= 31; $day++) {
        $this->classGroup->attendances()->create(['student_id' => $student->id, 'date' => sprintf('2026-10-%02d', $day), 'status' => 'sakit']);
    }
    $pdf = app(AttendancePdf::class)->render($this->classGroup, '2026-10');
    expect($pdf)->toContain('/Count 4', '(31/10)', '(Murid 15)', '(Halaman 4 / 4)');
    expect(substr_count($pdf, '(REKAP ABSENSI BULANAN)'))->toBe(4);
    preg_match('/startxref\n(\d+)/', $pdf, $match);
    expect(substr($pdf, (int) $match[1], 4))->toBe('xref');
    preg_match_all('/^(\d{10}) 00000 n/m', $pdf, $offsets);
    foreach ($offsets[1] as $index => $offset) {
        expect(substr($pdf, (int) $offset, strlen(($index + 1).' 0 obj')))->toBe(($index + 1).' 0 obj');
    }
});
