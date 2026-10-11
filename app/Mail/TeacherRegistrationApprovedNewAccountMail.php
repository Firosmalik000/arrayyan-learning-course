<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TeacherRegistrationApprovedNewAccountMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $teacherName,
        public string $subjects,
        public string $loginEmail,
        public string $temporaryPassword,
        public string $portalUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pendaftaran Pengajar Diterima & Akun Portal Pengajar - '.config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.teacher-registration-approved-new',
            with: [
                'teacherName' => $this->teacherName,
                'subjects' => $this->subjects,
                'loginEmail' => $this->loginEmail,
                'temporaryPassword' => $this->temporaryPassword,
                'portalUrl' => $this->portalUrl,
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
