import { Head } from '@inertiajs/react';
import PlaceholderPanel from '../../Components/Admin/PlaceholderPanel';

export default function Settings() {
    return (
        <>
            <Head title="Admin Pengaturan" />
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                        Pengaturan
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Konfigurasi umum sistem ALC.
                    </p>
                </div>
                <PlaceholderPanel
                    title="Pengaturan Sistem"
                    description="Pengaturan brand, akun admin, dan integrasi notifikasi."
                />
            </div>
        </>
    );
}
