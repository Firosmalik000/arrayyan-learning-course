<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankSoal;
use App\Models\ClassGroup;
use App\Models\Invoice;
use App\Models\Olympiad;
use App\Models\OlympiadRegistration;
use App\Models\Package;
use App\Models\PageContent;
use App\Models\Program;
use App\Models\Student;
use App\Models\StudentRegistration;
use App\Models\Teacher;
use App\Models\TeacherRegistration;
use Illuminate\Http\Request;
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

        // 6-Month Monthly Trend for Registrations
        $monthlyTrends = collect(range(5, 0))->map(function ($monthsAgo) {
            $date = now()->subMonths($monthsAgo);
            $start = $date->copy()->startOfMonth();
            $end = $date->copy()->endOfMonth();

            $studentCount = StudentRegistration::query()
                ->whereBetween('created_at', [$start, $end])
                ->count();
            $teacherCount = TeacherRegistration::query()
                ->whereBetween('created_at', [$start, $end])
                ->count();

            return [
                'month' => $date->locale('id')->translatedFormat('M'),
                'fullMonth' => $date->locale('id')->translatedFormat('F Y'),
                'students' => $studentCount,
                'teachers' => $teacherCount,
                'total' => $studentCount + $teacherCount,
            ];
        })->values()->all();

        // Financial Overview from Invoices
        $paidRevenue = (float) Invoice::query()->where('status', Invoice::STATUS_PAID)->sum('amount');
        $pendingRevenue = (float) Invoice::query()->whereIn('status', [Invoice::STATUS_UNPAID, Invoice::STATUS_PENDING])->sum('amount');
        $paidInvoiceCount = Invoice::query()->where('status', Invoice::STATUS_PAID)->count();
        $unpaidInvoiceCount = Invoice::query()->whereIn('status', [Invoice::STATUS_UNPAID, Invoice::STATUS_PENDING])->count();

        $financials = [
            'paidRevenue' => $paidRevenue,
            'pendingRevenue' => $pendingRevenue,
            'totalInvoiced' => $paidRevenue + $pendingRevenue,
            'paidCount' => $paidInvoiceCount,
            'unpaidCount' => $unpaidInvoiceCount,
            'totalCount' => $paidInvoiceCount + $unpaidInvoiceCount,
        ];

        // Program Distribution by Level
        $programDistribution = Program::query()
            ->selectRaw("COALESCE(NULLIF(level, ''), 'Umum') as level_name, count(*) as count")
            ->groupBy('level_name')
            ->get()
            ->map(fn ($item) => [
                'name' => (string) $item->level_name,
                'count' => (int) $item->count,
            ])
            ->values()
            ->all();

        // Quick Summary Counts
        $summaryCounts = [
            'totalStudents' => Student::query()->count(),
            'totalTeachers' => Teacher::query()->count(),
            'totalClasses' => ClassGroup::query()->count(),
            'olympiadParticipants' => OlympiadRegistration::query()->count(),
            'activePrograms' => $programActive,
            'totalPrograms' => $programTotal,
        ];

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
            'monthlyTrends' => $monthlyTrends,
            'financials' => $financials,
            'programDistribution' => $programDistribution,
            'summaryCounts' => $summaryCounts,
        ]);
    }

    public function programs(): Response
    {
        return Inertia::render('Admin/Programs', [
            'programs' => Program::query()
                ->with('teacher:id,name')
                ->withCount('packages')
                ->latest()
                ->get()
                ->map(function (Program $program) {
                    return [
                        'id' => $program->id,
                        'slug' => $program->slug,
                        'name' => $program->name,
                        'level' => $program->level,
                        'description' => $program->description,
                        'price' => $program->price,
                        'starting_price' => $program->startingPrice(),
                        'packages_count' => $program->packages_count,
                        'duration' => $program->duration,
                        'quota' => $program->quota,
                        'quota_filled' => $program->quotaFilled(),
                        'quota_remaining' => $program->quotaRemaining(),
                        'schedule_info' => $program->schedule_info,
                        'syllabus' => $program->syllabus ?? [],
                        'teacher_id' => $program->teacher_id,
                        'teacher_name' => $program->teacher?->name,
                        'subjects' => $program->subjects,
                        'mode' => $program->mode,
                        'image_path' => $program->image_path,
                        'image_url' => $program->image_path ? Storage::url($program->image_path) : null,
                        'is_active' => $program->is_active,
                        'is_featured' => $program->is_featured,
                    ];
                }),
            'packages' => Package::query()
                ->with('program:id,name')
                ->orderBy('program_id')
                ->orderBy('sort_order')
                ->orderBy('level')
                ->orderBy('sessions')
                ->get()
                ->map(fn (Package $package) => [
                    'id' => $package->id,
                    'program_id' => $package->program_id,
                    'program_name' => $package->program?->name,
                    'name' => $package->name,
                    'level' => $package->level,
                    'sessions' => $package->sessions,
                    'intensity' => $package->intensity,
                    'price' => $package->price,
                    'max_participants' => $package->max_participants,
                    'mode' => $package->mode,
                    'schedule' => $package->schedule,
                    'sort_order' => $package->sort_order,
                    'is_active' => $package->is_active,
                    'is_used' => $package->studentRegistrations()->exists(),
                ]),
            'teachers' => Teacher::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function bankSoal(): Response
    {
        $bankSoalContent = PageContent::query()
            ->where('slug', 'bank-soal')
            ->first()?->content;

        return Inertia::render('Admin/BankSoal', [
            'globalPasskey' => is_array($bankSoalContent)
                ? (string) ($bankSoalContent['bankSoalPasskey'] ?? '')
                : '',
            'bankSoalItems' => BankSoal::query()
                ->latest()
                ->get()
                ->map(function (BankSoal $item) {
                    return [
                        'id' => $item->id,
                        'slug' => $item->slug,
                        'name' => $item->name,
                        'category' => $item->category,
                        'level' => $item->level,
                        'format' => $item->format,
                        'questions' => $item->questions,
                        'description' => $item->description,
                        'links' => $item->links ?? [],
                        'has_passkey' => ! empty($item->passkey),
                        'view_count' => $item->view_count ?? 0,
                        'download_count' => $item->download_count ?? 0,
                        'image_path' => $item->image_path,
                        'image_url' => $item->image_path ? Storage::url($item->image_path) : null,
                        'tone' => $item->tone,
                        'is_active' => $item->is_active,
                    ];
                }),
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
                        'quota' => $olympiad->quota,
                        'quota_filled' => $olympiad->quotaFilled(),
                        'registration_deadline' => $olympiad->registration_deadline,
                        'winners' => $olympiad->winners ?? [],
                        'is_registration_open' => $olympiad->is_registration_open,
                        'notes' => $olympiad->notes,
                        'is_active' => $olympiad->is_active,
                        'image_path' => $olympiad->image_path,
                        'image_url' => $olympiad->image_path ? Storage::url($olympiad->image_path) : null,
                    ];
                }),
        ]);
    }

    public function registrations(Request $request): Response
    {
        return $this->renderRegistrations($request, 'student');
    }

    public function registrationsStudents(Request $request): Response
    {
        return $this->renderRegistrations($request, 'student');
    }

    public function registrationsTeachers(Request $request): Response
    {
        return $this->renderRegistrations($request, 'teacher');
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
                    'city' => $teacher->city,
                    'district' => $teacher->district,
                    'teacher_role' => $teacher->teacher_role,
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
                ->with(['programItem:id,name', 'parentAccount:id,email'])
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
                        'parent_email' => $student->parent_email ?: $student->parentAccount?->email,
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

    private const REGISTRATION_STATUSES = ['pending', 'approved', 'rejected'];

    private function renderRegistrations(Request $request, string $initialTab): Response
    {
        $studentFilters = [
            'search' => trim((string) $request->query('student_search', '')),
            'level' => trim((string) $request->query('student_level', '')),
            'status' => $request->filled('student_status')
                ? (string) $request->query('student_status')
                : 'pending',
        ];

        $teacherFilters = [
            'search' => trim((string) $request->query('teacher_search', '')),
            'status' => $request->filled('teacher_status')
                ? (string) $request->query('teacher_status')
                : 'pending',
        ];

        $studentPerPage = min(max($request->integer('students_per_page', 10), 5), 100);
        $teacherPerPage = min(max($request->integer('teachers_per_page', 10), 5), 100);

        $students = StudentRegistration::query()
            ->with(['approver:id,name', 'rejector:id,name', 'programItem:id,name'])
            ->tap(fn ($query) => $this->applyStudentFilters($query, $studentFilters, true))
            ->latest()
            ->paginate($studentPerPage, ['*'], 'students_page')
            ->withQueryString();
        $students->through(fn (StudentRegistration $student) => $this->formatStudentRegistration($student));

        $teachers = TeacherRegistration::query()
            ->with(['approver:id,name', 'rejector:id,name'])
            ->tap(fn ($query) => $this->applyTeacherFilters($query, $teacherFilters, true))
            ->latest()
            ->paginate($teacherPerPage, ['*'], 'teachers_page')
            ->withQueryString();
        $teachers->through(fn (TeacherRegistration $teacher) => $this->formatTeacherRegistration($teacher));

        return Inertia::render('Admin/Registrations', [
            'studentRegistrations' => $students,
            'teacherRegistrations' => $teachers,
            'studentStats' => $this->registrationStats(StudentRegistration::query(), $studentFilters, 'student'),
            'teacherStats' => $this->registrationStats(TeacherRegistration::query(), $teacherFilters, 'teacher'),
            'levelOptions' => StudentRegistration::query()
                ->select('level')
                ->whereNotNull('level')
                ->where('level', '<>', '')
                ->distinct()
                ->orderBy('level')
                ->pluck('level')
                ->values()
                ->all(),
            'filters' => [
                'student_search' => $studentFilters['search'],
                'student_level' => $studentFilters['level'],
                'student_status' => $studentFilters['status'],
                'students_per_page' => $studentPerPage,
                'teacher_search' => $teacherFilters['search'],
                'teacher_status' => $teacherFilters['status'],
                'teachers_per_page' => $teacherPerPage,
            ],
            'initialTab' => $initialTab,
        ]);
    }

    private function applyStudentFilters($query, array $filters, bool $withStatus): void
    {
        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($inner) use ($search): void {
                $inner->where('student_name', 'like', "%{$search}%")
                    ->orWhere('school_name', 'like', "%{$search}%")
                    ->orWhere('parent_contact', 'like', "%{$search}%")
                    ->orWhere('parent_email', 'like', "%{$search}%");
            });
        }

        if ($filters['level'] !== '') {
            $query->where('level', $filters['level']);
        }

        if ($withStatus && in_array($filters['status'], self::REGISTRATION_STATUSES, true)) {
            $query->where('status', $filters['status']);
        }
    }

    private function applyTeacherFilters($query, array $filters, bool $withStatus): void
    {
        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($inner) use ($search): void {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('teacher_role', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%")
                    ->orWhere('subjects', 'like', "%{$search}%")
                    ->orWhere('contact', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($withStatus && in_array($filters['status'], self::REGISTRATION_STATUSES, true)) {
            $query->where('status', $filters['status']);
        }
    }

    /**
     * @return array{total: int, pending: int, approved: int, rejected: int}
     */
    private function registrationStats($query, array $filters, string $type): array
    {
        if ($type === 'student') {
            $this->applyStudentFilters($query, $filters, false);
        } else {
            $this->applyTeacherFilters($query, $filters, false);
        }

        $counts = $query
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        return [
            'total' => (int) $counts->sum(),
            'pending' => (int) ($counts['pending'] ?? 0),
            'approved' => (int) ($counts['approved'] ?? 0),
            'rejected' => (int) ($counts['rejected'] ?? 0),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatStudentRegistration(StudentRegistration $student): array
    {
        return [
            'id' => $student->id,
            'registration_no' => $student->registration_no,
            'student_name' => $student->student_name,
            'address' => $student->address,
            'school_name' => $student->school_name,
            'level' => $student->level,
            'class_level' => $student->class_level,
            'subjects' => $student->subjects,
            'program' => $student->programItem?->name ?? $student->program,
            'package_id' => $student->package_id,
            'package' => $student->package,
            'parent_contact' => $student->parent_contact,
            'parent_email' => $student->parent_email,
            'preferred_mode' => $student->preferred_mode,
            'notes' => $student->notes,
            'admin_note' => $student->admin_note,
            'status' => $student->status,
            'approved_at' => $student->approved_at,
            'approved_by' => $student->approved_by,
            'approved_by_name' => $student->approver?->name,
            'rejected_at' => $student->rejected_at,
            'rejected_by' => $student->rejected_by,
            'rejected_by_name' => $student->rejector?->name,
            'created_at' => $student->created_at,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatTeacherRegistration(TeacherRegistration $teacher): array
    {
        return [
            'id' => $teacher->id,
            'registration_no' => $teacher->registration_no,
            'name' => $teacher->name,
            'address' => $teacher->address,
            'city' => $teacher->city,
            'district' => $teacher->district,
            'teacher_role' => $teacher->teacher_role,
            'education' => $teacher->education,
            'subjects' => $teacher->subjects,
            'experience' => $teacher->experience,
            'contact' => $teacher->contact,
            'email' => $teacher->email,
            'cv_path' => $teacher->cv_path,
            'cv_url' => $teacher->cv_path ? Storage::url($teacher->cv_path) : null,
            'notes' => $teacher->notes,
            'admin_note' => $teacher->admin_note,
            'status' => $teacher->status,
            'approved_at' => $teacher->approved_at,
            'approved_by' => $teacher->approved_by,
            'approved_by_name' => $teacher->approver?->name,
            'rejected_at' => $teacher->rejected_at,
            'rejected_by' => $teacher->rejected_by,
            'rejected_by_name' => $teacher->rejector?->name,
            'created_at' => $teacher->created_at,
        ];
    }
}
