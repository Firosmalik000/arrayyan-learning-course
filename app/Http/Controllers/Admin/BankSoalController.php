<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBankSoalRequest;
use App\Http\Requests\UpdateBankSoalPasskeyRequest;
use App\Http\Requests\UpdateBankSoalRequest;
use App\Models\ActivityLog;
use App\Models\BankSoal;
use App\Models\BankSoalResource;
use App\Models\PageContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BankSoalController extends Controller
{
    public function updateGlobalPasskey(UpdateBankSoalPasskeyRequest $request): RedirectResponse
    {
        $pageContent = PageContent::query()->firstOrNew(['slug' => 'bank-soal']);
        $content = is_array($pageContent->content) ? $pageContent->content : [];
        $content['bankSoalPasskey'] = trim((string) ($request->validated('passkey') ?? ''));
        $pageContent->content = $content;
        $pageContent->save();
        Cache::forget('landing-content');
        ActivityLog::record('bank-soal.passkey.ubah', filled($content['bankSoalPasskey']) ? 'Passkey global Bank Soal diperbarui.' : 'Passkey global Bank Soal dinonaktifkan.');

        return back()->with('success', 'Passkey global Bank Soal berhasil disimpan.');
    }

    public function store(StoreBankSoalRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $storedPaths = [];
        try {
            DB::transaction(function () use ($request, $data, &$storedPaths): void {
                $bankSoal = BankSoal::query()->create($this->bankSoalPayload($request, $data));
                $this->createResources($bankSoal, $data['resources'], $storedPaths);
            });
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($storedPaths);
            throw $exception;
        }

        return back()->with('success', 'Bank soal berhasil ditambahkan.');
    }

    public function update(UpdateBankSoalRequest $request, BankSoal $bankSoal): RedirectResponse
    {
        $data = $request->validated();
        $storedPaths = [];
        $pathsToDelete = [];
        try {
            DB::transaction(function () use ($request, $data, $bankSoal, &$storedPaths, &$pathsToDelete): void {
                $bankSoal->update($this->bankSoalPayload($request, $data, $bankSoal));
                $existing = $bankSoal->resources()->get()->keyBy('id');
                $retainedIds = [];
                foreach ($data['resources'] as $index => $resourceData) {
                    $resource = isset($resourceData['id']) ? $existing->get((int) $resourceData['id']) : null;
                    abort_if(isset($resourceData['id']) && ! $resource, 422, 'Resource tidak termasuk bank soal ini.');
                    $resource ??= new BankSoalResource(['bank_soal_id' => $bankSoal->id]);
                    $payload = $this->resourcePayload($resourceData, $index);
                    $file = Arr::get($resourceData, 'file');
                    if ($file instanceof UploadedFile) {
                        if ($resource->file_path) {
                            $pathsToDelete[] = $resource->file_path;
                        }
                        $payload['file_path'] = $file->store('bank-soals/files', 'public');
                        $payload['file_name'] = $file->getClientOriginalName();
                        $storedPaths[] = $payload['file_path'];
                    }
                    $resource->fill($payload);
                    $resource->bank_soal_id = $bankSoal->id;
                    $resource->save();
                    $retainedIds[] = $resource->id;
                }
                $removed = $existing->except($retainedIds);
                $pathsToDelete = array_merge($pathsToDelete, $removed->pluck('file_path')->filter()->all());
                BankSoalResource::query()->whereIn('id', $removed->keys())->delete();
            });
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($storedPaths);
            throw $exception;
        }
        $this->deleteUnreferencedResourceFiles($pathsToDelete);

        return back()->with('success', 'Bank soal berhasil diperbarui.');
    }

    public function destroy(BankSoal $bankSoal): RedirectResponse
    {
        $paths = $bankSoal->resources()->pluck('file_path')->filter()->all();
        $imagePath = $bankSoal->image_path;
        $bankSoal->delete();
        $this->deleteUnreferencedResourceFiles($paths);

        if ($imagePath && ! BankSoal::query()->where('image_path', $imagePath)->exists()) {
            Storage::disk('public')->delete($imagePath);
        }

        return back()->with('success', 'Bank soal berhasil dihapus.');
    }

    /** @param array<string, mixed> $data */
    private function bankSoalPayload(StoreBankSoalRequest|UpdateBankSoalRequest $request, array $data, ?BankSoal $existing = null): array
    {
        $payload = [
            'education_class_id' => $data['education_class_id'],
            'subject_id' => $data['subject_id'],
            'classification_status' => 'ready',
            'name' => ['id' => $data['name'], 'en' => $data['name']],
            'format' => $data['format'],
            'questions' => $data['questions'] ?? 0,
            'description' => ['id' => $data['description'] ?? '', 'en' => $data['description'] ?? ''],
            'is_active' => filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
        ];
        if ($request->hasFile('image')) {
            $payload['image_path'] = $request->file('image')->store('bank-soals', 'public');
            if ($existing?->image_path && ! BankSoal::query()
                ->where('id', '!=', $existing->id)
                ->where('image_path', $existing->image_path)
                ->exists()) {
                Storage::disk('public')->delete($existing->image_path);
            }
        }

        return $payload;
    }

    /** @param array<int, array<string, mixed>> $resources */
    private function createResources(BankSoal $bankSoal, array $resources, array &$storedPaths): void
    {
        foreach ($resources as $index => $resourceData) {
            $payload = $this->resourcePayload($resourceData, $index);
            $file = Arr::get($resourceData, 'file');
            if ($file instanceof UploadedFile) {
                $payload['file_path'] = $file->store('bank-soals/files', 'public');
                $payload['file_name'] = $file->getClientOriginalName();
                $storedPaths[] = $payload['file_path'];
            }
            $bankSoal->resources()->create($payload);
        }
    }

    /** @param array<string, mixed> $resource */
    private function resourcePayload(array $resource, int $index): array
    {
        return [
            'label' => $resource['label'] ?? null,
            'destination_url' => $resource['destination_url'] ?? null,
            'sort_order' => ($index + 1) * 10,
        ];
    }

    /** @param array<int, string> $paths */
    private function deleteUnreferencedResourceFiles(array $paths): void
    {
        $unreferencedPaths = collect($paths)
            ->filter()
            ->unique()
            ->reject(fn (string $path): bool => BankSoalResource::query()->where('file_path', $path)->exists())
            ->values()
            ->all();

        Storage::disk('public')->delete($unreferencedPaths);
    }
}
