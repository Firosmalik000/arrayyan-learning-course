<?php

namespace App\Support;

use App\Models\StudentRegistration;
use App\Models\TeacherRegistration;
use Illuminate\Database\Eloquent\Model;

class RegistrationTicket
{
    public static function generateFor(Model $registration): string
    {
        $year = $registration->created_at
            ? $registration->created_at->format('Y')
            : now()->format('Y');

        return sprintf('ALC-%s-%05d', $year, $registration->getKey());
    }

    public static function normalizePhone(string $value): string
    {
        return (string) preg_replace('/[\s\-.\(\)]/', '', $value);
    }

    /**
     * @return array{type: string, registration: Model}|null
     */
    public static function findByTicketAndPhone(string $ticket, string $phone): ?array
    {
        $ticket = strtoupper(trim($ticket));
        $phone = self::normalizePhone($phone);

        $student = StudentRegistration::query()
            ->where('registration_no', $ticket)
            ->first();

        if ($student && self::normalizePhone((string) $student->parent_contact) === $phone) {
            return ['type' => 'student', 'registration' => $student];
        }

        $teacher = TeacherRegistration::query()
            ->where('registration_no', $ticket)
            ->first();

        if ($teacher && self::normalizePhone((string) $teacher->contact) === $phone) {
            return ['type' => 'teacher', 'registration' => $teacher];
        }

        return null;
    }
}
