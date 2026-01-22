import { Head } from '@inertiajs/react';
import PlaceholderPanel from '../../Components/Admin/PlaceholderPanel';

export default function Programs() {
    return (
        <>
            <Head title="Admin Program" />
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                        Program
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Kelola program dan paket belajar ALC di tahap selanjutnya.
                    </p>
                </div>
                <PlaceholderPanel
                    title="Manajemen Program"
                    description="Tempat untuk membuat, mengedit, dan mengarsipkan program belajar."
                />
            </div>
        </>
    );
}
