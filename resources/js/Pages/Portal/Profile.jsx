import { Link, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';

const formatDate = (v) => {
    if (!v) return '-';
    try {
        return new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return '-';
    }
};

export default function Profile() {
    const { props } = usePage();
    const account = props.account || {};
    const linked = props.linked || {};
    const isStudent = (props.account_type || 'student') === 'student';

    const rows = isStudent
        ? [
            ['Program', linked.program || '-'],
            ['Sekolah', linked.school_name || '-'],
            ['Jenjang', linked.level || '-'],
        ]
        : [
            ['Pendidikan', linked.education || '-'],
            ['Bidang', linked.subjects || '-'],
        ];

    return (
        <PortalLayout>
            <Head title="Profil" />
            <h1 className="mb-4 font-display text-xl font-bold text-slate-900">Profil</h1>
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
                <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary font-display text-lg font-bold text-white">
                        {(account.name || 'A')[0].toUpperCase()}
                    </span>
                    <div>
                        <p className="font-display text-lg font-bold text-slate-900">{account.name}</p>
                        <p className="text-xs text-slate-500">
                            {isStudent ? 'Murid' : 'Pengajar'} • {account.contact}
                        </p>
                    </div>
                </div>

                <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    {rows.map(([label, value]) => (
                        <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3">
                            <dt className="text-xs text-slate-500">{label}</dt>
                            <dd className="mt-0.5 font-bold text-slate-900">{value}</dd>
                        </div>
                    ))}
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <dt className="text-xs text-slate-500">Login Terakhir</dt>
                        <dd className="mt-0.5 font-bold text-slate-900">{formatDate(account.last_login_at)}</dd>
                    </div>
                </dl>

                <Link
                    href="/portal/password"
                    className="mt-5 block rounded-full border-2 border-slate-200 px-5 py-2.5 text-center text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                    Ganti Password
                </Link>
            </div>
        </PortalLayout>
    );
}
