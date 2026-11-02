<?php

use App\Models\BankSoal;
use App\Models\BankSoalResource;
use App\Models\EducationClass;
use App\Models\EducationLevel;
use App\Models\User;
use Database\Seeders\BankSoalSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function (): void {
    Storage::fake('public');
    Storage::fake('local');
});

it('seeds every class and subject with downloadable example files', function (): void {
    $this->seed(BankSoalSeeder::class);

    expect(EducationLevel::query()->count())->toBe(4)
        ->and(EducationClass::query()->count())->toBe(15)
        ->and(BankSoal::query()->count())->toBe(60)
        ->and(BankSoalResource::query()->count())->toBe(120);

    foreach (BankSoal::with(['educationClass.educationLevel.subjects', 'resources'])->get() as $bankSoal) {
        expect($bankSoal->classification_status)->toBe('ready')
            ->and($bankSoal->is_active)->toBeTrue()
            ->and($bankSoal->educationClass->educationLevel->subjects->contains('id', $bankSoal->subject_id))->toBeTrue();

        foreach ($bankSoal->resources as $resource) {
            Storage::disk('local')->assertExists($resource->file_path);
            expect(Storage::disk('local')->get($resource->file_path))
                ->toBe(file_get_contents(base_path('docs/'.$resource->file_name)));
        }
    }
});

it('can run again without duplicating or overwriting existing material', function (): void {
    $this->seed(BankSoalSeeder::class);
    $bankSoal = BankSoal::query()->firstOrFail();
    $bankSoal->update(['download_count' => 7, 'description' => ['id' => 'Disunting admin']]);
    $custom = BankSoal::factory()->create();

    $this->seed(BankSoalSeeder::class);

    expect(BankSoal::query()->count())->toBe(61)
        ->and(BankSoalResource::query()->count())->toBe(120)
        ->and($bankSoal->fresh()->download_count)->toBe(7)
        ->and($bankSoal->fresh()->description['id'])->toBe('Disunting admin');
    $this->assertModelExists($custom);
});

it('serves seeded attachments through the authenticated download route', function (): void {
    $this->seed(BankSoalSeeder::class);
    $bankSoal = BankSoal::with(['resources', 'educationClass.educationLevel', 'subject'])->firstOrFail();
    $this->actingAs(User::factory()->create());

    foreach ($bankSoal->resources as $resource) {
        $this->get(route('banksoal.download', [
            $bankSoal->educationClass->educationLevel,
            $bankSoal->educationClass,
            $bankSoal->subject,
            $bankSoal,
            $resource,
        ]))->assertSuccessful()->assertDownload($resource->file_name)
            ->assertStreamedContent(file_get_contents(base_path('docs/'.$resource->file_name)));
    }

    expect($bankSoal->fresh()->download_count)->toBe(2);
});
