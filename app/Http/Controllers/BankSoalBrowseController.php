<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\EducationClass;
use App\Models\EducationLevel;
use App\Models\Subject;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BankSoalBrowseController extends Controller
{
    public function index(): Response
    {
        $levels = EducationLevel::query()->where('is_active', true)
            ->withCount(['bankSoals as bank_soal_count' => fn ($query) => $query->where('bank_soals.is_active', true)->where('bank_soals.classification_status', 'ready')])
            ->orderBy('sort_order')->get();

        return $this->browseResponse('levels', $levels->map(fn (EducationLevel $level) => [
            'id' => $level->id, 'name' => $level->name, 'count' => $level->bank_soal_count, 'url' => route('banksoal.level', $level),
        ])->all());
    }

    public function level(EducationLevel $educationLevel): Response
    {
        abort_unless($educationLevel->is_active, 404);
        $classes = $educationLevel->educationClasses()->where('is_active', true)
            ->withCount(['bankSoals' => fn ($query) => $query->where('is_active', true)->where('classification_status', 'ready')])->get();

        return $this->browseResponse('classes', $classes->map(fn (EducationClass $class) => [
            'id' => $class->id, 'name' => $class->name, 'count' => $class->bank_soals_count, 'url' => route('banksoal.class', [$educationLevel, $class]),
        ])->all(), [['name' => $educationLevel->name, 'url' => null]]);
    }

    public function educationClass(EducationLevel $educationLevel, EducationClass $educationClass): Response
    {
        abort_unless($educationClass->education_level_id === $educationLevel->id && $educationClass->is_active, 404);
        $subjects = Subject::query()->where('is_active', true)
            ->whereHas('educationLevels', fn ($query) => $query->whereKey($educationLevel->id))
            ->whereHas('bankSoals', fn ($query) => $query->where('education_class_id', $educationClass->id)->where('is_active', true)->where('classification_status', 'ready'))
            ->withCount(['bankSoals' => fn ($query) => $query->where('education_class_id', $educationClass->id)->where('is_active', true)->where('classification_status', 'ready')])
            ->orderBy('sort_order')->orderBy('name')->get();

        return $this->browseResponse('subjects', $subjects->map(fn (Subject $subject) => [
            'id' => $subject->id, 'name' => $subject->name, 'count' => $subject->bank_soals_count, 'url' => route('banksoal.subject', [$educationLevel, $educationClass, $subject]),
        ])->all(), [
            ['name' => $educationLevel->name, 'url' => route('banksoal.level', $educationLevel)],
            ['name' => $educationClass->name, 'url' => null],
        ]);
    }

    public function subject(EducationLevel $educationLevel, EducationClass $educationClass, Subject $subject): Response
    {
        BankSoalAccessController::ensureHierarchy($educationLevel, $educationClass, $subject);
        $items = BankSoal::query()->where('education_class_id', $educationClass->id)->where('subject_id', $subject->id)
            ->where('is_active', true)->where('classification_status', 'ready')->latest()->get();

        return $this->browseResponse('bankSoals', $items->map(fn (BankSoal $item) => [
            'id' => $item->id, 'name' => $this->localized($item->name), 'description' => $this->localized($item->description),
            'format' => $item->format, 'questions' => $item->questions,
            'url' => route('banksoal.detail', [$educationLevel, $educationClass, $subject, $item]),
        ])->all(), [
            ['name' => $educationLevel->name, 'url' => route('banksoal.level', $educationLevel)],
            ['name' => $educationClass->name, 'url' => route('banksoal.class', [$educationLevel, $educationClass])],
            ['name' => $subject->name, 'url' => null],
        ]);
    }

    public function detail(EducationLevel $educationLevel, EducationClass $educationClass, Subject $subject, BankSoal $bankSoal): Response
    {
        BankSoalAccessController::ensureHierarchy($educationLevel, $educationClass, $subject, $bankSoal);
        $bankSoal->increment('view_count');
        $unlocked = BankSoalAccessController::hasAccess($bankSoal, request());
        $bankSoal->load('resources');

        return Inertia::render('Public/BankSoal/Detail', [
            'bankSoal' => [
                'id' => $bankSoal->id, 'name' => $this->localized($bankSoal->name), 'description' => $this->localized($bankSoal->description),
                'level' => ['id' => $educationLevel->id, 'name' => $educationLevel->name],
                'class' => ['id' => $educationClass->id, 'name' => $educationClass->name],
                'subject' => ['id' => $subject->id, 'name' => $subject->name],
                'format' => $bankSoal->format, 'questions' => $bankSoal->questions,
                'resources' => $unlocked ? $bankSoal->resources->map(fn ($resource) => [
                    'id' => $resource->id, 'label' => $resource->label ?: 'Sumber soal', 'file_name' => $resource->file_name,
                    'has_file' => filled($resource->file_path), 'has_link' => filled($resource->destination_url),
                    'url' => route('banksoal.download', [$educationLevel, $educationClass, $subject, $bankSoal, $resource]),
                ])->all() : [],
                'unlocked' => $unlocked, 'has_lock' => (bool) BankSoalAccessController::globalPasskey(),
                'passkey_verified' => BankSoalAccessController::hasGlobalAccess(request()),
                'authenticated' => BankSoalAccessController::isAuthenticated(),
                'view_count' => $bankSoal->view_count, 'download_count' => $bankSoal->download_count,
                'image_url' => $bankSoal->image_path ? Storage::url($bankSoal->image_path) : null,
            ],
            'unlockUrl' => route('banksoal.unlock', [$educationLevel, $educationClass, $subject, $bankSoal]),
            'backUrl' => route('banksoal.subject', [$educationLevel, $educationClass, $subject]),
        ]);
    }

    /** @param array<int, array<string, mixed>> $items */
    private function browseResponse(string $stage, array $items, array $breadcrumbs = []): Response
    {
        return Inertia::render('Public/BankSoal', [
            'stage' => $stage, 'items' => $items, 'breadcrumbs' => $breadcrumbs,
            'bankSoalUnlocked' => BankSoalAccessController::hasGlobalAccess(request()),
            'bankSoalAuthenticated' => BankSoalAccessController::isAuthenticated(),
        ]);
    }

    private function localized(mixed $value): string
    {
        return is_array($value) ? (string) ($value['id'] ?? $value['en'] ?? '') : (string) $value;
    }
}
