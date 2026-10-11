<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudentRegistrationReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $studentName,
        public string $ticket,
        public string $statusUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pendaftaran '.$this->ticket.' Berhasil Diterima - '.config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.student-registration-received',
            with: [
                'studentName' => $this->studentName,
                'ticket' => $this->ticket,
                'statusUrl' => $this->statusUrl,
                'appName' => config('app.name'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
