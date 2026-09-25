<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('invoices:expire-overdue')->daily();
Schedule::command('invoices:send-due-reminders')->daily();
Schedule::command('app:backup-database')->weekly();
