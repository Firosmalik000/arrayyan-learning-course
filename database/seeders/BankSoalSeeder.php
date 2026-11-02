<?php

namespace Database\Seeders;

use App\Models\BankSoal;
use App\Models\EducationClass;
use App\Models\EducationLevel;
use App\Models\Subject;
use App\Support\EducationCatalog;
use Illuminate\Database\Seeder;
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class BankSoalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $files = [
            'example.png' => 'Contoh lampiran PNG',
            'WhatsApp Image 2026-01-22 at 10.54.18.jpeg' => 'Contoh lampiran JPEG',
        ];
        $resources = [];

        foreach ($files as $fileName => $label) {
            $source = base_path('docs/'.$fileName);
            if (! is_file($source)) {
                throw new RuntimeException('File contoh bank soal tidak ditemukan: '.$source);
            }
        }

        foreach ($files as $fileName => $label) {
            $path = Storage::disk('local')->putFileAs('bank-soal/examples', new File(base_path('docs/'.$fileName)), $fileName);
            if ($path === false) {
                throw new RuntimeException('Gagal menyalin file contoh bank soal: '.$fileName);
            }
            $resources[] = ['label' => $label, 'file_path' => $path, 'file_name' => $fileName];
        }

        $subjects = collect(['Matematika', 'IPA', 'Bahasa Inggris', 'Umum'])
            ->map(fn (string $name): Subject => Subject::query()->firstOrCreate(['name' => $name], ['is_active' => true]));

        foreach (EducationCatalog::options() as $levelOrder => $option) {
            $levelName = $option['value'] === 'TK' ? 'TK / RA' : $option['label'];
            $level = EducationLevel::query()->firstOrCreate(['name' => $levelName], [
                'sort_order' => $levelOrder, 'is_active' => true,
            ]);
            $level->subjects()->syncWithoutDetaching($subjects->pluck('id')->all());

            foreach ($option['grades'] as $classOrder => $grade) {
                $className = match ($grade['value']) {
                    'tk-a' => 'Kelas A',
                    'tk-b' => 'Kelas B',
                    default => $grade['label'],
                };
                $class = $level->educationClasses()->firstOrCreate(['name' => $className], [
                    'sort_order' => $classOrder, 'is_active' => true,
                ]);

                foreach ($subjects as $subject) {
                    $this->seedBankSoal($class, $subject, $option['value'], $resources);
                }
            }
        }
    }

    /**
     * @param  array<int, array{label: string, file_path: string, file_name: string}>  $resources
     */
    private function seedBankSoal(EducationClass $class, Subject $subject, string $level, array $resources): void
    {
        $name = 'Contoh '.$subject->name.' '.$level.' '.$class->name;
        $bankSoal = BankSoal::query()->firstOrCreate([
            'education_class_id' => $class->id,
            'subject_id' => $subject->id,
            'name->id' => $name,
        ], [
            'name' => ['id' => $name, 'en' => $name],
            'classification_status' => 'ready',
            'format' => 'Offline',
            'questions' => 0,
            'description' => [
                'id' => 'Data contoh bank soal. Lampiran PNG/JPEG berasal dari folder docs untuk mencoba unduhan, bukan materi soal asli.',
                'en' => 'Sample question bank. PNG/JPEG attachments from docs demonstrate downloads and do not contain actual exam questions.',
            ],
            'image_path' => null,
            'tone' => 'violet',
            'is_active' => true,
        ]);

        foreach ($resources as $order => $resource) {
            $bankSoal->resources()->firstOrCreate(['file_path' => $resource['file_path']], [
                ...$resource, 'sort_order' => $order,
            ]);
        }
    }
}
