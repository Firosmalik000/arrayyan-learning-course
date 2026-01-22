import { Head } from '@inertiajs/react';
import PlaceholderPanel from '../../Components/Admin/PlaceholderPanel';

export default function Olympiads() {
    return (
        <>
            <Head title="Admin Olimpiade" />
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                        Olimpiade
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Kelola jadwal, biaya, dan seleksi olimpiade.
                    </p>
                </div>
                <PlaceholderPanel
                    title="Data Olimpiade"
                    description="Tabel olimpiade dan status pendaftaran akan dibuat setelah CRUD."
                />
            </div>
        </>
    );
}
