<?php

namespace App\Console\Commands;

use App\Models\BankSoal;
use App\Models\BankSoalResource;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class SecureBankSoalFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bank-soal:secure-files';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Move existing question bank attachments from public to private storage';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $public = Storage::disk('public');
        $private = Storage::disk('local');
        $missing = 0;
        $failed = 0;
        $moved = 0;

        foreach (BankSoalResource::query()->whereNotNull('file_path')->distinct()->pluck('file_path') as $path) {
            if (! $public->exists($path)) {
                if (! $private->exists($path)) {
                    $missing++;
                }

                continue;
            }

            $contents = $public->get($path);
            if ($private->exists($path) && $private->get($path) !== $contents) {
                $failed++;

                continue;
            }
            if ($contents === null || ! $private->put($path, $contents)
                || hash('sha256', $private->get($path)) !== hash('sha256', $contents)) {
                $failed++;

                continue;
            }

            BankSoal::query()->where('image_path', $path)->update(['image_path' => null]);
            if (! $public->delete($path)) {
                $failed++;

                continue;
            }
            $moved++;
        }

        $this->info("Moved: {$moved}; missing source files: {$missing}; failed: {$failed}.");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}
