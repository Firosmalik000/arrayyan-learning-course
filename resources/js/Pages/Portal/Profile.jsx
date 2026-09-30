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
            ['Bidang Studi', linked.subjects || '-'],
        ];

    return (
        <PortalLayout>
            <Head title="Profil Akun" />
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                    Profil Akun
                </h1>
            </div>

            <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                {/* User Header */}
                <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 font-display text-2xl font-extrabold text-white shadow-xs">
                        {(account.name || 'A')[0].toUpperCase()}
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-display text-xl font-bold text-slate-900">{account.name}</p>
                            <span className="rounded-full bg-violet-100 text-brand-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                {isStudent ? 'Murid' : 'Pengajar'}
                            </span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                            {account.contact}
                        </p>
                    </div>
                </div>

                {/* Details Grid */}
                <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {rows.map(([label, value]) => (
                        <div key={label} className="rounded-2xl bg-slate-50/80 px-4 py-3 border border-slate-100/80">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
                            <dd className="mt-1 font-bold text-slate-800 text-sm">{value}</dd>
                        </div>
                    ))}
                    <div className="rounded-2xl bg-slate-50/80 px-4 py-3 border border-slate-100/80">
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Login Terakhir</dt>
                        <dd className="mt-1 font-bold text-slate-800 text-sm">{formatDate(account.last_login_at)}</dd>
                    </div>
                </dl>

                {/* Actions */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                    <Link
                        href="/portal/password"
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:border-violet-300 hover:text-brand-primary hover:bg-violet-50/40 transition shadow-2xs"
                    >
                        Ganti Password
                    </Link>
                </div>
            </div>
        </PortalLayout>
    );
}
