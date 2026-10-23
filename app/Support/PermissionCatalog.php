<?php

namespace App\Support;

class PermissionCatalog
{
    public const GUARD = 'admin';

    public const ACTIONS = [
        'view',
        'create',
        'edit',
        'delete',
        'approve',
        'reject',
        'import',
        'export',
    ];

    public const MENUS = [
        [
            'id' => 'dashboard',
            'label' => 'Dashboard',
            'description' => 'Ringkasan data admin.',
            'section' => 'Core',
        ],
        [
            'id' => 'landing',
            'label' => 'Landing Page',
            'description' => 'Hero, copy, dan CTA.',
            'section' => 'Content',
        ],
        [
            'id' => 'konten',
            'label' => 'Konten',
            'description' => 'Blog, testimoni, FAQ, dan revisi.',
            'section' => 'Content',
        ],
        [
            'id' => 'program',
            'label' => 'Program',
            'description' => 'Data program belajar.',
            'section' => 'Master Data',
        ],
        [
            'id' => 'bank-soal',
            'label' => 'Bank Soal',
            'description' => 'Soal dan arsip.',
            'section' => 'Master Data',
        ],
        [
            'id' => 'olimpiade',
            'label' => 'Olimpiade',
            'description' => 'Event dan jadwal.',
            'section' => 'Master Data',
        ],
        [
            'id' => 'pendaftaran',
            'label' => 'Pendaftaran',
            'description' => 'Pendaftar masuk.',
            'section' => 'Master Data',
        ],
        [
            'id' => 'keuangan',
            'label' => 'Keuangan',
            'description' => 'Tagihan dan verifikasi pembayaran.',
            'section' => 'Master Data',
        ],
        [
            'id' => 'akademik',
            'label' => 'Akademik',
            'description' => 'Kelas, jadwal, absensi, dan nilai.',
            'section' => 'Akademik',
        ],
        [
            'id' => 'pelajar',
            'label' => 'Pelajar',
            'description' => 'Data siswa aktif.',
            'section' => 'Master Data',
        ],
        [
            'id' => 'pengajar',
            'label' => 'Pengajar',
            'description' => 'Data pengajar.',
            'section' => 'Master Data',
        ],
        [
            'id' => 'kritik-saran',
            'label' => 'Kritik & Saran',
            'description' => 'Evaluasi masukan dari orang tua.',
            'section' => 'Master Data',
        ],
        [
            'id' => 'akses-menu',
            'label' => 'Akses Menu',
            'description' => 'Pengaturan akses role.',
            'section' => 'Administrator',
        ],
        [
            'id' => 'roles',
            'label' => 'Role',
            'description' => 'Kelompok role admin.',
            'section' => 'Administrator',
        ],
        [
            'id' => 'users',
            'label' => 'User',
            'description' => 'Akun administrator.',
            'section' => 'Administrator',
        ],
        [
            'id' => 'seo',
            'label' => 'SEO',
            'description' => 'Pengaturan SEO website.',
            'section' => 'Content',
        ],
    ];

    public static function permissionNames(): array
    {
        return collect(self::MENUS)
            ->flatMap(fn (array $menu) => collect(self::ACTIONS)->map(
                fn (string $action) => self::buildPermissionName($menu['id'], $action)
            ))
            ->values()
            ->all();
    }

    public static function buildPermissionName(string $menuId, string $action): string
    {
        return $menuId.'.'.$action;
    }

    public static function menuSections(): array
    {
        return collect(self::MENUS)
            ->groupBy('section')
            ->map(function ($items, $section) {
                $items = $items->map(fn (array $menu) => [
                    'id' => $menu['id'],
                    'label' => $menu['label'],
                    'description' => $menu['description'],
                ])->values()->all();

                return [
                    'title' => $section,
                    'description' => self::sectionDescriptions()[$section] ?? '',
                    'items' => $items,
                ];
            })
            ->values()
            ->all();
    }

    public static function actions(): array
    {
        return collect(self::ACTIONS)
            ->map(fn (string $action) => ['key' => $action, 'label' => ucfirst($action)])
            ->values()
            ->all();
    }

    private static function sectionDescriptions(): array
    {
        return [
            'Core' => 'Navigasi utama admin.',
            'Content' => 'Konten publik dan landing.',
            'Master Data' => 'Pengelolaan data akademik.',
            'Akademik' => 'Operasional belajar harian.',
            'Administrator' => 'Manajemen role dan akses.',
            'System' => 'Pengaturan dan konfigurasi.',
        ];
    }
}
