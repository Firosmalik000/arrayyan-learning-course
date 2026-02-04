<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    protected string $guard_name = 'admin';

    protected $fillable = [
        'name',
        'label',
        'description',
        'group',
        'guard_name',
    ];
}
