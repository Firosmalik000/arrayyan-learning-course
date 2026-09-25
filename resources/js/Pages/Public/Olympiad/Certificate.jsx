import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import SeoHead from '@/Components/SeoHead';
import { Button, Container, SectionHeader } from '@/Components/Public';
import { formatDate } from '@/lib/formatDate';
import { useI18n } from '@/lib/i18n';

export default function Certificate() {
    const { props } = usePage();
    const { language } = useI18n();
    const olympiad = props.olympiad;
    const matched = props.matched_name || null;
    const queryName = props.name || '';
    const [name, setName] = useState(queryName);

    const search = (e) => {
        e.preventDefault();
        if (!olympiad) return;
        router.get(`/olimpiade/${olympiad.slug}/sertifikat`, { name }, { preserveState: true, replace: true });
    };

    return (
        <>
            <SeoHead
                title={matched ? `Sertifikat — ${matched}` : 'Cek Sertifikat'}
                description="Verifikasi dan unduh sertifikat pemenang olimpiade ALC."
            />

            <section className="border-b border-slate-200/60 bg-gradient-to-b from-amber-50/70 via-white to-slate-50/40 pb-10 pt-10 no-print">
                <Container>
                    <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="transition hover:text-brand-primary">Beranda</Link>
                        <span>/</span>
                        <Link href="/olimpiade" className="transition hover:text-brand-primary">Olimpiade</Link>
                        <span>/</span>
                        <span className="font-bold text-amber-700">Sertifikat</span>
                    </nav>
                    <SectionHeader
                        eyebrow="Penghargaan"
                        title="Sertifikat Pemenang"
                        subtitle="Masukkan nama sesuai pengumuman untuk menampilkan sertifikat."
                        align="center"
                    />
                </Container>
            </section>

            <section className="bg-slate-50/40 py-10">
                <Container>
                    <form onSubmit={search} className="no-print mx-auto flex max-w-md gap-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama lengkap pemenang"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                        />
                        <Button type="submit" variant="secondary" className="shrink-0">
                            Cek
                        </Button>
                    </form>

                    {queryName !== '' && !matched && (
                        <p className="no-print mx-auto mt-6 max-w-md rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
                            Nama “{queryName}” tidak ada dalam daftar pemenang{olympiad ? ` ${olympiad.name}` : ''}.
                        </p>
                    )}

                    {matched && olympiad && (
                        <div className="mx-auto mt-8 max-w-3xl">
                            <div className="rounded-3xl border-8 border-double border-amber-300 bg-white p-8 text-center shadow-xl sm:p-12">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600">
                                    Ar Rayyan Learning Course
                                </p>
                                <h2 className="mt-2 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
                                    Sertifikat Penghargaan
                                </h2>
                                <p className="mt-4 text-sm text-slate-500">Diberikan dengan bangga kepada</p>
                                <p className="mt-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                                    {matched}
                                </p>
                                <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
                                    atas prestasi sebagai pemenang pada <span className="font-bold">{olympiad.name}</span>
                                    {olympiad.level ? ` (${olympiad.level})` : ''}
                                    {olympiad.schedule ? ` • ${formatDate(olympiad.schedule, language)}` : ''}.
                                </p>
                                <div className="mx-auto mt-6 flex max-w-xs items-center justify-between text-xs text-slate-500">
                                    <div className="text-center">
                                        <p className="font-bold text-slate-800">Panitia ALC</p>
                                        <p className="mt-4 border-t border-slate-300 pt-1">Tanda tangan</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-slate-800">Koordinator</p>
                                        <p className="mt-4 border-t border-slate-300 pt-1">Tanda tangan</p>
                                    </div>
                                </div>
                            </div>
                            <div className="no-print mt-4 text-center">
                                <Button type="button" variant="primary" onClick={() => window.print()}>
                                    Cetak / Simpan PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </Container>
            </section>

            <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>
        </>
    );
}
