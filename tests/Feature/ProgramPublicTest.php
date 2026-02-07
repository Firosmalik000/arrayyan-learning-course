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
}
