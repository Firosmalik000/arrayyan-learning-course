<?php

namespace App\Jobs;

use App\Models\NotificationLog;
use App\Support\WhatsappNotifier;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendRegistrationNotification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        public string $event,
        public string $recipient,
        public string $name,
        public string $ticket,
        public ?string $reason,
        public ?string $registrationType,
        public ?int $registrationId,
        public ?string $extra = null,
    ) {}

    public function handle(WhatsappNotifier $notifier): void
    {
        $message = WhatsappNotifier::previewFor(
            $this->event,
            $this->name,
            $this->ticket,
            $this->reason,
            $this->extra
        );

        $log = NotificationLog::create([
            'event' => $this->event,
            'channel' => 'whatsapp',
            'recipient' => $this->recipient,
            'message' => $message,
            'status' => 'queued',
            'registration_type' => $this->registrationType,
            'registration_id' => $this->registrationId,
        ]);

        try {
            $notifier->send($this->recipient, $message);
        } catch (Throwable $e) {
            $log->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);

            Log::warning('Notifikasi pendaftaran gagal: '.$e->getMessage(), [
                'event' => $this->event,
                'recipient' => $this->recipient,
            ]);

            return;
        }

        $log->update(['status' => 'sent']);
    }

    public function failed(Throwable $e): void
    {
        NotificationLog::query()
            ->where('event', $this->event)
            ->where('recipient', $this->recipient)
            ->where('registration_type', $this->registrationType)
            ->where('registration_id', $this->registrationId)
            ->latest()
            ->first()
            ?->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);
    }
}
