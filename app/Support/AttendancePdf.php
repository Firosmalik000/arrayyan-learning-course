<?php

namespace App\Support;

use App\Models\ClassGroup;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class AttendancePdf
{
    public function render(ClassGroup $classGroup, string $month, string $search = ''): string
    {
        $classGroup->loadMissing(['teacher', 'program', 'schedules']);
        $members = $classGroup->activeMembers()->with('student')->get()
            ->filter(fn ($member) => $search === ''
                || str_contains(mb_strtolower($member->student?->name ?? '-'), mb_strtolower($search))
                || str_contains(mb_strtolower($member->student?->school_name ?? ''), mb_strtolower($search)))
            ->values();
        $start = Carbon::createFromFormat('!Y-m', $month);
        $attendances = $classGroup->attendances()
            ->whereDate('date', '>=', $start->toDateString())
            ->whereDate('date', '<=', $start->copy()->endOfMonth()->toDateString())
            ->orderBy('date')->orderBy('id')->get();
        $dates = $attendances->map(fn ($attendance) => $attendance->date->toDateString())->unique()->values()->all();

        if ($dates === []) {
            $scheduledDays = $classGroup->schedules->pluck('day_of_week')->map(fn ($day) => (int) $day)->all();
            for ($day = $start->copy(); $day->format('Y-m') === $month; $day->addDay()) {
                if (in_array($day->dayOfWeekIso, $scheduledDays, true)) {
                    $dates[] = $day->toDateString();
                }
            }
        }

        $matrix = [];
        foreach ($attendances as $attendance) {
            $matrix[$attendance->student_id][$attendance->date->toDateString()] = $attendance->status;
        }

        $counts = ['hadir' => 0, 'izin' => 0, 'sakit' => 0, 'alpa' => 0];
        foreach ($members as $member) {
            foreach ($matrix[$member->student_id] ?? [] as $status) {
                if (array_key_exists($status, $counts)) {
                    $counts[$status]++;
                }
            }
        }
        $total = array_sum($counts);
        $summary = [
            'MURID DALAM LAPORAN' => (string) $members->count(),
            'TANGGAL PERTEMUAN' => (string) count($dates),
            'TINGKAT KEHADIRAN' => ($total > 0 ? (string) round($counts['hadir'] / $total * 100) : '0').'%',
            'CATATAN TERISI' => (string) $total,
        ];

        $pages = [];
        $dateChunks = array_chunk($dates, 16) ?: [[]];
        foreach ($dateChunks as $chunkIndex => $chunk) {
            $page = $this->header($classGroup, $start, $search, $chunk, $chunkIndex, count($dateChunks), $summary);
            $y = 354;
            foreach ($members as $index => $member) {
                $nameLines = explode("\n", wordwrap($this->encode($member->student?->name ?? '-'), 22, "\n", true));
                $height = max(28, count($nameLines) * 12 + 10);
                if ($y - $height < 60) {
                    $pages[] = $page;
                    $page = $this->header($classGroup, $start, $search, $chunk, $chunkIndex, count($dateChunks), $summary);
                    $y = 354;
                }

                $records = $matrix[$member->student_id] ?? [];
                $counts = array_count_values($records);
                $total = array_sum(array_intersect_key($counts, array_flip(['hadir', 'izin', 'sakit', 'alpa'])));
                $values = [(string) ($index + 1), implode("\n", $nameLines)];
                foreach ($chunk as $date) {
                    $values[] = match ($records[$date] ?? '') {
                        'hadir' => 'H', 'izin' => 'I', 'sakit' => 'S', 'alpa' => 'A', default => '-',
                    };
                }
                foreach (['hadir', 'izin', 'sakit', 'alpa'] as $status) {
                    $values[] = (string) ($counts[$status] ?? 0);
                }
                $values[] = ($total > 0 ? (string) round(($counts['hadir'] ?? 0) / $total * 100) : '0').'%';
                $page .= $this->row($values, count($chunk), $y, $height, alternate: $index % 2 === 1);
                $y -= $height;
            }
            if ($members->isEmpty()) {
                $page .= $this->text('Tidak ada murid sesuai filter.', 48, 330);
            }
            $pages[] = $page;
        }

        foreach ($pages as $index => &$page) {
            $page .= "0.84 0.87 0.91 RG 0.5 w 36 51 m 806 51 l S\n";
            $page .= $this->text('H: Hadir   I: Izin   S: Sakit   A: Alpa   -: Belum absen', 36, 36, color: '0.38 0.43 0.51');
            $page .= $this->text('Halaman '.($index + 1).' / '.count($pages), 732, 36, bold: true);
            $page .= $this->text('Rekap bulanan sesuai filter | Persentase dihitung dari catatan H/I/S/A.', 36, 22, 7, color: '0.45 0.5 0.57');
        }
        unset($page);

        return $this->document($pages);
    }

    /**
     * @param  list<string>  $dates
     * @param  array<string, string>  $summary
     */
    private function header(ClassGroup $classGroup, Carbon $month, string $search, array $dates, int $chunkIndex, int $chunks, array $summary): string
    {
        $page = "0.19 0.16 0.38 rg 0 585 842 10 re f\n";
        $page .= $this->text('AR RAYYAN LEARNING COURSE', 36, 552, 10, true, '0.36 0.3 0.58');
        $page .= $this->text('REKAP ABSENSI BULANAN', 36, 521, 23, true);
        $page .= $this->text($month->locale('id')->translatedFormat('F Y'), 635, 548, 15, true);
        $page .= $this->text('AKADEMIK / '.str_pad((string) $classGroup->id, 4, '0', STR_PAD_LEFT).' / '.$month->format('Ym'), 635, 530, 8, color: '0.45 0.5 0.57');
        $details = [
            'Kelas: '.$classGroup->name.' | Program: '.($classGroup->program?->name ?? '-'),
            'Pengajar: '.($classGroup->teacher?->name ?? '-').' | Bulan: '.$month->locale('id')->translatedFormat('F Y'),
            'Pencarian: '.($search === '' ? 'Semua murid aktif' : $search),
        ];
        foreach ($details as $index => $detail) {
            $page .= $this->text(Str::limit($detail, 145), 36, 496 - $index * 15, 9, color: '0.38 0.43 0.51');
        }
        $cardX = 36;
        foreach ($summary as $label => $value) {
            $page .= "0.96 0.96 0.98 rg {$cardX} 400 185 49 re f\n";
            $page .= $this->text($label, $cardX + 12, 434, 7, true, '0.45 0.5 0.57');
            $page .= $this->text($value, $cardX + 12, 412, 19, true, '0.25 0.2 0.45');
            $cardX += 195;
        }
        $page .= $this->text('DETAIL KEHADIRAN MURID', 36, 384, 8, true);
        $page .= $this->text($chunks > 1 ? 'Bagian tanggal '.($chunkIndex + 1)." / {$chunks} | Rekap H/I/S/A: satu bulan" : 'Periode bulanan | Rekap H/I/S/A', 552, 384, 8, color: '0.45 0.5 0.57');

        $labels = ['No', 'Nama Murid'];
        foreach ($dates as $date) {
            $labels[] = substr($date, 8, 2).'/'.substr($date, 5, 2);
        }

        return $page.$this->row([...$labels, 'H', 'I', 'S', 'A', '%'], count($dates), 374, 20, true);
    }

    /** @param list<string> $values */
    private function row(array $values, int $dateCount, int $y, int $height, bool $heading = false, bool $alternate = false): string
    {
        $widths = [24, 180, ...array_fill(0, $dateCount, 26), 30, 30, 30, 30, 30];
        $x = 36;
        $output = '';
        foreach ($values as $index => $value) {
            $width = $widths[$index];
            $fill = $heading ? '0.19 0.21 0.31' : ($alternate ? '0.97 0.98 0.99' : '1 1 1');
            $output .= "{$fill} rg {$x} ".($y - $height)." {$width} {$height} re f\n";
            $output .= "0.87 0.89 0.92 RG 0.35 w {$x} ".($y - $height)." {$width} {$height} re S\n";
            foreach (explode("\n", $value) as $lineIndex => $line) {
                $size = $index >= 2 && $index < $dateCount + 2 ? 7 : 8;
                $textX = $index === 1 ? $x + 8 : $x + max(3, (int) (($width - strlen($line) * $size * 0.55) / 2));
                $color = $heading ? '1 1 1' : '0.18 0.22 0.3';
                if (! $heading && $index >= 2 && $index < $dateCount + 2) {
                    $color = match ($line) {
                        'H' => '0.06 0.45 0.32', 'I' => '0.62 0.38 0.08',
                        'S' => '0.1 0.36 0.64', 'A' => '0.7 0.19 0.23', default => '0.65 0.69 0.74',
                    };
                }
                $output .= $this->text($line, $textX, $y - 14 - $lineIndex * 12, $size, $heading || $index > 0, $color);
            }
            $x += $width;
        }

        return $output;
    }

    private function encode(string $text): string
    {
        return iconv('UTF-8', 'Windows-1252//TRANSLIT//IGNORE', str_replace(["\r", "\n", "\t"], ' ', $text));
    }

    private function text(string $text, int $x, int $y, int $size = 8, bool $bold = false, string $color = '0.12 0.16 0.24'): string
    {
        $encoded = mb_check_encoding($text, 'UTF-8') ? $this->encode($text) : $text;
        $escaped = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $encoded);

        $font = $bold ? 'F2' : 'F1';

        return "{$color} rg BT /{$font} {$size} Tf {$x} {$y} Td ({$escaped}) Tj ET\n";
    }

    /** @param list<string> $pages */
    private function document(array $pages): string
    {
        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
        ];
        $kids = [];
        foreach ($pages as $page) {
            $pageId = count($objects) + 1;
            $streamId = $pageId + 1;
            $kids[] = "{$pageId} 0 R";
            $objects[] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {$streamId} 0 R >>";
            $objects[] = '<< /Length '.strlen($page)." >>\nstream\n{$page}endstream";
        }
        $objects[1] = '<< /Type /Pages /Count '.count($pages).' /Kids ['.implode(' ', $kids).'] >>';
        $pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
        $offsets = [0];
        foreach ($objects as $index => $object) {
            $offsets[] = strlen($pdf);
            $pdf .= ($index + 1)." 0 obj\n{$object}\nendobj\n";
        }
        $xref = strlen($pdf);
        $pdf .= 'xref'."\n0 ".count($offsets)."\n0000000000 65535 f \n";
        foreach (array_slice($offsets, 1) as $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }

        return $pdf.'trailer << /Size '.count($offsets)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF\n";
    }
}
