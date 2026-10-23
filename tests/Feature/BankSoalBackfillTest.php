<?php

namespace Tests\Feature;

use App\Models\BankSoal;
use App\Models\EducationLevel;
use App\Models\Subject;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BankSoalBackfillTest extends TestCase
{
    use RefreshDatabase;

    public function test_corrective_backfill_splits_a_legacy_class_range_into_one_bank_soal_per_class(): void
    {
        $level = EducationLevel::query()->where('name', 'SD / MI')->firstOrFail();
        $subject = Subject::query()->firstOrCreate(['name' => 'Matematika']);
        $level->subjects()->attach($subject);
        $bankSoal = BankSoal::query()->create([
            'education_class_id' => null,
            'subject_id' => $subject->id,
            'classification_status' => 'needs_review',
            'name' => ['id' => 'Matematika SD - Paket 1', 'en' => 'Elementary Math - Package 1'],
            'description' => ['id' => 'Latihan untuk siswa SD kelas 1-3.', 'en' => 'Practice for elementary grade 1-3.'],
            'format' => 'PDF',
            'questions' => 120,
            'is_active' => true,
        ]);
        $bankSoal->resources()->create([
            'label' => 'PDF Soal',
            'file_path' => 'bank-soals/files/matematika.pdf',
            'file_name' => 'matematika.pdf',
        ]);

        $migration = require database_path('migrations/2026_10_22_041009_repair_bank_soal_education_backfill.php');
        $migration->up();

        $backfilled = BankSoal::query()
            ->with(['educationClass', 'resources'])
            ->where('subject_id', $subject->id)
            ->orderBy('education_class_id')
            ->get();
        $resources = $backfilled->flatMap->resources;

        $this->assertCount(3, $backfilled);
        $this->assertSame(['Kelas 1', 'Kelas 2', 'Kelas 3'], $backfilled->pluck('educationClass.name')->sort()->values()->all());
        $this->assertSame(['ready'], $backfilled->pluck('classification_status')->unique()->values()->all());
        $this->assertCount(3, $resources);
        $this->assertSame(['bank-soals/files/matematika.pdf'], $resources->pluck('file_path')->unique()->values()->all());
    }

    public function test_subject_normalization_uses_academic_subjects_instead_of_legacy_content_categories(): void
    {
        $sd = EducationLevel::query()->where('name', 'SD / MI')->firstOrFail();
        $sma = EducationLevel::query()->where('name', 'SMA / MA')->firstOrFail();
        $sdClass = $sd->educationClasses()->where('name', 'Kelas 1')->firstOrFail();
        $smaClass = $sma->educationClasses()->where('name', 'Kelas 10')->firstOrFail();
        $olympiad = Subject::factory()->create(['name' => 'Olimpiade']);
        $sd->subjects()->attach($olympiad);
        $sma->subjects()->attach($olympiad);

        $math = BankSoal::factory()->create([
            'education_class_id' => $sdClass->id,
            'subject_id' => $olympiad->id,
            'name' => ['id' => 'Matematika Olimpiade SD', 'en' => 'Elementary Math Olympiad'],
        ]);
        $science = BankSoal::factory()->create([
            'education_class_id' => $smaClass->id,
            'subject_id' => $olympiad->id,
            'name' => ['id' => 'Try Out Olimpiade IPA', 'en' => 'Science Olympiad Try Out'],
        ]);

        $migration = require database_path('migrations/2026_10_22_164428_normalize_legacy_bank_soal_subjects.php');
        $migration->up();

        $this->assertSame('Matematika', $math->refresh()->subject->name);
        $this->assertSame('IPA', $science->refresh()->subject->name);
        $this->assertDatabaseHas('subjects', ['id' => $olympiad->id, 'is_active' => false]);
        $this->assertTrue($sd->subjects()->where('name', 'Matematika')->exists());
        $this->assertTrue($sma->subjects()->where('name', 'IPA')->exists());
    }
}
