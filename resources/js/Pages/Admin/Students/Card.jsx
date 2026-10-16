import { Link, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';

export default function StudentCard() {
    const { props } = usePage();
    const student = props.student || {};
    const className = props.class_name || null;

    return (
        <>
            <Head title={`Kartu ${student.name || 'Murid'}`} />

            <div className="mx-auto max-w-xl space-y-4 p-4 sm:p-6">
                <div className="no-print flex items-center justify-between">
                    <Link href="/admin/pelajar" className="text-xs font-bold text-slate-500 hover:text-slate-800">
                        ← Kembali
                    </Link>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-full bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:opacity-90"
                    >
                        Cetak Kartu
                    </button>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
                    <div className="bg-gradient-to-r from-violet-600 to-violet-800 px-4 xs:px-6 py-4 xs:py-5 text-white">
                        <p className="text-[10px] xs:text-xs font-bold uppercase tracking-[0.25em] text-violet-200">
                            Kartu Murid
                        </p>
                        <h1 className="mt-1 font-display text-lg xs:text-2xl font-extrabold">
                            Ar Rayyan Learning Course
                        </h1>
                    </div>
                    <div className="flex flex-col xs:flex-row items-center gap-3.5 xs:gap-5 px-4 xs:px-6 py-5 xs:py-6 text-center xs:text-left">
                        <span className="flex h-16 w-16 xs:h-20 xs:w-20 shrink-0 items-center justify-center rounded-2xl bg-violet-100 font-display text-xl xs:text-2xl font-bold text-brand-primary">
                            {(student.name || 'A')[0].toUpperCase()}
                        </span>
                        <div>
                            <p className="font-display text-lg xs:text-xl font-bold text-slate-900">{student.name}</p>
                            <p className="mt-0.5 font-mono text-xs text-slate-500">
                                ID-{String(student.id || 0).padStart(5, '0')}
                            </p>
                        </div>
                    </div>
                    <dl className="grid grid-cols-1 xs:grid-cols-2 gap-px bg-slate-100 text-xs xs:text-sm">
                        {[
                            ['Program', student.program || '-'],
                            ['Kelas', className || '-'],
                            ['Sekolah', student.school_name || '-'],
                            ['Jenjang', student.level || '-'],
                            ['Kontak Ortu', student.parent_contact || '-'],
                            ['Status', student.is_active ? 'Aktif' : 'Nonaktif'],
                        ].map(([label, value]) => (
                            <div key={label} className="bg-white px-4 xs:px-6 py-2.5 xs:py-3">
                                <dt className="text-[11px] xs:text-xs text-slate-500">{label}</dt>
                                <dd className="mt-0.5 font-bold text-slate-900">{value}</dd>
                            </div>
                        ))}
                    </dl>
                    <p className="bg-slate-50 px-4 xs:px-6 py-3 text-center text-[11px] xs:text-xs text-slate-400">
                        Kartu ini adalah identitas resmi murid ALC. Harap dibawa setiap sesi belajar.
                    </p>
                </div>
            </div>

            <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>
        </>
    );
}
