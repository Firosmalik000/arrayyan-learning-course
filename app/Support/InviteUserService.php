<?php

namespace App\Support;

use App\Mail\InviteUserMail;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class InviteUserService
{
    public function send(User $user, Role $role, ?User $inviter, string $temporaryPassword): void
    {
        $loginUrl = route('admin.login');

        Mail::to($user)->send(new InviteUserMail(
            user: $user,
            role: $role,
            inviter: $inviter,
            temporaryPassword: $temporaryPassword,
            loginUrl: $loginUrl
        ));
    }
}
