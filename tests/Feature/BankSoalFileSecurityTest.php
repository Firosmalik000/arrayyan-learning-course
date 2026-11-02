<?php

use App\Http\Requests\StoreBankSoalRequest;
use App\Http\Requests\UpdateBankSoalRequest;
use App\Models\BankSoal;
use App\Models\BankSoalResource;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function (): void {
    Storage::fake('public');
    Storage::fake('local');
});

it('only allows web links for destination URLs', function (string $requestClass, string $url, bool $valid): void {
    $rules = (new $requestClass)->rules();
    $validator = Validator::make(['destination_url' => $url], [
        'destination_url' => $rules['resources.*.destination_url'],
    ]);

    expect($validator->passes())->toBe($valid);
})->with([[StoreBankSoalRequest::class], [UpdateBankSoalRequest::class]])->with([
    ['https://example.com/soal', true],
    ['http://example.com/soal', true],
    ['ftp://example.com/soal', false],
    ['javascript:alert(1)', false],
]);

it('moves shared legacy attachments privately and preserves authenticated downloads', function (): void {
    $bankSoal = BankSoal::factory()->create();
    $path = 'bank-soals/files/legacy.pdf';
    Storage::disk('public')->put($path, 'private exam contents');
    $resource = BankSoalResource::factory()->create([
        'bank_soal_id' => $bankSoal->id,
        'file_path' => $path,
        'file_name' => 'legacy.pdf',
    ]);
    BankSoalResource::factory()->create(['file_path' => $path]);

    $this->artisan('bank-soal:secure-files')->assertSuccessful();
    Storage::disk('local')->assertExists($path);
    Storage::disk('public')->assertMissing($path);

    $url = route('banksoal.download', [
        $bankSoal->educationClass->educationLevel,
        $bankSoal->educationClass,
        $bankSoal->subject,
        $bankSoal,
        $resource,
    ]);
    $this->get($url)->assertRedirect();
    $this->actingAs(User::factory()->create())->get($url)
        ->assertSuccessful()->assertDownload('legacy.pdf')->assertStreamedContent('private exam contents');

    $this->artisan('bank-soal:secure-files')->assertSuccessful();
    expect(Storage::disk('local')->get($path))->toBe('private exam contents');
});

it('does not overwrite a conflicting private file or delete the public original', function (): void {
    $path = 'bank-soals/files/conflict.pdf';
    BankSoalResource::factory()->create(['file_path' => $path]);
    Storage::disk('public')->put($path, 'public original');
    Storage::disk('local')->put($path, 'existing private original');

    $this->artisan('bank-soal:secure-files')->assertFailed();
    expect(Storage::disk('public')->get($path))->toBe('public original')
        ->and(Storage::disk('local')->get($path))->toBe('existing private original');
});

it('reports missing files without inventing empty attachments', function (): void {
    BankSoalResource::factory()->create(['file_path' => 'missing.pdf']);

    $this->artisan('bank-soal:secure-files')
        ->expectsOutputToContain('missing source files: 1')->assertSuccessful();
    Storage::disk('local')->assertMissing('missing.pdf');
});

it('does not expose a legacy attachment as a public cover after moving it', function (): void {
    $bankSoal = BankSoal::factory()->create(['image_path' => 'shared.png']);
    BankSoalResource::factory()->create(['bank_soal_id' => $bankSoal->id, 'file_path' => 'shared.png']);
    Storage::disk('public')->put('shared.png', 'sensitive image');

    $this->artisan('bank-soal:secure-files')->assertSuccessful();

    expect($bankSoal->fresh()->image_path)->toBeNull();
    Storage::disk('public')->assertMissing('shared.png');
});
