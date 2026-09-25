<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class WhatsappNotifier
{
    public function send(string $recipient, string $message): void
    {
        $driver = (string) config('services.whatsapp.driver', 'log');

        if ($driver === 'fonnte') {
            $this->sendViaFonnte($recipient, $message);

            return;
        }

        Log::info('[whatsapp:log] To '.$recipient.': '.$message);
    }

    public static function previewFor(string $event, string $name, string $ticket, ?string $reason = null, ?string $extra = null): string
    {
        $message = match ($event) {
            'received' => "Halo {$name}, pendaftaran Anda di Ar Rayyan Learning Course sudah kami terima.\nNo. tiket: {$ticket}\nCek status: ".route('status.check', ['ticket' => $ticket]),
            'approved' => "Kabar baik {$name}! Pendaftaran Anda ({$ticket}) di Ar Rayyan Learning Course telah DISETUJUI. Tim kami akan segera menghubungi Anda untuk langkah berikutnya.",
            'rejected' => "Halo {$name}, mohon maaf pendaftaran Anda ({$ticket}) di Ar Rayyan Learning Course BELUM dapat kami setujui."
                .($reason ? "\nAlasan: {$reason}" : '')
                ."\nSilakan hubungi admin untuk informasi lebih lanjut.",
            'payment' => "Halo {$name}, bukti pembayaran untuk tagihan {$ticket} sudah kami terima dan sedang diverifikasi admin. Terima kasih.",
            'paid' => "Halo {$name}, pembayaran tagihan {$ticket} telah kami VERIFIKASI. Status: LUNAS. Terima kasih telah bergabung di Ar Rayyan Learning Course.",
            default => "Halo {$name}, ada pembaruan untuk pendaftaran {$ticket} di Ar Rayyan Learning Course.",
        };

        if ($extra) {
            $message .= "\n".$extra;
        }

        return $message;
    }

    private function sendViaFonnte(string $recipient, string $message): void
    {
        $token = (string) config('services.whatsapp.token');
        $url = (string) config('services.whatsapp.url', 'https://api.fonnte.com/send');

        if ($token === '') {
            throw new RuntimeException('Token WhatsApp (Fonnte) belum dikonfigurasi.');
        }

        $response = Http::asForm()
            ->withHeaders(['Authorization' => $token])
            ->timeout(15)
            ->post($url, [
                'target' => $recipient,
                'message' => $message,
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Gagal mengirim WhatsApp via Fonnte: HTTP '.$response->status());
        }
    }
}
