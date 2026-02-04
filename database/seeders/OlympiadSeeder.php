<?php

namespace Database\Seeders;

use App\Models\Olympiad;
use Illuminate\Database\Seeder;

class OlympiadSeeder extends Seeder
{
    public function run(): void
    {
        $olympiads = [
            [
                'name' => 'Olimpiade Sains Nasional',
                'slug' => 'olimpiade-sains-nasional',
                'level' => 'SD - SMA',
                'schedule' => '2026-03-15',
                'selection_system' => 'Seleksi internal ALC + pembinaan',
                'category' => 'free',
                'fee' => 0,
                'notes' => 'Kompetisi sains bergengsi tingkat nasional yang diselenggarakan oleh Kementerian Pendidikan.',
                'is_active' => true,
            ],
            [
                'name' => 'Matematika Islami Challenge',
                'slug' => 'matematika-islami-challenge',
                'level' => 'SD / SMP',
                'schedule' => '2026-05-20',
                'selection_system' => 'Tes kemampuan + mentoring',
                'category' => 'paid',
                'fee' => 150000,
                'notes' => 'Kompetisi matematika dengan nuansa islami yang menggabungkan kemampuan berhitung dengan nilai-nilai keislaman.',
                'is_active' => true,
            ],
            [
                'name' => 'English Creative Olympiad',
                'slug' => 'english-creative-olympiad',
                'level' => 'SMP / SMA',
                'schedule' => '2026-08-10',
                'selection_system' => 'Portofolio + simulasi',
                'category' => 'free',
                'fee' => 0,
                'notes' => 'Kompetisi bahasa Inggris kreatif yang menguji kemampuan writing, speaking, dan creative thinking.',
                'is_active' => true,
            ],
            [
                'name' => 'Kompetisi Matematika Nalaria Realistik',
                'slug' => 'kompetisi-matematika-nalaria-realistik',
                'level' => 'SD / SMP',
                'schedule' => '2026-10-05',
                'selection_system' => 'Tes logika + pembinaan intensif',
                'category' => 'paid',
                'fee' => 175000,
                'notes' => 'Kompetisi matematika yang mengutamakan penalaran logis dan pemecahan masalah realistik.',
                'is_active' => true,
            ],
            [
                'name' => 'Persiapan IMO (International Math Olympiad)',
                'slug' => 'persiapan-imo-international-math-olympiad',
                'level' => 'SMA',
                'schedule' => '2026-07-01',
                'selection_system' => 'Seleksi ketat + pembinaan jangka panjang',
                'category' => 'free',
                'fee' => 0,
                'notes' => 'Program persiapan untuk olimpiade matematika internasional paling prestisius di dunia.',
                'is_active' => true,
            ],
        ];

        foreach ($olympiads as $olympiad) {
            Olympiad::query()->updateOrCreate(
                ['slug' => $olympiad['slug']],
                $olympiad,
            );
        }
    }
}
