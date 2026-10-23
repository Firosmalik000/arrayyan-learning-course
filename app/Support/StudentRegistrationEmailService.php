<?php

namespace App\Support;

use App\Mail\ParentRegistrationApprovedExistingAccountMail;
use App\Mail\ParentRegistrationApprovedNewAccountMail;
use App\Mail\StudentRegistrationReceivedMail;
use App\Models\NotificationLog;
use App\Models\StudentRegistration;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class StudentRegistrationEmailService
{
    public function sendReceived(StudentRegistration $registration): bool
    {
        $recipient = $registration->parent_email;
        if (! $recipient) {
            return false;
        }

        $log = NotificationLog::create([
            'event' => 'received',
            'channel' => 'email',
            'recipient' => $recipient,
            'message' => 'Bukti Pendaftaran Murid ('.$registration->registration_no.')',
            'status' => 'queued',
            'registration_type' => 'student',
            'registration_id' => $registration->id,
        ]);

        $ticket = $registration->registration_no ?? ('REG-'.$registration->id);

        try {
            Mail::to($recipient)->send(new StudentRegistrationReceivedMail(
                studentName: $registration->student_name,
                ticket: $ticket,
                statusUrl: route('status.check', ['ticket' => $ticket]),
            ));

            $log->update(['status' => 'sent']);
            Log::info("Email pendaftaran murid diterima terkirim ke: {$recipient} (Tiket: {$ticket})");

            return true;
        } catch (Throwable $e) {
            $log->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);

            Log::error("Gagal mengirim email pendaftaran murid diterima ke {$recipient}: ".$e->getMessage(), [
                'registration_id' => $registration->id,
                'ticket' => $ticket,
                'exception' => $e,
            ]);

            return false;
        }
    }

    public function sendApprovedNewParent(StudentRegistration $registration, string $temporaryPassword): bool
    {
        $recipient = $registration->parent_email;
        if (! $recipient) {
            return false;
        }

        $programName = $registration->programItem?->name ?? $registration->program ?? 'Program ALC';

        $log = NotificationLog::create([
            'event' => 'approved',
            'channel' => 'email',
            'recipient' => $recipient,
            'message' => 'Pendaftaran Murid Disetujui & Akun Portal Baru ('.$registration->registration_no.')',
            'status' => 'queued',
            'registration_type' => 'student',
            'registration_id' => $registration->id,
        ]);

        try {
            Mail::to($recipient)->send(new ParentRegistrationApprovedNewAccountMail(
                studentName: $registration->student_name,
                programName: $programName,
                loginEmail: $recipient,
                temporaryPassword: $temporaryPassword,
                portalUrl: route('login'),
            ));

            $log->update(['status' => 'sent']);
            Log::info("Email persetujuan murid & akun baru terkirim ke: {$recipient}");

            return true;
        } catch (Throwable $e) {
            $log->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);

            Log::error("Gagal mengirim email persetujuan murid & akun baru ke {$recipient}: ".$e->getMessage(), [
                'registration_id' => $registration->id,
                'exception' => $e,
            ]);

            return false;
        }
    }

    public function sendApprovedExistingParent(StudentRegistration $registration): bool
    {
        $recipient = $registration->parent_email;
        if (! $recipient) {
            return false;
        }

        $programName = $registration->programItem?->name ?? $registration->program ?? 'Program ALC';

        $log = NotificationLog::create([
            'event' => 'approved',
            'channel' => 'email',
            'recipient' => $recipient,
            'message' => 'Pendaftaran Murid Disetujui (Akun Eksisting) ('.$registration->registration_no.')',
            'status' => 'queued',
            'registration_type' => 'student',
            'registration_id' => $registration->id,
        ]);

        try {
            Mail::to($recipient)->send(new ParentRegistrationApprovedExistingAccountMail(
                studentName: $registration->student_name,
                programName: $programName,
                loginEmail: $recipient,
                portalUrl: route('login'),
            ));

            $log->update(['status' => 'sent']);
            Log::info("Email persetujuan murid (akun eksisting) terkirim ke: {$recipient}");

            return true;
        } catch (Throwable $e) {
            $log->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);

            Log::error("Gagal mengirim email persetujuan murid (akun eksisting) ke {$recipient}: ".$e->getMessage(), [
                'registration_id' => $registration->id,
                'exception' => $e,
            ]);

            return false;
        }
    }
}
