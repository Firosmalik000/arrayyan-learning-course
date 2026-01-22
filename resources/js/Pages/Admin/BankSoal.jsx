import { Head } from '@inertiajs/react';
import PlaceholderPanel from '../../Components/Admin/PlaceholderPanel';

export default function BankSoal() {
    return (
        <>
            <Head title="Admin Bank Soal" />
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                        Bank Soal
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Struktur modul latihan offline dan online.
                    </p>
                </div>
                <PlaceholderPanel
                    title="Bank Soal Offline & Online"
                    description="Tambahkan kategori soal, jenjang, dan paket latihan."
                />
            </div>
        </>
    );
}
