<?php

namespace App\Support;

use App\Mail\PortalAccountInformationMail;
use App\Models\PortalAccount;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class PortalAccountNotificationService
{
    public function sendLoginInformation(PortalAccount $account, ?string $temporaryPassword = null): bool
    {
        if (! $account->email) {
            return false;
        }

        $account->loadMissing(['teacher:id,name', 'student:id,name', 'students:id,name,parent_portal_account_id']);

        $linkedName = $account->isTeacher()
            ? $account->teacher?->name
            : $account->students
                ->pluck('name')
                ->push($account->student?->name)
                ->filter()
                ->unique()
                ->implode(', ');

        try {
            Mail::to($account->email)->send(new PortalAccountInformationMail(
                recipientName: $account->name,
                portalLabel: $account->isTeacher() ? 'Portal Pengajar' : 'Portal Orang Tua',
                loginIdentity: $account->email ?: $account->contact,
                temporaryPassword: $temporaryPassword,
                portalUrl: route('login'),
                linkedName: $linkedName ?: null,
            ));

            return true;
        } catch (Throwable $exception) {
            Log::warning('Gagal mengirim informasi login akun portal.', [
                'portal_account_id' => $account->id,
                'recipient' => $account->email,
                'message' => $exception->getMessage(),
            ]);

            return false;
        }
    }
}
