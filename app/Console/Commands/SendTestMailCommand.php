<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendTestMailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:test {recipient? : Alamat email tujuan tes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kirim email uji coba untuk memverifikasi konfigurasi SMTP';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $recipient = $this->argument('recipient') ?: config('mail.from.address');

        if (! filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
            $this->error("Alamat email tidak valid: {$recipient}");

            return self::FAILURE;
        }

        $this->info('=== INFORMASI KONFIGURASI MAIL ===');
        $this->table(
            ['Parameter', 'Nilai'],
            [
                ['Default Mailer', (string) config('mail.default')],
                ['SMTP Host', (string) config('mail.mailers.smtp.host')],
                ['SMTP Port', (string) config('mail.mailers.smtp.port')],
                ['SMTP Scheme', (string) (config('mail.mailers.smtp.scheme') ?? 'default')],
                ['SMTP Encryption', (string) (config('mail.mailers.smtp.encryption') ?? 'none')],
                ['SMTP Username', (string) config('mail.mailers.smtp.username')],
                ['From Address', (string) config('mail.from.address')],
                ['From Name', (string) config('mail.from.name')],
                ['Tujuan Tes', (string) $recipient],
            ]
        );

        $this->info("Mengirim email uji coba ke {$recipient}...");

        try {
            Mail::raw(
                "Halo,\n\nIni adalah email uji coba dari sistem ".config('app.name')." untuk memverifikasi bahwa pengiriman email SMTP berfungsi dengan sempurna.\n\nWaktu pengiriman: ".now()->format('Y-m-d H:i:s')."\n\nSalam,\nTim ".config('app.name'),
                function ($message) use ($recipient): void {
                    $message->to($recipient)
                        ->subject('Uji Coba Pengiriman Email - '.config('app.name'));
                }
            );

            $this->info('BERHASIL: Email uji coba berhasil dikirim!');

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('GAGAL: Terjadi kesalahan saat mengirim email.');
            $this->line('<fg=red>Exception:</> '.get_class($e));
            $this->line('<fg=red>Pesan Error:</> '.$e->getMessage());

            return self::FAILURE;
        }
    }
}
