<?php

namespace App\Support;

final class EducationCatalog
{
    /**
     * @var array<string, array{label: string, label_en: string, grades: array<string, string>}>
     */
    private const OPTIONS = [
        'TK' => [
            'label' => 'PAUD / TK',
            'label_en' => 'Preschool / Kindergarten',
            'grades' => [
                'pra-tk' => 'Pra-TK',
                'tk-a' => 'TK A',
                'tk-b' => 'TK B',
            ],
        ],
        'SD' => [
            'label' => 'SD / MI',
            'label_en' => 'Elementary School',
            'grades' => [
                '1' => 'Kelas 1',
                '2' => 'Kelas 2',
                '3' => 'Kelas 3',
                '4' => 'Kelas 4',
                '5' => 'Kelas 5',
                '6' => 'Kelas 6',
            ],
        ],
        'SMP' => [
            'label' => 'SMP / MTs',
            'label_en' => 'Junior High School',
            'grades' => [
                '7' => 'Kelas 7',
                '8' => 'Kelas 8',
                '9' => 'Kelas 9',
            ],
        ],
        'SMA' => [
            'label' => 'SMA / MA',
            'label_en' => 'Senior High School',
            'grades' => [
                '10' => 'Kelas 10',
                '11' => 'Kelas 11',
                '12' => 'Kelas 12',
            ],
        ],
    ];

    /**
     * @return array<int, string>
     */
    public static function levels(): array
    {
        return array_keys(self::OPTIONS);
    }

    /**
     * @return array<int, string>
     */
    public static function grades(): array
    {
        return collect(self::OPTIONS)
            ->flatMap(fn (array $option): array => array_map('strval', array_keys($option['grades'])))
            ->values()
            ->all();
    }

    /**
     * @param  array<int, string>  $levels
     * @return array<int, string>
     */
    public static function gradesFor(array $levels): array
    {
        return collect($levels)
            ->filter(fn (string $level): bool => isset(self::OPTIONS[$level]))
            ->flatMap(fn (string $level): array => array_map('strval', array_keys(self::OPTIONS[$level]['grades'])))
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{value: string, label: string, label_en: string, grades: array<int, array{value: string, label: string}>}>
     */
    public static function options(): array
    {
        return collect(self::OPTIONS)
            ->map(fn (array $option, string $level): array => [
                'value' => $level,
                'label' => $option['label'],
                'label_en' => $option['label_en'],
                'grades' => collect($option['grades'])
                    ->map(fn (string $label, string|int $value): array => [
                        'value' => (string) $value,
                        'label' => $label,
                    ])
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array<int, string>  $levels
     */
    public static function summarize(array $levels): string
    {
        $validLevels = array_values(array_intersect(self::levels(), $levels));

        return implode(' / ', $validLevels);
    }

    /**
     * @param  array<int, string>  $levels
     * @return array{id: string, en: string}
     */
    public static function localizedSummary(array $levels): array
    {
        $validLevels = array_values(array_intersect(self::levels(), $levels));

        return [
            'id' => collect($validLevels)->map(fn (string $level): string => self::OPTIONS[$level]['label'])->implode(' / '),
            'en' => collect($validLevels)->map(fn (string $level): string => self::OPTIONS[$level]['label_en'])->implode(' / '),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function extractLevels(mixed $value): array
    {
        if (is_array($value)) {
            if (array_is_list($value)) {
                return array_values(array_intersect(self::levels(), $value));
            }

            $value = self::searchableText($value);
        }

        $label = strtoupper((string) $value);
        $levels = [];

        if (str_contains($label, 'PRA TK') || preg_match('/\bTK\b/', $label)) {
            $levels[] = 'TK';
        }
        if (preg_match('/\b(SD|MI|ELEMENTARY)\b/', $label)) {
            $levels[] = 'SD';
        }
        if (preg_match('/\b(SMP|MTS|JUNIOR HIGH)\b/', $label)) {
            $levels[] = 'SMP';
        }
        if (preg_match('/\b(SMA|MA|SENIOR HIGH)\b/', $label)) {
            $levels[] = 'SMA';
        }

        return array_values(array_unique($levels));
    }

    /**
     * @return array<int, string>
     */
    public static function extractGrades(mixed $value): array
    {
        $label = self::searchableText($value);
        $grades = [];

        preg_match_all(
            '/\b(?:KELAS|CLASS|GRADE)\s*(\d{1,2})(?:\s*(?:-|–|—|SAMPAI|TO)\s*(\d{1,2}))?/iu',
            $label,
            $matches,
            PREG_SET_ORDER,
        );

        foreach ($matches as $match) {
            $start = (int) $match[1];
            $end = isset($match[2]) && $match[2] !== '' ? (int) $match[2] : $start;

            if ($start > $end || $start < 1 || $end > 12) {
                continue;
            }

            foreach (range($start, $end) as $grade) {
                $grades[] = (string) $grade;
            }
        }

        preg_match_all('/\b(?:KELAS|CLASS|GRADE)\s*(XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)\b/iu', $label, $romanMatches);
        $romanGrades = [
            'I' => '1', 'II' => '2', 'III' => '3', 'IV' => '4', 'V' => '5', 'VI' => '6',
            'VII' => '7', 'VIII' => '8', 'IX' => '9', 'X' => '10', 'XI' => '11', 'XII' => '12',
        ];

        foreach ($romanMatches[1] ?? [] as $romanGrade) {
            $grades[] = $romanGrades[strtoupper($romanGrade)];
        }

        if (preg_match('/\bPRA[\s-]?TK\b/iu', $label)) {
            $grades[] = 'pra-tk';
        }
        if (preg_match('/\bTK\s*A\b/iu', $label)) {
            $grades[] = 'tk-a';
        }
        if (preg_match('/\bTK\s*B\b/iu', $label)) {
            $grades[] = 'tk-b';
        }

        return array_values(array_unique($grades));
    }

    /**
     * @return array{education_levels: array<int, string>, grades: array<int, string>}
     */
    public static function resolveTargets(mixed $name, mixed $legacyLevel = null): array
    {
        $levels = self::extractLevels(self::searchableText($name));
        $grades = self::extractGrades($name);

        if ($levels === []) {
            $levels = collect($grades)
                ->map(fn (string $grade): ?string => self::levelForGrade($grade))
                ->filter()
                ->unique()
                ->values()
                ->all();
        }

        if ($levels === []) {
            $levels = self::extractLevels($legacyLevel);
        }

        $grades = array_values(array_intersect(self::gradesFor($levels), $grades));

        return [
            'education_levels' => $levels,
            'grades' => $grades,
        ];
    }

    private static function levelForGrade(string $grade): ?string
    {
        if (in_array($grade, ['pra-tk', 'tk-a', 'tk-b'], true)) {
            return 'TK';
        }

        $gradeNumber = filter_var($grade, FILTER_VALIDATE_INT);

        return match (true) {
            $gradeNumber >= 1 && $gradeNumber <= 6 => 'SD',
            $gradeNumber >= 7 && $gradeNumber <= 9 => 'SMP',
            $gradeNumber >= 10 && $gradeNumber <= 12 => 'SMA',
            default => null,
        };
    }

    private static function searchableText(mixed $value): string
    {
        if (! is_array($value)) {
            return strtoupper((string) $value);
        }

        return strtoupper(collect($value)
            ->flatten()
            ->filter(fn (mixed $part): bool => is_scalar($part))
            ->map(fn (mixed $part): string => (string) $part)
            ->implode(' '));
    }
}
