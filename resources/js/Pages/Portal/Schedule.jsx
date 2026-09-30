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
            <Head title="Jadwal Mingguan" />
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                    Jadwal Mingguan
                </h1>
            </div>

            {schedules.length === 0 ? (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
                    <p className="text-xs text-slate-400">Belum ada jadwal.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {schedules.map((s, i) => (
                        <div
                            key={i}
                            className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-violet-200 hover:shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-brand-primary">
                                    {s.day}
                                </span>
                                {s.room && (
                                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                        Ruang {s.room}
                                    </span>
                                )}
                            </div>

                            <div className="mt-3.5">
                                <p className="font-display text-lg font-bold text-slate-900">
                                    {s.class}
                                </p>
                                <p className="mt-1 font-mono text-sm font-bold text-slate-600">
                                    {s.start_time} – {s.end_time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PortalLayout>
    );
}
