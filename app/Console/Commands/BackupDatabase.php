<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class BackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:backup-database {--keep=7 : Jumlah file backup terbaru yang disimpan}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backup database MySQL ke storage/app/backups memakai mysqldump.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (config('database.default') !== 'mysql') {
            $this->warn('Backup mysqldump hanya untuk koneksi mysql. Dilewati.');

            return self::SUCCESS;
        }

        $mysqldump = $this->findMysqldump();

        if (! $mysqldump) {
            $this->warn('mysqldump tidak ditemukan di PATH. Backup dilewati.');

            return self::SUCCESS;
        }

        Storage::disk('local')->makeDirectory('backups');

        $gzip = $this->findBinary('gzip');
        $extension = $gzip ? '.sql.gz' : '.sql';
        $filename = 'backups/backup-'.now()->format('Ymd-His').$extension;
        $path = Storage::disk('local')->path($filename);

        $command = sprintf(
            '%s --host=%s --port=%s --user=%s --password=%s %s',
            escapeshellarg($mysqldump),
            escapeshellarg((string) config('database.connections.mysql.host')),
            escapeshellarg((string) config('database.connections.mysql.port')),
            escapeshellarg((string) config('database.connections.mysql.username')),
            escapeshellarg((string) config('database.connections.mysql.password')),
            escapeshellarg((string) config('database.connections.mysql.database')),
        );

        $redirect = $gzip
            ? $command.' | gzip > '.escapeshellarg($path)
            : $command.' > '.escapeshellarg($path);

        $process = Process::fromShellCommandline($redirect);
        $process->setTimeout(300);
        $process->run();

        if (! $process->isSuccessful()) {
            $this->error('Backup gagal: '.trim($process->getErrorOutput()));

            return self::FAILURE;
        }

        $this->prune((int) $this->option('keep'));
        $this->info("Backup tersimpan: {$filename}");

        return self::SUCCESS;
    }

    private function findMysqldump(): ?string
    {
        $candidates = ['mysqldump'];

        if (PHP_OS_FAMILY === 'Windows') {
            $candidates[] = 'C:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64\\bin\\mysqldump.exe';
            $candidates[] = 'C:\\laragon\\bin\\mysql\\mysql-8.4\\bin\\mysqldump.exe';
            $candidates[] = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
        }

        foreach ($candidates as $candidate) {
            if (is_file($candidate)) {
                return $candidate;
            }

            $found = $this->findBinary($candidate);

            if ($found) {
                return $found;
            }
        }

        return null;
    }

    private function findBinary(string $name): ?string
    {
        $process = Process::fromShellCommandline(
            PHP_OS_FAMILY === 'Windows'
                ? "where {$name} 2>nul"
                : "command -v {$name}"
        );
        $process->run();

        if ($process->isSuccessful() && trim($process->getOutput()) !== '') {
            return trim(explode(PHP_EOL, $process->getOutput())[0]);
        }

        return null;
    }

    private function prune(int $keep): void
    {
        $files = collect(Storage::disk('local')->files('backups'))
            ->filter(fn (string $file) => str_ends_with($file, '.sql.gz') || str_ends_with($file, '.sql'))
            ->sort()
            ->values();

        if ($files->count() <= max(1, $keep)) {
            return;
        }

        foreach ($files->slice(0, $files->count() - $keep) as $file) {
            Storage::disk('local')->delete($file);
        }
    }
}
