<?php

namespace App\Jobs;

use App\Models\NotificationLog;
use App\Support\WhatsappNotifier;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendInvoiceNotification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        public string $event,
        public string $recipient,
        public string $name,
        public string $invoiceNo,
        public string $amount,
        public ?string $dueDate,
        public ?int $invoiceId,
    ) {}

    public static function messageFor(
        string $event,
        string $name,
        string $invoiceNo,
        string $amount,
        ?string $dueDate,
    ): string {
        $payLink = route('portal.invoices');

        return match ($event) {
            'due' => "Halo {$name}, tagihan {$invoiceNo} sebesar {$amount} jatuh tempo {$dueDate}. Segera lakukan pembayaran dan konfirmasi bukti bayar melalui Portal Orang Tua: {$payLink}",
            'paid' => "Terima kasih {$name}! Pembayaran tagihan {$invoiceNo} sebesar {$amount} telah kami VERIFIKASI (LUNAS).",
            'expired' => "Halo {$name}, tagihan {$invoiceNo} sebesar {$amount} telah KEDALUWARSA. Silakan hubungi admin atau periksa di Portal Orang Tua: {$payLink}",
            'rejected' => "Halo {$name}, bukti pembayaran {$invoiceNo} BELUM dapat kami terima. Silakan periksa dan unggah ulang bukti yang valid di Portal Orang Tua: {$payLink}",
            default => "Halo {$name}, ada pembaruan untuk tagihan {$invoiceNo} di Ar Rayyan Learning Course. Silakan cek di Portal Orang Tua: {$payLink}",
        };
    }

    public function handle(WhatsappNotifier $notifier): void
    {
        $message = self::messageFor(
            $this->event,
            $this->name,
            $this->invoiceNo,
            $this->amount,
            $this->dueDate
        );

        $log = NotificationLog::create([
            'event' => 'invoice_'.$this->event,
            'channel' => 'whatsapp',
            'recipient' => $this->recipient,
            'message' => $message,
            'status' => 'queued',
            'registration_type' => 'invoice',
            'registration_id' => $this->invoiceId,
        ]);

        try {
            $notifier->send($this->recipient, $message);
        } catch (Throwable $e) {
            $log->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);

            Log::warning('Notifikasi tagihan gagal: '.$e->getMessage(), [
                'event' => $this->event,
                'invoice' => $this->invoiceNo,
            ]);

            return;
        }

        $log->update(['status' => 'sent']);
    }
}
