<?php

namespace App\Support;

use App\Models\PortalAccount;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PortalAccountService
{
    /**
     * @return array{account: PortalAccount, password: string}|null
     */
    public static function createForStudent(Student $student): ?array
    {
        $contact = RegistrationTicket::normalizePhone((string) $student->parent_contact);

        if ($contact === '') {
            return null;
        }

        $exists = PortalAccount::query()
            ->where('type', PortalAccount::TYPE_STUDENT)
            ->where('contact', $contact)
            ->exists();

        if ($exists) {
            return null;
        }

        $password = strtoupper(Str::random(6));

        $account = PortalAccount::create([
            'type' => PortalAccount::TYPE_STUDENT,
            'student_id' => $student->id,
            'name' => $student->name,
            'contact' => $contact,
            'password' => Hash::make($password),
            'must_change_password' => true,
            'is_active' => true,
        ]);

        return ['account' => $account, 'password' => $password];
    }

    /**
     * @return array{account: PortalAccount, password: string}|null
     */
    public static function createForTeacher(Teacher $teacher): ?array
    {
        $contact = RegistrationTicket::normalizePhone((string) $teacher->contact);

        if ($contact === '') {
            return null;
        }

        $exists = PortalAccount::query()
            ->where('type', PortalAccount::TYPE_TEACHER)
            ->where('contact', $contact)
            ->exists();

        if ($exists) {
            return null;
        }

        $password = strtoupper(Str::random(6));

        $account = PortalAccount::create([
            'type' => PortalAccount::TYPE_TEACHER,
            'teacher_id' => $teacher->id,
            'name' => $teacher->name,
            'contact' => $contact,
            'password' => Hash::make($password),
            'must_change_password' => true,
            'is_active' => true,
        ]);

        return ['account' => $account, 'password' => $password];
    }
}
