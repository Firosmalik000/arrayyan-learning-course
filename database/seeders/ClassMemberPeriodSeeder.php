<?php

namespace Database\Seeders;

use App\Models\ClassMember;
use App\Models\ClassMemberPeriod;
use Illuminate\Database\Seeder;

class ClassMemberPeriodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ClassMember::query()
            ->where('status', ClassMember::STATUS_ACTIVE)
            ->with(['student.packageItem', 'classGroup'])
            ->each(function (ClassMember $member): void {
                ClassMemberPeriod::firstOrCreate(
                    [
                        'class_member_id' => $member->id,
                        'start_date' => now()->startOfMonth()->toDateString(),
                        'end_date' => now()->endOfMonth()->toDateString(),
                    ],
                    [
                        'session_limit' => $member->student?->packageItem?->sessions
                            ?? $member->classGroup?->total_sessions
                            ?? 4,
                    ]
                );
            });
    }
}
