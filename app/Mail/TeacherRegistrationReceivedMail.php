<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TeacherRegistrationReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $teacherName,
        public string $ticket,
        public string $statusUrl,
        public ?string $teacherRole = null,
        public ?string $city = null,
        public ?string $district = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pendaftaran Calon Pengajar ('.$this->ticket.') Berhasil Diterima - '.config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.teacher-registration-received',
            with: [
                'teacherName' => $this->teacherName,
                'ticket' => $this->ticket,
                'statusUrl' => $this->statusUrl,
                'teacherRole' => $this->teacherRole,
                'city' => $this->city,
                'district' => $this->district,
                'appName' => config('app.name'),
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
