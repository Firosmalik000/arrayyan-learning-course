import { usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';

const dayOrder = { Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5, Sabtu: 6, Minggu: 7 };

export default function Schedule() {
    const { props } = usePage();
    const schedules = [...(props.schedules ?? [])].sort(
        (a, b) => (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99) || a.start_time.localeCompare(b.start_time)
    );

    return (
        <PortalLayout>
            <Head title="Jadwal" />
            <h1 className="mb-4 font-display text-xl font-bold text-slate-900">Jadwal Mingguan</h1>
            {schedules.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    Belum ada jadwal.
                </p>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {schedules.map((s, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                            <p className="font-display text-base font-bold text-slate-900">{s.day}</p>
                            <p className="mt-0.5 text-sm font-semibold text-brand-primary">{s.start_time} – {s.end_time}</p>
                            <p className="mt-1 text-xs text-slate-500">{s.class}{s.room ? ` • Ruang ${s.room}` : ''}</p>
                        </div>
                    ))}
                </div>
            )}
        </PortalLayout>
    );
}
