<?php

namespace Tests\Feature;

use App\Models\Program;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramPublicTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_program_page_shows_active_programs(): void
    {
        Program::create([
            'name' => 'Reguler',
            'level' => 'SMP',
            'description' => 'Program kelompok',
            'subjects' => ['Interaktif', 'Terarah'],
            'mode' => 'offline',
            'is_active' => true,
        ]);

        Program::create([
            'name' => 'Nonaktif',
            'level' => 'SD',
            'is_active' => false,
        ]);

        $response = $this->get(route('programs'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Program', false)
            ->has('programs', 1)
            ->where('programs.0.name', 'Reguler')
        );
    }

    public function test_public_program_detail_shows_program(): void
    {
        $program = Program::create([
            'name' => 'Privat',
            'level' => 'SMA',
            'description' => 'Program privat',
            'subjects' => ['Fokus', 'Fleksibel'],
            'mode' => 'online',
            'is_active' => true,
        ]);

        $response = $this->get(route('programs.detail', $program->id));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Program/Detail', false)
            ->where('program.id', $program->id)
            ->where('program.name', 'Privat')
        );
    }

    public function test_public_program_page_uses_lowest_price_from_packages_and_base_price(): void
    {
        $program1 = Program::create([
            'name' => 'Paket Mandiri',
            'slug' => 'paket-mandiri',
            'level' => 'SD',
            'price' => 500000,
            'is_active' => true,
        ]);

        $program1->packages()->createMany([
            ['name' => 'Intensif', 'slug' => 'intensif-1', 'level' => 'SD', 'price' => 1200000, 'is_active' => true],
            ['name' => 'Reguler', 'slug' => 'reguler-1', 'level' => 'SD', 'price' => 350000, 'is_active' => true],
            ['name' => 'Hemat', 'slug' => 'hemat-1', 'level' => 'SD', 'price' => 80000, 'is_active' => true],
        ]);

        $program2 = Program::create([
            'name' => 'Paket Hemat Base',
            'slug' => 'paket-hemat-base',
            'level' => 'SMP',
            'price' => 50000,
            'is_active' => true,
        ]);

        $program2->packages()->create([
            'name' => 'Paket SMP A',
            'slug' => 'paket-smp-a',
            'level' => 'SMP',
            'price' => 150000,
            'is_active' => true,
        ]);

        $response = $this->get(route('programs'));

        $response->assertSuccessful();
        $response->assertInertia(function ($page) {
            $page->component('Public/Program', false)
                ->has('programs', 2);

            $programs = collect($page->toArray()['props']['programs']);
            $mandiri = $programs->firstWhere('name', 'Paket Mandiri');
            $hemat = $programs->firstWhere('name', 'Paket Hemat Base');

            $this->assertSame('80000.00', $mandiri['price']);
            $this->assertSame('50000.00', $hemat['price']);
        });
    }
}
