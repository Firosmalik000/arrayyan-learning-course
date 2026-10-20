<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PortalResetPasswordNotification extends Notification
{
    use Queueable;

    public string $token;

    public function __construct(#[\SensitiveParameter] string $token)
    {
        $this->token = $token;
    }

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = route('portal.password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);

        return (new MailMessage)
            ->subject('Atur Ulang Kata Sandi Portal - '.config('app.name'))
            ->view('emails.portal-password-reset', [
                'accountName' => $notifiable->name,
                'resetUrl' => $resetUrl,
                'expiresInMinutes' => config('auth.passwords.portal_accounts.expire'),
                'appName' => config('app.name'),
            ]);
    }
}
