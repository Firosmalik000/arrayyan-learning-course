<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PortalAccountInformationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $recipientName,
        public string $portalLabel,
        public string $loginIdentity,
        public ?string $temporaryPassword,
        public string $portalUrl,
        public ?string $linkedName = null,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Informasi Login '.$this->portalLabel.' - '.config('app.name'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.portal-account-information',
            with: [
                'recipientName' => $this->recipientName,
                'portalLabel' => $this->portalLabel,
                'loginIdentity' => $this->loginIdentity,
                'temporaryPassword' => $this->temporaryPassword,
                'portalUrl' => $this->portalUrl,
                'linkedName' => $this->linkedName,
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
