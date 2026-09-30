<?php

namespace Database\Seeders;

use App\Models\Package;
use App\Models\Program;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProgramPricingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programs = collect([
            'Reguler (Kelompok)' => [
                'slug' => 'reguler-kelompok',
                'level' => 'TK - SMA',
                'description' => 'Bimbingan belajar kelompok dengan maksimal 5 siswa per kelas.',
                'mode' => 'offline',
            ],
            'Privat' => [
                'slug' => 'privat',
                'level' => 'TK - SMA',
                'description' => 'Bimbingan belajar intensif satu guru untuk satu siswa.',
                'mode' => 'offline',
            ],
        ])->mapWithKeys(function (array $defaults, string $name): array {
            $program = Program::query()->firstOrCreate(
                ['name' => $name],
                [...$defaults, 'is_active' => true],
            );

            $missingDefaults = collect($defaults)
                ->filter(fn (mixed $value, string $key): bool => blank($program->getAttribute($key)))
                ->all();

            if ($missingDefaults !== []) {
                $program->update($missingDefaults);
            }

            return [$name => $program];
        });

        $priceRows = [
            'Reguler (Kelompok)' => [
                ['TK', 8, null, 100000, 5],
                ['TK', 12, null, 150000, 5],
                ['SD', 8, null, 150000, 5],
                ['SD', 12, null, 200000, 5],
                ['SMP', 8, null, 200000, 5],
                ['SMP', 12, null, 250000, 5],
                ['SMA', 8, null, 250000, 5],
                ['SMA', 12, null, 300000, 5],
            ],
            'Privat' => [
                ['TK', 8, '2x / minggu', 350000, 1],
                ['TK', 12, '3x / minggu', 450000, 1],
                ['TK', 16, '4x / minggu', 550000, 1],
                ['TK', 20, '5x / minggu', 650000, 1],
                ['TK', 24, '6x / minggu', 750000, 1],
                ['SD', 8, '2x / minggu', 400000, 1],
                ['SD', 12, '3x / minggu', 500000, 1],
                ['SD', 16, '4x / minggu', 600000, 1],
                ['SD', 20, '5x / minggu', 700000, 1],
                ['SD', 24, '6x / minggu', 800000, 1],
                ['SMP', 8, '2x / minggu', 500000, 1],
                ['SMP', 12, '3x / minggu', 600000, 1],
                ['SMP', 16, '4x / minggu', 700000, 1],
                ['SMP', 20, '5x / minggu', 800000, 1],
                ['SMP', 24, '6x / minggu', 900000, 1],
                ['SMA', 8, '2x / minggu', 600000, 1],
                ['SMA', 12, '3x / minggu', 700000, 1],
                ['SMA', 16, '4x / minggu', 800000, 1],
                ['SMA', 20, '5x / minggu', 900000, 1],
                ['SMA', 24, '6x / minggu', 1000000, 1],
            ],
        ];

        foreach ($priceRows as $programName => $rows) {
            $program = $programs->get($programName);

            foreach ($rows as $sortOrder => [$level, $sessions, $intensity, $price, $maxParticipants]) {
                $name = "{$programName} - {$level} - {$sessions} Pertemuan";

                Package::query()->updateOrCreate(
                    [
                        'program_id' => $program->id,
                        'level' => $level,
                        'sessions' => $sessions,
                    ],
                    [
                        'name' => $name,
                        'slug' => Str::slug($name),
                        'intensity' => $intensity,
                        'max_participants' => $maxParticipants,
                        'sort_order' => $sortOrder,
                        'mode' => 'offline',
                        'price' => $price,
                        'duration' => "{$sessions} pertemuan / bulan",
                        'is_active' => true,
                    ],
                );
            }
        }
    }
}
