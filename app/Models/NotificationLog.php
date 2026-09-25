<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'event',
        'channel',
        'recipient',
        'message',
        'status',
        'error',
        'registration_type',
        'registration_id',
    ];
}
