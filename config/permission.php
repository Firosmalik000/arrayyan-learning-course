<?php

return [

    'models' => [

        'permission' => App\Models\Permission::class,

        'role' => App\Models\Role::class,

    ],

    'table_names' => [

        'roles' => 'roles',

        'permissions' => 'permissions',

        'model_has_permissions' => 'model_has_permissions',

        'model_has_roles' => 'model_has_roles',

        'role_has_permissions' => 'role_has_permissions',

    ],

    'column_names' => [

        'model_morph_key' => 'model_id',

    ],

    'register_permission_check_method' => true,

    'register_octane_reset_listener' => false,

    'events_enabled' => false,

    'teams' => false,

    'team_foreign_key' => 'team_id',

    'team_foreign_key_nullable' => false,

    'teams_table_name' => 'teams',

    'team_model' => App\Models\Team::class,

    'pivot_role' => 'role_id',

    'pivot_permission' => 'permission_id',

    'display_permission_in_exception' => false,

    'display_role_in_exception' => false,

    'enable_wildcard_permission' => false,

    'cache' => [

        'expiration_time' => DateInterval::createFromDateString('24 hours'),

        'key' => 'spatie.permission.cache',

        'store' => 'default',

    ],

];
