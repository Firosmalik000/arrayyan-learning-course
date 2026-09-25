<?php

namespace App\Http\Controllers;

use App\Models\Olympiad;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OlympiadCertificateController extends Controller
{
    public function show(Request $request, string $slug): Response
    {
        $olympiad = Olympiad::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $name = trim($data['name'] ?? '');
        $matched = null;

        if ($olympiad && $name !== '') {
            $matched = collect($olympiad->winners ?? [])
                ->first(fn ($winner) => mb_strtolower(trim((string) $winner)) === mb_strtolower($name));
        }

        return Inertia::render('Public/Olympiad/Certificate', [
            'olympiad' => $olympiad ? [
                'name' => $olympiad->name,
                'slug' => $olympiad->slug,
                'level' => $olympiad->level,
                'schedule' => $olympiad->schedule,
            ] : null,
            'name' => $name,
            'matched_name' => $matched,
        ]);
    }
}
