@php
    $seoSettings = \App\Http\Controllers\Admin\SeoController::getPublicSettings();
    $colors = $seoSettings['colors'] ?? [];
    $primaryColor = $colors['primary'] ?? '#7c3aed';
    $secondaryColor = $colors['secondary'] ?? '#f59e0b';
    $accentColor = $colors['accent'] ?? '#10b981';
    $logoUrl = $seoSettings['contact']['logo']['url'] ?? null;
    $faviconUrl = $logoUrl ?: asset('favicon.ico');
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <meta name="theme-color" content="{{ $primaryColor }}">

        @if ($faviconUrl)
            <link rel="icon" href="{{ $faviconUrl }}">
            <link rel="apple-touch-icon" href="{{ $faviconUrl }}">
        @endif

        <style>
            :root {
                --color-primary: {{ $primaryColor }};
                --color-secondary: {{ $secondaryColor }};
                --color-accent: {{ $accentColor }};
            }
        </style>

        @if (app()->environment('local') && file_exists(public_path('hot')))
            @viteReactRefresh
        @endif
        @vite('resources/js/app.jsx')
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
