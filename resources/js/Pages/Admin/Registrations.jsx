import { Head } from '@inertiajs/react';
import PlaceholderPanel from '../../Components/Admin/PlaceholderPanel';

export default function Registrations() {
    return (
        <>
            <Head title="Admin Pendaftaran" />
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                        Pendaftaran
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Monitoring pendaftaran murid dan pengajar.
                    </p>
                </div>
                <PlaceholderPanel
                    title="Data Pendaftaran"
                    description="Siapkan filter berdasarkan jenjang, program, dan status."
                />
            </div>
        </>
    );
}
