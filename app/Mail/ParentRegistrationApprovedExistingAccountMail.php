<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ParentRegistrationApprovedExistingAccountMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $studentName,
        public string $programName,
        public string $loginEmail,
        public string $portalUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pendaftaran '.$this->studentName.' Diterima - '.config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.parent-registration-approved-existing',
            with: [
                'studentName' => $this->studentName,
                'programName' => $this->programName,
                'loginEmail' => $this->loginEmail,
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
