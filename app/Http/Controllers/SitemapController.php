<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\Olympiad;
use App\Models\Post;
use App\Models\Program;
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

        $urls->push([
            'url' => route('blog'),
            'lastmod' => now()->toDateString(),
            'changefreq' => 'weekly',
            'priority' => '0.7',
        ]);

        $urls->push([
            'url' => route('faq'),
            'lastmod' => now()->toDateString(),
            'changefreq' => 'monthly',
            'priority' => '0.6',
        ]);

        // Dynamic: Olympiads
        Olympiad::where('is_active', true)->whereNotNull('slug')->each(function (Olympiad $item) use ($urls) {
            $urls->push([
                'url' => route('olympiad.detail', $item->slug),
                'lastmod' => $item->updated_at->toDateString(),
                'changefreq' => 'weekly',
                'priority' => '0.6',
            ]);
        });

        // Dynamic: Bank Soal
        BankSoal::query()->with(['educationClass.educationLevel', 'subject'])
            ->where('is_active', true)->where('classification_status', 'ready')->each(function (BankSoal $item) use ($urls) {
                $urls->push([
                    'url' => route('banksoal.detail', [$item->educationClass->educationLevel, $item->educationClass, $item->subject, $item]),
                    'lastmod' => $item->updated_at->toDateString(),
                    'changefreq' => 'monthly',
                    'priority' => '0.6',
                ]);
            });

        // Dynamic: Programs
        Program::where('is_active', true)->each(function (Program $item) use ($urls) {
            $urls->push([
                'url' => route('programs.detail', $item->slug ?: $item->id),
                'lastmod' => $item->updated_at->toDateString(),
                'changefreq' => 'monthly',
                'priority' => '0.6',
            ]);
        });

        // Dynamic: Posts
        Post::where('is_active', true)->each(function (Post $item) use ($urls) {
            $urls->push([
                'url' => route('blog.detail', $item->slug),
                'lastmod' => $item->updated_at->toDateString(),
                'changefreq' => 'weekly',
                'priority' => '0.6',
            ]);
        });

        $content = view('sitemap', ['urls' => $urls])->render();

        return response($content, 200)
            ->header('Content-Type', 'application/xml');
    }
}
