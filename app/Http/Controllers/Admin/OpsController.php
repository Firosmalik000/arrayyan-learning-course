<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\NotificationLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OpsController extends Controller
{
    public function notifications(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $event = trim((string) $request->query('event', ''));
        $status = trim((string) $request->query('status', ''));

        $logs = NotificationLog::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner->where('recipient', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%");
                });
            })
            ->when($event !== '', fn ($query) => $query->where('event', $event))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Notifications', [
            'logs' => $logs,
            'events' => NotificationLog::query()
                ->select('event')
                ->distinct()
                ->orderBy('event')
                ->pluck('event')
                ->values()
                ->all(),
            'filters' => ['search' => $search, 'event' => $event, 'status' => $status],
        ]);
    }

    public function activities(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $event = trim((string) $request->query('event', ''));

        $logs = ActivityLog::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner->where('description', 'like', "%{$search}%")
                        ->orWhere('caused_by_name', 'like', "%{$search}%");
                });
            })
            ->when($event !== '', fn ($query) => $query->where('event', $event))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Activities', [
            'logs' => $logs,
            'events' => ActivityLog::query()
                ->select('event')
                ->distinct()
                ->orderBy('event')
                ->pluck('event')
                ->values()
                ->all(),
            'filters' => ['search' => $search, 'event' => $event],
        ]);
    }
}
