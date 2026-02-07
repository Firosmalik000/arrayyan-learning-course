<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\Olympiad;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $urls = collect();

        // Static pages
        $urls->push([
            'url' => route('home'),
            'lastmod' => now()->toDateString(),
            'changefreq' => 'weekly',
            'priority' => '1.0',
        ]);

        $urls->push([
            'url' => route('olympiad'),
            'lastmod' => now()->toDateString(),
            'changefreq' => 'weekly',
            'priority' => '0.8',
        ]);

        $urls->push([
            'url' => route('banksoal'),
            'lastmod' => now()->toDateString(),
            'changefreq' => 'weekly',
            'priority' => '0.8',
        ]);

        $urls->push([
            'url' => route('register'),
            'lastmod' => now()->toDateString(),
            'changefreq' => 'monthly',
            'priority' => '0.7',
        ]);

        // Dynamic: Olympiads
        Olympiad::where('is_active', true)->each(function (Olympiad $item) use ($urls) {
            $urls->push([
                'url' => route('olympiad.detail', $item->slug),
                'lastmod' => $item->updated_at->toDateString(),
                'changefreq' => 'weekly',
                'priority' => '0.6',
            ]);
        });

        // Dynamic: Bank Soal
        BankSoal::where('is_active', true)->each(function (BankSoal $item) use ($urls) {
            $urls->push([
                'url' => route('banksoal.detail', $item->slug),
                'lastmod' => $item->updated_at->toDateString(),
                'changefreq' => 'monthly',
                'priority' => '0.6',
            ]);
        });

        $content = view('sitemap', ['urls' => $urls])->render();

        return response($content, 200)
            ->header('Content-Type', 'application/xml');
    }
}
