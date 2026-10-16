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
    const students = props.students || [];
    const isTeacher = (props.account_type || 'parent') === 'teacher';

    return (
        <PortalLayout>
            <Head title="Profil Akun" />
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                        Profil Akun
                    </h1>
                </div>
            </div>

            <div className="mx-auto max-w-2xl space-y-4">
                {/* Account Card */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs">
                    {/* User Header */}
                    <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 border-b border-slate-100 pb-3.5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 font-display text-base font-extrabold text-white shadow-2xs">
                            {(account.name || 'A')[0].toUpperCase()}
                        </span>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <p className="font-display text-base font-bold text-slate-900 truncate">{account.name}</p>
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                                    isTeacher ? 'bg-amber-100 text-amber-800' : 'bg-violet-100 text-brand-primary'
                                }`}>
                                    {isTeacher ? 'Pengajar' : 'Orang Tua'}
                                </span>
                            </div>
                            <p className="mt-1 text-xs font-medium text-slate-500 break-all">
                                {account.email ? `${account.email} • ` : ''}{account.contact}
                            </p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="rounded-2xl bg-slate-50/80 px-4 py-3 border border-slate-100/80">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Terdaftar</dt>
                            <dd className="mt-1 font-bold text-slate-800 text-sm truncate">{account.email || '-'}</dd>
                        </div>
                        <div className="rounded-2xl bg-slate-50/80 px-4 py-3 border border-slate-100/80">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">No. WhatsApp</dt>
                            <dd className="mt-1 font-bold text-slate-800 text-sm">{account.contact || '-'}</dd>
                        </div>
                        {isTeacher && (
                            <>
                                <div className="rounded-2xl bg-slate-50/80 px-4 py-3 border border-slate-100/80">
                                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pendidikan</dt>
                                    <dd className="mt-1 font-bold text-slate-800 text-sm">{linked.education || '-'}</dd>
                                </div>
                                <div className="rounded-2xl bg-slate-50/80 px-4 py-3 border border-slate-100/80">
                                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bidang Studi</dt>
                                    <dd className="mt-1 font-bold text-slate-800 text-sm">{linked.subjects || '-'}</dd>
                                </div>
                            </>
                        )}
                        <div className="rounded-2xl bg-slate-50/80 px-4 py-3 border border-slate-100/80 sm:col-span-2">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Login Terakhir</dt>
                            <dd className="mt-1 font-bold text-slate-800 text-sm">{formatDate(account.last_login_at)}</dd>
                        </div>
                    </dl>

                    {/* Actions */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                        <Link
                            href="/portal/password"
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:border-violet-300 hover:text-brand-primary hover:bg-violet-50/40 transition shadow-2xs"
                        >
                            Ganti Kata Sandi
                        </Link>
                    </div>
                </div>

                {/* Children List Card for Parents */}
                {!isTeacher && (
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                        <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="font-display text-base font-bold text-slate-900">
                                    Daftar Anak Terdaftar ({students.length})
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Putra-putri yang terhubung dengan akun portal Anda
                                </p>
                            </div>
                        </div>

                        {students.length === 0 ? (
                            <p className="text-xs text-slate-400 py-3 text-center">
                                Belum ada siswa yang ditautkan ke akun ini.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {students.map((child) => (
                                    <div
                                        key={child.id}
                                        className="flex items-center justify-between rounded-2xl bg-slate-50/80 p-4 border border-slate-100/80 transition hover:border-violet-200"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-display text-sm font-bold text-slate-900 truncate">
                                                    {child.name}
                                                </p>
                                                {child.level && (
                                                    <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                                        {child.level}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {child.program || 'Program Reguler'} {child.school_name ? `• ${child.school_name}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}
