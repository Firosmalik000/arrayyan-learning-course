<?php

namespace App\Support;

use App\Mail\TeacherRegistrationApprovedExistingAccountMail;
use App\Mail\TeacherRegistrationApprovedNewAccountMail;
use App\Mail\TeacherRegistrationReceivedMail;
use App\Models\NotificationLog;
use App\Models\TeacherRegistration;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class TeacherRegistrationEmailService
{
    public function sendReceived(TeacherRegistration $registration): bool
    {
        $recipient = $registration->email;
        if (! $recipient) {
            return false;
        }

        $log = NotificationLog::create([
            'event' => 'received',
            'channel' => 'email',
            'recipient' => $recipient,
            'message' => 'Bukti Pendaftaran Pengajar ('.$registration->registration_no.')',
            'status' => 'queued',
            'registration_type' => 'teacher',
            'registration_id' => $registration->id,
        ]);

        $ticket = $registration->registration_no ?? ('TCR-'.$registration->id);

        try {
            Mail::to($recipient)->send(new TeacherRegistrationReceivedMail(
                teacherName: $registration->name,
                ticket: $ticket,
                statusUrl: route('status.check', ['ticket' => $ticket]),
                teacherRole: $registration->teacher_role,
                city: $registration->city,
                district: $registration->district,
            ));

            $log->update(['status' => 'sent']);
            Log::info("Email pendaftaran pengajar diterima terkirim ke: {$recipient} (Tiket: {$ticket})");

            return true;
        } catch (Throwable $e) {
            $log->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);

            Log::error("Gagal mengirim email pendaftaran pengajar diterima ke {$recipient}: ".$e->getMessage(), [
                'registration_id' => $registration->id,
                'ticket' => $ticket,
                'exception' => $e,
            ]);

            return false;
        }
    }

    public function sendApprovedNewTeacher(TeacherRegistration $registration, string $temporaryPassword): bool
    {
        $recipient = $registration->email;
        if (! $recipient) {
            return false;
        }

        $log = NotificationLog::create([
            'event' => 'approved',
            'channel' => 'email',
            'recipient' => $recipient,
            'message' => 'Pendaftaran Pengajar Disetujui & Akun Portal Baru ('.$registration->registration_no.')',
            'status' => 'queued',
            'registration_type' => 'teacher',
            'registration_id' => $registration->id,
        ]);

        try {
            Mail::to($recipient)->send(new TeacherRegistrationApprovedNewAccountMail(
                teacherName: $registration->name,
                subjects: $registration->subjects ?? 'Semua Mata Pelajaran',
                loginEmail: $recipient,
                temporaryPassword: $temporaryPassword,
                portalUrl: route('portal.login'),
            ));

            $log->update(['status' => 'sent']);
            Log::info("Email persetujuan pengajar & akun baru terkirim ke: {$recipient}");

            return true;
        } catch (Throwable $e) {
            $log->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);

            Log::error("Gagal mengirim email persetujuan pengajar & akun baru ke {$recipient}: ".$e->getMessage(), [
                'registration_id' => $registration->id,
                'exception' => $e,
            ]);

            return false;
        }
    }

    public function sendApprovedExistingTeacher(TeacherRegistration $registration): bool
    {
        $recipient = $registration->email;
        if (! $recipient) {
            return false;
        }

        $log = NotificationLog::create([
            'event' => 'approved',
            'channel' => 'email',
            'recipient' => $recipient,
            'message' => 'Pendaftaran Pengajar Disetujui (Akun Eksisting) ('.$registration->registration_no.')',
            'status' => 'queued',
            'registration_type' => 'teacher',
            'registration_id' => $registration->id,
        ]);

        try {
            Mail::to($recipient)->send(new TeacherRegistrationApprovedExistingAccountMail(
                teacherName: $registration->name,
                subjects: $registration->subjects ?? 'Semua Mata Pelajaran',
                loginEmail: $recipient,
                portalUrl: route('portal.login'),
            ));

            $log->update(['status' => 'sent']);
            Log::info("Email persetujuan pengajar (akun eksisting) terkirim ke: {$recipient}");

            return true;
        } catch (Throwable $e) {
            $log->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);

            Log::error("Gagal mengirim email persetujuan pengajar (akun eksisting) ke {$recipient}: ".$e->getMessage(), [
                'registration_id' => $registration->id,
                'exception' => $e,
            ]);

            return false;
        }
    }
}
