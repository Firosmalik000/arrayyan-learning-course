import { Head } from '@inertiajs/react';
import PlaceholderPanel from '../../Components/Admin/PlaceholderPanel';

export default function Teachers() {
    return (
        <>
            <Head title="Admin Pengajar" />
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                        Pengajar
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Data pengajar dan kebutuhan pengembangan SDM.
                    </p>
                </div>
                <PlaceholderPanel
                    title="Database Pengajar"
                    description="Kelola profil pengajar, keahlian, dan jadwal mengajar."
                />
            </div>
        </>
    );
}
