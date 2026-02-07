<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankSoal;
use App\Models\Olympiad;
use App\Models\Package;
use App\Models\PageContent;
use App\Models\Program;
use App\Models\Student;
use App\Models\StudentRegistration;
use App\Models\Teacher;
use App\Models\TeacherRegistration;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MasterDataController extends Controller
{
    public function dashboard(): Response
    {
        $programTotal = Program::query()->count();
        $programActive = Program::query()->where('is_active', true)->count();
        $packageActive = Package::query()->where('is_active', true)->count();
        $bankSoalTotal = BankSoal::query()->count();
        $bankSoalActive = BankSoal::query()->where('is_active', true)->count();
        $olympiadActive = Olympiad::query()->where('is_active', true)->count();
        $olympiadUpcoming = Olympiad::query()
            ->where('is_active', true)
            ->whereDate('schedule', '>=', now()->toDateString())
            ->count();

        $pendingStudentQuery = StudentRegistration::query()
            ->whereNull('approved_at')
            ->whereNull('rejected_at');
        $pendingTeacherQuery = TeacherRegistration::query()
            ->whereNull('approved_at')
            ->whereNull('rejected_at');
        $pendingStudents = $pendingStudentQuery->count();
        $pendingTeachers = $pendingTeacherQuery->count();
        $approvedStudents = StudentRegistration::query()->whereNotNull('approved_at')->count();
        $approvedTeachers = TeacherRegistration::query()->whereNotNull('approved_at')->count();
        $rejectedStudents = StudentRegistration::query()->whereNotNull('rejected_at')->count();
        $rejectedTeachers = TeacherRegistration::query()->whereNotNull('rejected_at')->count();

        $stats = [
            [
                'label' => 'Program aktif',
                'value' => $programActive,
                'meta' => $programTotal > 0 ? "{$programTotal} total program" : 'Belum ada program',
                'tone' => 'violet',
            ],
            [
                'label' => 'Pendaftar pending',
                'value' => $pendingStudents + $pendingTeachers,
                'meta' => "{$pendingStudents} murid, {$pendingTeachers} pengajar",
                'tone' => 'amber',
            ],
            [
                'label' => 'Bank soal aktif',
                'value' => $bankSoalActive,
                'meta' => $bankSoalTotal > 0 ? "{$bankSoalTotal} total bank soal" : 'Belum ada bank soal',
                'tone' => 'rose',
            ],
            [
                'label' => 'Olimpiade aktif',
                'value' => $olympiadActive,
                'meta' => $olympiadUpcoming > 0 ? "{$olympiadUpcoming} jadwal mendatang" : 'Belum ada jadwal',
                'tone' => 'emerald',
            ],
        ];

        $heroContent = PageContent::query()->where('slug', 'hero')->first();
        $heroStatus = $heroContent ? 'Aktif' : 'Draft';
        $heroNote = $heroContent?->updated_at
            ? 'Update terakhir '.$heroContent->updated_at->locale('id')->translatedFormat('d M Y')
            : 'Belum diatur';

        $contentSections = [
            [
                'title' => 'Hero Beranda',
                'owner' => 'Landing',
                'status' => $heroStatus,
                'note' => $heroNote,
            ],
            [
                'title' => 'Program & Paket',
                'owner' => 'Admin Program',
                'status' => $programActive > 0 ? 'Aktif' : 'Draft',
                'note' => $programActive > 0 || $packageActive > 0
                    ? "{$programActive} program aktif, {$packageActive} paket aktif"
                    : 'Belum ada program aktif',
            ],
            [
                'title' => 'Bank Soal Unggulan',
                'owner' => 'Koordinator Akademik',
                'status' => $bankSoalActive > 0 ? 'Aktif' : 'Draft',
                'note' => $bankSoalActive > 0
                    ? "{$bankSoalActive} bank soal aktif"
                    : 'Belum ada bank soal aktif',
            ],
            [
                'title' => 'Info Olimpiade',
                'owner' => 'Admin Event',
                'status' => $olympiadActive > 0 ? 'Aktif' : 'Draft',
                'note' => $olympiadUpcoming > 0
                    ? "{$olympiadUpcoming} jadwal mendatang"
                    : 'Belum ada jadwal',
            ],
        ];

        $agenda = Olympiad::query()
            ->where('is_active', true)
            ->whereDate('schedule', '>=', now()->toDateString())
            ->orderBy('schedule')
            ->limit(3)
            ->get()
            ->map(function (Olympiad $olympiad) {
                $schedule = $olympiad->schedule
                    ? $olympiad->schedule->locale('id')->translatedFormat('d M Y')
                    : '-';

                return [
                    'title' => $olympiad->name,
                    'time' => $schedule,
                    'team' => 'Event',
                ];
            })
            ->values()
            ->all();

        $studentRegistrations = $pendingStudentQuery
            ->with('programItem:id,name')
            ->latest()
            ->limit(5)
            ->get()
            ->map(
                function (StudentRegistration $registration) {
                    $programName = $registration->programItem?->name;
                    if (! $programName) {
                        $programName = $registration->program ?: ($registration->package ?: '-');
                    }

                    return [
                        'id' => 'student-'.$registration->id,
                        'name' => $registration->student_name,
                        'type' => 'Murid',
                        'program' => $programName,
                        'status' => 'Pending',
                        'created_at' => $registration->created_at,
                    ];
                }
            );

        $teacherRegistrations = $pendingTeacherQuery->latest()->limit(5)->get()->map(
            function (TeacherRegistration $registration) {
                return [
                    'id' => 'teacher-'.$registration->id,
                    'name' => $registration->name,
                    'type' => 'Pengajar',
                    'program' => $registration->subjects ?: ($registration->education ?: '-'),
                    'status' => 'Pending',
                    'created_at' => $registration->created_at,
                ];
            }
        );

        $registrations = $studentRegistrations
            ->concat($teacherRegistrations)
            ->sortByDesc('created_at')
            ->take(6)
            ->values()
            ->map(function (array $item) {
                unset($item['created_at']);

                return $item;
            })
            ->all();

        $activityItems = collect();

        $latestProgram = Program::query()->latest()->first();
        if ($latestProgram) {
            $activityItems->push([
                'title' => 'Program terbaru',
                'detail' => $latestProgram->name,
                'created_at' => $latestProgram->created_at,
            ]);
        }

        $latestBankSoal = BankSoal::query()->latest()->first();
        if ($latestBankSoal) {
            $bankSoalName = $latestBankSoal->name;
            $bankSoalLabel = is_array($bankSoalName)
                ? ($bankSoalName['id'] ?? $bankSoalName['en'] ?? '-')
                : $bankSoalName;

            $activityItems->push([
                'title' => 'Bank soal terbaru',
                'detail' => $bankSoalLabel ?: '-',
                'created_at' => $latestBankSoal->created_at,
            ]);
        }

        $latestOlympiad = Olympiad::query()->latest()->first();
        if ($latestOlympiad) {
            $activityItems->push([
                'title' => 'Olimpiade terbaru',
                'detail' => $latestOlympiad->name,
                'created_at' => $latestOlympiad->created_at,
            ]);
        }

        $latestStudentRegistration = StudentRegistration::query()->latest()->first();
        if ($latestStudentRegistration) {
            $activityItems->push([
                'title' => 'Pendaftar murid',
                'detail' => $latestStudentRegistration->student_name,
                'created_at' => $latestStudentRegistration->created_at,
            ]);
        }

        $latestTeacherRegistration = TeacherRegistration::query()->latest()->first();
        if ($latestTeacherRegistration) {
            $activityItems->push([
                'title' => 'Pendaftar pengajar',
                'detail' => $latestTeacherRegistration->name,
                'created_at' => $latestTeacherRegistration->created_at,
            ]);
        }

        $activities = $activityItems
            ->sortByDesc('created_at')
            ->take(3)
            ->values()
            ->map(function (array $item) {
                $createdAt = $item['created_at'];
                $item['time'] = $createdAt
                    ? $createdAt->locale('id')->diffForHumans()
                    : '-';
                unset($item['created_at']);

                return $item;
            })
            ->all();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'contentSections' => $contentSections,
            'agenda' => $agenda,
            'registrations' => $registrations,
            'activities' => $activities,
            'registrationChart' => [
                'labels' => ['Pending', 'Disetujui', 'Ditolak'],
                'students' => [$pendingStudents, $approvedStudents, $rejectedStudents],
                'teachers' => [$pendingTeachers, $approvedTeachers, $rejectedTeachers],
            ],
        ]);
    }

    public function programs(): Response
    {
        return Inertia::render('Admin/Programs', [
            'programs' => Program::query()
                ->latest()
                ->get()
                ->map(function (Program $program) {
                    return [
                        'id' => $program->id,
                        'name' => $program->name,
                        'level' => $program->level,
                        'description' => $program->description,
                        'subjects' => $program->subjects,
                        'mode' => $program->mode,
                        'image_path' => $program->image_path,
                        'image_url' => $program->image_path ? Storage::url($program->image_path) : null,
                        'is_active' => $program->is_active,
                    ];
                }),
            'packages' => Package::query()->latest()->get(),
        ]);
    }

    public function bankSoal(): Response
    {
        return Inertia::render('Admin/BankSoal', [
            'bankSoalItems' => BankSoal::query()->latest()->get(),
        ]);
    }

    public function olympiads(): Response
    {
        return Inertia::render('Admin/Olympiads', [
            'olympiads' => Olympiad::query()
                ->latest()
                ->get()
                ->map(function (Olympiad $olympiad) {
                    return [
                        'id' => $olympiad->id,
                        'name' => $olympiad->name,
                        'slug' => $olympiad->slug,
                        'level' => $olympiad->level,
                        'schedule' => $olympiad->schedule,
                        'selection_system' => $olympiad->selection_system,
                        'category' => $olympiad->category,
                        'fee' => $olympiad->fee,
                        'notes' => $olympiad->notes,
                        'is_active' => $olympiad->is_active,
                        'image_path' => $olympiad->image_path,
                        'image_url' => $olympiad->image_path ? Storage::url($olympiad->image_path) : null,
                    ];
                }),
        ]);
    }

    public function registrations(): Response
    {
        return $this->renderRegistrations('student');
    }

    public function registrationsStudents(): Response
    {
        return $this->renderRegistrations('student');
    }

    public function registrationsTeachers(): Response
    {
        return $this->renderRegistrations('teacher');
    }

    public function teachers(): Response
    {
        $teachers = Teacher::query()
            ->latest()
            ->get()
            ->map(function (Teacher $teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'address' => $teacher->address,
                    'education' => $teacher->education,
                    'subjects' => $teacher->subjects,
                    'experience' => $teacher->experience,
                    'contact' => $teacher->contact,
                    'cv_path' => $teacher->cv_path,
                    'cv_url' => $teacher->cv_path
                        ? (Str::startsWith($teacher->cv_path, ['http://', 'https://'])
                            ? $teacher->cv_path
                            : Storage::url($teacher->cv_path))
                        : null,
                    'notes' => $teacher->notes,
                    'is_active' => $teacher->is_active,
                    'created_at' => $teacher->created_at,
                ];
            });

        return Inertia::render('Admin/Teachers', [
            'teacherRegistrations' => $teachers,
        ]);
    }

    public function students(): Response
    {
        return Inertia::render('Admin/Students', [
            'students' => Student::query()
                ->with('programItem:id,name')
                ->latest()
                ->get()
                ->map(function (Student $student) {
                    return [
                        'id' => $student->id,
                        'name' => $student->name,
                        'address' => $student->address,
                        'school_name' => $student->school_name,
                        'level' => $student->level,
                        'subjects' => $student->subjects,
                        'program_id' => $student->program_id,
                        'program' => $student->programItem?->name ?? $student->program,
                        'package' => $student->package,
                        'parent_contact' => $student->parent_contact,
                        'preferred_mode' => $student->preferred_mode,
                        'notes' => $student->notes,
                        'is_active' => $student->is_active,
                        'created_at' => $student->created_at,
                    ];
                }),
            'programs' => Program::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'level']),
        ]);
    }

    private function renderRegistrations(string $initialTab): Response
    {
        $payload = $this->registrationPayload();

        return Inertia::render('Admin/Registrations', [
            'studentRegistrations' => $payload['studentRegistrations'],
            'teacherRegistrations' => $payload['teacherRegistrations'],
            'initialTab' => $initialTab,
        ]);
    }

    /**
     * @return array{studentRegistrations: \Illuminate\Support\Collection<int, array<string, mixed>>, teacherRegistrations: \Illuminate\Support\Collection<int, array<string, mixed>>}
     */
    private function registrationPayload(): array
    {
        $students = StudentRegistration::query()
            ->with(['approver:id,name', 'rejector:id,name', 'programItem:id,name'])
            ->latest()
            ->get()
            ->map(function (StudentRegistration $student) {
                return [
                    'id' => $student->id,
                    'student_name' => $student->student_name,
                    'address' => $student->address,
                    'school_name' => $student->school_name,
                    'level' => $student->level,
                    'subjects' => $student->subjects,
                    'program' => $student->programItem?->name ?? $student->program,
                    'package' => $student->package,
                    'parent_contact' => $student->parent_contact,
                    'preferred_mode' => $student->preferred_mode,
                    'notes' => $student->notes,
                    'status' => $student->status,
                    'approved_at' => $student->approved_at,
                    'approved_by' => $student->approved_by,
                    'approved_by_name' => $student->approver?->name,
                    'rejected_at' => $student->rejected_at,
                    'rejected_by' => $student->rejected_by,
                    'rejected_by_name' => $student->rejector?->name,
                    'created_at' => $student->created_at,
                ];
            });

        $teachers = TeacherRegistration::query()
            ->with(['approver:id,name', 'rejector:id,name'])
            ->latest()
            ->get()
            ->map(function (TeacherRegistration $teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'address' => $teacher->address,
                    'education' => $teacher->education,
                    'subjects' => $teacher->subjects,
                    'experience' => $teacher->experience,
                    'contact' => $teacher->contact,
                    'cv_path' => $teacher->cv_path,
                    'cv_url' => $teacher->cv_path ? Storage::url($teacher->cv_path) : null,
                    'notes' => $teacher->notes,
                    'status' => $teacher->status,
                    'approved_at' => $teacher->approved_at,
                    'approved_by' => $teacher->approved_by,
                    'approved_by_name' => $teacher->approver?->name,
                    'rejected_at' => $teacher->rejected_at,
                    'rejected_by' => $teacher->rejected_by,
                    'rejected_by_name' => $teacher->rejector?->name,
                    'created_at' => $teacher->created_at,
                ];
            });

        return [
            'studentRegistrations' => $students,
            'teacherRegistrations' => $teachers,
        ];
    }
}
