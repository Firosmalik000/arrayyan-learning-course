import { Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import SeoHead from '@/Components/SeoHead';
import {
    Accordion,
    Button,
    Container,
    SectionHeader,
} from '@/Components/Public';

export default function Faq() {
    const { props } = usePage();
    const faqs = props.faqs ?? [];
    const categories = props.categories ?? [];
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return faqs.filter((f) => {
            const matchQ = !q
                || f.question.toLowerCase().includes(q)
                || f.answer.toLowerCase().includes(q);
            const matchC = !category || f.category === category;
            return matchQ && matchC;
        });
    }, [faqs, query, category]);

    return (
        <>
            <SeoHead
                title="Pertanyaan Umum (FAQ)"
                description="Jawaban atas pertanyaan umum seputar program, pendaftaran, biaya, dan jadwal Ar Rayyan Learning Course."
            />

            <section className="border-b border-slate-200/60 bg-gradient-to-b from-violet-50/70 via-white to-slate-50/40 pb-12 pt-10">
                <Container>
                    <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="transition hover:text-brand-primary">Beranda</Link>
                        <span>/</span>
                        <span className="font-bold text-brand-primary">FAQ</span>
                    </nav>
                    <SectionHeader
                        eyebrow="Bantuan"
                        title="Pertanyaan Umum"
                        subtitle="Temukan jawaban cepat. Masih bingung? Hubungi admin via WhatsApp."
                        align="center"
                    />
                    <div className="mx-auto mt-6 flex max-w-xl flex-col xs:flex-row gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari pertanyaan... (cth: biaya, jadwal)"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        />
                        {categories.length > 0 && (
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full xs:w-44 sm:w-48 shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                            >
                                <option value="">Semua Topik</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </Container>
            </section>

            <section className="bg-slate-50/40 py-12 sm:py-16">
                <Container>
                    <div className="mx-auto max-w-3xl">
                        {filtered.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 xs:p-10 text-center">
                                <p className="font-bold text-slate-800">Tidak ada jawaban yang cocok</p>
                                <p className="mt-1 text-sm text-slate-500">Coba kata kunci lain atau hubungi admin.</p>
                                <div className="mt-4">
                                    <Button href="/pendaftaran" variant="outline" size="sm">
                                        Hubungi via Pendaftaran
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Accordion
                                allowMultiple
                                items={filtered.map((f) => ({
                                    id: f.id,
                                    question: f.category ? `[${f.category}] ${f.question}` : f.question,
                                    answer: f.answer,
                                }))}
                            />
                        )}
                    </div>
                </Container>
            </section>
        </>
    );
}
