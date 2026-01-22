import { Head } from '@inertiajs/react';
import PlaceholderPanel from '../../Components/Admin/PlaceholderPanel';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard Admin" />
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                        Dashboard
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Ringkasan awal untuk monitoring program dan pendaftaran.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs text-slate-500">Program aktif</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-800">
                            6
                        </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs text-slate-500">Pendaftaran</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-800">
                            24
                        </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs text-slate-500">Olimpiade</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-800">
                            3
                        </p>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <PlaceholderPanel
                        title="Daftar pendaftaran terbaru"
                        description="Siapkan tabel pendaftaran murid dan pengajar pada tahap berikutnya."
                    />
                    <PlaceholderPanel
                        title="Notifikasi sistem"
                        description="Integrasi notifikasi admin akan ditambahkan setelah modul CRUD selesai."
                    />
                </div>
            </div>
        </>
    );
}
