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
     * Create a new parent portal account or link the student to an existing one.
     *
     * @return array{account: PortalAccount, is_new: bool, password: ?string}|null
     */
    public static function createOrLinkForStudent(
        Student $student,
        ?string $parentEmail = null,
        ?string $parentName = null
    ): ?array {
        $contact = RegistrationTicket::normalizePhone((string) $student->parent_contact);
        $email = $parentEmail ? strtolower(trim($parentEmail)) : ($student->parent_email ? strtolower(trim($student->parent_email)) : null);

        if ($contact === '' && ! $email) {
            return null;
        }

        // 1. Check if parent account already exists by email
        $existing = null;
        if ($email) {
            $existing = PortalAccount::query()
                ->whereIn('type', [PortalAccount::TYPE_PARENT, PortalAccount::TYPE_STUDENT])
                ->where('email', $email)
                ->first();
        }

        // 2. Check if parent account exists by contact (fallback)
        if (! $existing && $contact !== '') {
            $existing = PortalAccount::query()
                ->whereIn('type', [PortalAccount::TYPE_PARENT, PortalAccount::TYPE_STUDENT])
                ->where('contact', $contact)
                ->first();
        }

        // If parent account exists, link child and keep existing credentials
        if ($existing) {
            if ($existing->type === PortalAccount::TYPE_STUDENT) {
                $existing->type = PortalAccount::TYPE_PARENT;
            }
            if (! $existing->email && $email) {
                $existing->email = $email;
            }
            $existing->save();

            $student->update([
                'parent_portal_account_id' => $existing->id,
                'parent_email' => $email ?? $existing->email,
            ]);

            return [
                'account' => $existing,
                'is_new' => false,
                'password' => null,
            ];
        }

        // New parent account: generate secure temporary password
        $password = strtoupper(Str::random(8));

        $account = PortalAccount::create([
            'type' => PortalAccount::TYPE_PARENT,
            'student_id' => $student->id,
            'name' => $parentName ?: 'Orang Tua '.$student->name,
            'email' => $email,
            'contact' => $contact ?: '08000000000',
            'password' => Hash::make($password),
            'must_change_password' => true,
            'is_active' => true,
        ]);

        $student->update([
            'parent_portal_account_id' => $account->id,
            'parent_email' => $email,
        ]);

        return [
            'account' => $account,
            'is_new' => true,
            'password' => $password,
        ];
    }

    /**
     * Backward-compatible alias for existing tests and callers.
     *
     * @return array{account: PortalAccount, password: string}|null
     */
    public static function createForStudent(Student $student): ?array
    {
        $result = self::createOrLinkForStudent($student, $student->parent_email);

        if (! $result || ! $result['is_new']) {
            return null;
        }

        return [
            'account' => $result['account'],
            'password' => (string) $result['password'],
        ];
    }

    /**
     * Create a new teacher portal account or retrieve an existing one.
     *
     * @return array{account: PortalAccount, is_new: bool, password: ?string}|null
     */
    public static function createForTeacher(Teacher $teacher, ?string $teacherEmail = null): ?array
    {
        $contact = RegistrationTicket::normalizePhone((string) $teacher->contact);
        $email = $teacherEmail ? strtolower(trim($teacherEmail)) : ($teacher->email ? strtolower(trim($teacher->email)) : null);

        if ($contact === '' && ! $email) {
            return null;
        }

        // 1. Check if teacher portal account exists by email
        $existing = null;
        if ($email) {
            $existing = PortalAccount::query()
                ->where('type', PortalAccount::TYPE_TEACHER)
                ->where('email', $email)
                ->first();
        }

        // 2. Check if teacher portal account exists by contact (fallback)
        if (! $existing && $contact !== '') {
            $existing = PortalAccount::query()
                ->where('type', PortalAccount::TYPE_TEACHER)
                ->where('contact', $contact)
                ->first();
        }

        if ($existing) {
            if (! $existing->email && $email) {
                $existing->email = $email;
            }
            if (! $existing->teacher_id) {
                $existing->teacher_id = $teacher->id;
            }
            $existing->save();

            return [
                'account' => $existing,
                'is_new' => false,
                'password' => null,
            ];
        }

        $password = strtoupper(Str::random(8));

        $account = PortalAccount::create([
            'type' => PortalAccount::TYPE_TEACHER,
            'teacher_id' => $teacher->id,
            'name' => $teacher->name,
            'email' => $email,
            'contact' => $contact ?: '08000000000',
            'password' => Hash::make($password),
            'must_change_password' => true,
            'is_active' => true,
        ]);

        return [
            'account' => $account,
            'is_new' => true,
            'password' => $password,
        ];
    }
}
