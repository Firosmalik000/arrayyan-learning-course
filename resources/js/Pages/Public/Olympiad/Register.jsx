import { Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import SeoHead from '@/Components/SeoHead';
import { useI18n } from '@/lib/i18n';
import { formatDate } from '@/lib/formatDate';
import {
    Badge,
    Button,
    Container,
    SectionHeader,
} from '@/Components/Public';

export default function OlympiadRegister() {
    const { props } = usePage();
    const { language } = useI18n();
    const olympiad = props.olympiad;
    const flashSuccess = props.flash?.success;
    const flashError = props.flash?.error;
    const flashTicket = props.flash?.ticket;
    const [copied, setCopied] = useState(false);

    const form = useForm({ name: '', school: '', level: '', contact: '', website: '', form_started_at: '' });

    useEffect(() => {
        form.setData('form_started_at', String(Math.floor(Date.now() / 1000)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit = (e) => {
        e.preventDefault();
        form.post(`/olimpiade/${olympiad.slug}/daftar`, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const copyTicket = async () => {
        if (!flashTicket) return;
        try {
            await navigator.clipboard.writeText(flashTicket);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    const inputClass =
        'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100';
    const labelClass = 'mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wide';

    return (
        <>
            <SeoHead
                title={olympiad ? `Daftar ${olympiad.name}` : 'Pendaftaran Olimpiade'}
                description={olympiad ? `Formulir pendaftaran ${olympiad.name}.` : 'Formulir pendaftaran olimpiade ALC.'}
            />

            <section className="border-b border-slate-200/60 bg-gradient-to-b from-amber-50/70 via-white to-slate-50/40 pb-12 pt-10">
                <Container>
                    <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="transition hover:text-brand-primary">Beranda</Link>
                        <span>/</span>
                        <Link href="/olimpiade" className="transition hover:text-brand-primary">Olimpiade</Link>
                        <span>/</span>
                        {olympiad && (
                            <>
                                <Link href={`/olimpiade/${olympiad.slug}`} className="transition hover:text-brand-primary">
                                    {olympiad.name}
                                </Link>
                                <span>/</span>
                            </>
                        )}
                        <span className="font-bold text-amber-700">Daftar</span>
                    </nav>
                    <SectionHeader
                        eyebrow="Pendaftaran Peserta"
                        title={olympiad ? `Daftar: ${olympiad.name}` : 'Pendaftaran Olimpiade'}
                        subtitle="Isi data peserta dengan benar. Nomor tiket akan diberikan setelah pendaftaran terkirim."
                        align="center"
                    />
                </Container>
            </section>

            <section className="bg-slate-50/40 py-12 sm:py-16">
                <Container>
                    <div className="mx-auto max-w-2xl">
                        {!olympiad && (
                            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                                Olimpiade tidak ditemukan atau tidak aktif.
                            </div>
                        )}

                        {olympiad && flashSuccess && (
                            <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4.5 xs:p-6 text-emerald-900 shadow-md">
                                <h4 className="text-base font-bold">Pendaftaran Berhasil Dikirim!</h4>
                                <p className="mt-1 text-sm leading-relaxed">{flashSuccess}</p>
                                {flashTicket && (
                                    <div className="mt-4 rounded-2xl border border-emerald-300 bg-white p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                                            Nomor Tiket Peserta
                                        </p>
                                        <div className="mt-2 flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3">
                                            <span className="rounded-xl bg-emerald-100 px-3.5 py-2 font-mono text-base xs:text-lg font-bold tracking-wider text-emerald-900 text-center break-all">
                                                {flashTicket}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={copyTicket}
                                                className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 text-center"
                                            >
                                                {copied ? 'Tersalin!' : 'Salin'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {olympiad && flashError && (
                            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {flashError}
                            </div>
                        )}

                        {olympiad && olympiad.closed_reason && !flashSuccess && (
                            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                {olympiad.closed_reason}
                            </div>
                        )}

                        {olympiad && !olympiad.closed_reason && (
                            <form onSubmit={submit} className="rounded-3xl border border-slate-200/90 bg-white p-4.5 xs:p-6 sm:p-8 shadow-xl">
                                <div className="mb-5 rounded-2xl bg-amber-50/70 p-4 text-xs text-slate-600">
                                    <p className="font-bold text-slate-900">{olympiad.name}</p>
                                    <p className="mt-1">
                                        {olympiad.level || '-'} • {olympiad.schedule ? formatDate(olympiad.schedule, language) : 'Jadwal menyusul'}
                                        {olympiad.is_paid ? ` • Biaya Rp ${Number(olympiad.fee ?? 0).toLocaleString('id-ID')}` : ' • Gratis'}
                                        {olympiad.quota_remaining != null && ` • Sisa ${olympiad.quota_remaining} kursi`}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Nama Peserta *</label>
                                        <input
                                            type="text"
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            placeholder="Nama lengkap peserta"
                                            className={inputClass}
                                            required
                                        />
                                        {form.errors.name && <p className="mt-1 text-xs text-rose-500">{form.errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Asal Sekolah</label>
                                        <input
                                            type="text"
                                            value={form.data.school}
                                            onChange={(e) => form.setData('school', e.target.value)}
                                            placeholder="Nama sekolah"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Jenjang / Kelas</label>
                                        <input
                                            type="text"
                                            value={form.data.level}
                                            onChange={(e) => form.setData('level', e.target.value)}
                                            placeholder="cth: Kelas 8 SMP"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>No. WhatsApp Aktif *</label>
                                        <input
                                            type="tel"
                                            value={form.data.contact}
                                            onChange={(e) => form.setData('contact', e.target.value)}
                                            placeholder="081234567890"
                                            className={inputClass}
                                            required
                                        />
                                        {form.errors.contact && <p className="mt-1 text-xs text-rose-500">{form.errors.contact}</p>}
                                    </div>
                                </div>

                                <Button type="submit" variant="secondary" size="lg" loading={form.processing} className="mt-6 w-full">
                                    Kirim Pendaftaran
                                </Button>
                                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
                                    <input
                                        type="text"
                                        tabIndex={-1}
                                        autoComplete="off"
                                        value={form.data.website}
                                        onChange={(e) => form.setData('website', e.target.value)}
                                    />
                                </div>
                            </form>
                        )}
                    </div>
                </Container>
            </section>
        </>
    );
}
