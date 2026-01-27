import { Head } from '@inertiajs/react';
import { useState } from 'react';

// Mock data yang sesuai dengan Home.jsx
const initialData = {
    hero: {
        eyebrow: 'Ar Rayyan Learning Course',
        title: {
            id: 'Membimbing dengan Hati, Mencetak Generasi Berprestasi',
            en: 'Guiding with Heart, Shaping Achieving Generations',
        },
        description: {
            id: 'Ar Rayyan Learning Course (ALC) hadir sebagai mitra belajar yang hangat, islami, dan profesional. Kami mendampingi anak-anak mencapai prestasi terbaik dengan metode yang terstruktur, menyenangkan, dan mudah dipahami orang tua.',
            en: 'Ar Rayyan Learning Course (ALC) is a warm, Islamic, and professional learning partner. We help children achieve their best through structured, engaging lessons that parents can easily follow.',
        },
        ctaPrimary: { id: 'Daftar Sekarang', en: 'Enroll Now' },
        ctaSecondary: { id: 'Lihat Program Belajar', en: 'Explore Programs' },
        badges: [
            { title: { id: '50+ Pengajar', en: '50+ Tutors' }, detail: { id: 'Berpengalaman', en: 'Experienced' } },
            { title: { id: 'Belajar Islami', en: 'Islamic Values' }, detail: { id: 'Nilai dan karakter', en: 'Character first' } },
            { title: { id: 'Fleksibel', en: 'Flexible' }, detail: { id: 'Offline / Online', en: 'Offline / Online' } },
        ],
    },
    whyAlc: {
        eyebrow: 'ALC',
        title: { id: 'Kenapa Memilih ALC', en: 'Why Choose ALC' },
        subtitle: {
            id: 'Layanan belajar dengan sistem rapi, ramah anak, dan mudah dipahami orang tua.',
            en: 'A well-structured learning system that supports students and parents.',
        },
        features: [
            {
                title: { id: 'Bank Soal Terstruktur', en: 'Structured Question Bank' },
                description: { id: 'Latihan bertahap untuk memperkuat pemahaman dan evaluasi.', en: 'Step-by-step exercises to strengthen mastery and evaluation.' },
                icon: 'book',
            },
            {
                title: { id: 'Pengajar Berpengalaman', en: 'Experienced Teachers' },
                description: { id: 'Pendampingan sabar, fokus pada kebutuhan belajar anak.', en: 'Patient guidance focused on each student learning needs.' },
                icon: 'user',
            },
            {
                title: { id: 'Ramah Anak & Orang Tua', en: 'Friendly for Families' },
                description: { id: 'Komunikasi terbuka agar orang tua selalu terlibat.', en: 'Open communication so parents stay informed and involved.' },
                icon: 'heart',
            },
        ],
    },
    profile: {
        eyebrow: 'ALC',
        title: { id: 'Profil Lembaga', en: 'Institution Profile' },
        subtitle: {
            id: 'ALC membangun lingkungan belajar yang aman, hangat, dan berorientasi prestasi.',
            en: 'ALC builds a safe, caring, and achievement-oriented learning environment.',
        },
        aboutTitle: { id: 'Tentang Kami', en: 'About Us' },
        aboutDescription: {
            id: 'ALC adalah lembaga pendidikan yang memadukan nilai islami, pendekatan edukatif, dan kepedulian pada karakter anak.',
            en: 'ALC combines Islamic values, educational methods, and deep care for every child.',
        },
        valuesTitle: { id: 'Nilai Utama', en: 'Core Values' },
        values: [
            { id: 'Edukatif', en: 'Educational' },
            { id: 'Islami', en: 'Islamic' },
            { id: 'Peduli anak', en: 'Child-focused' },
        ],
        levelsTitle: { id: 'Jenjang Pendidikan', en: 'Education Levels' },
        levels: [
            { id: 'Pra TK', en: 'Pre-K' },
            { id: 'TK', en: 'Kindergarten' },
            { id: 'SD / MI', en: 'Elementary' },
            { id: 'SMP', en: 'Junior High' },
            { id: 'SMA', en: 'Senior High' },
        ],
        visionTitle: { id: 'Visi', en: 'Vision' },
        vision: {
            id: 'Menjadi lembaga pendidikan terpercaya yang membentuk generasi berakhlak, cerdas, dan berdaya saing.',
            en: 'To be a trusted education partner that shapes faithful, intelligent, and competitive generations.',
        },
        missionTitle: { id: 'Misi', en: 'Mission' },
        mission: {
            id: 'Memberikan pendampingan belajar berkualitas, mendekatkan anak dengan nilai islami, serta membangun komunikasi aktif dengan orang tua.',
            en: 'Deliver quality learning guidance, bring children closer to Islamic values, and build strong communication with parents.',
        },
    },
    program: {
        eyebrow: 'Program',
        title: { id: 'Program & Paket Belajar', en: 'Learning Programs & Packages' },
        subtitle: {
            id: 'Paket belajar yang fleksibel untuk kebutuhan siswa dan keluarga.',
            en: 'Flexible learning packages tailored to every student.',
        },
        items: [
            {
                name: { id: 'Reguler', en: 'Regular' },
                level: { id: 'Pra TK - SMA', en: 'Pre-K - Senior High' },
                subjects: { id: 'Calistung, Matematika, Bahasa Inggris', en: 'Reading, Math, English' },
                sessions: { id: '8 pertemuan / bulan', en: '8 sessions / month' },
                mode: { id: 'Offline / Online', en: 'Offline / Online' },
            },
            {
                name: { id: 'Intensif', en: 'Intensive' },
                level: { id: 'SD - SMA', en: 'Elementary - Senior High' },
                subjects: { id: 'Penguatan konsep + latihan soal', en: 'Concept reinforcement + practice' },
                sessions: { id: '12 pertemuan / bulan', en: '12 sessions / month' },
                mode: { id: 'Offline / Hybrid', en: 'Offline / Hybrid' },
            },
            {
                name: { id: 'Privat / Semi Privat', en: 'Private / Semi Private' },
                level: { id: 'TK - SMA', en: 'Kindergarten - Senior High' },
                subjects: { id: 'Menyesuaikan kebutuhan siswa', en: 'Customized to student needs' },
                sessions: { id: 'Fleksibel', en: 'Flexible' },
                mode: { id: 'Offline / Online', en: 'Offline / Online' },
            },
            {
                name: { id: 'Persiapan Ujian / Olimpiade', en: 'Exam / Olympiad Prep' },
                level: { id: 'SD - SMA', en: 'Elementary - Senior High' },
                subjects: { id: 'Try out, pembahasan, strategi', en: 'Try out, review, strategy' },
                sessions: { id: 'Program khusus', en: 'Special program' },
                mode: { id: 'Offline / Online', en: 'Offline / Online' },
            },
        ],
    },
    stats: {
        items: [
            { value: '50+', label: { id: 'Pengajar Aktif', en: 'Active Tutors' } },
            { value: '500+', label: { id: 'Siswa Terbimbing', en: 'Students Guided' } },
            { value: '30+', label: { id: 'Program Belajar', en: 'Learning Programs' } },
            { value: '10+', label: { id: 'Tahun Berpengalaman', en: 'Years of Experience' } },
        ],
    },
    olympiad: {
        eyebrow: 'Prestasi',
        title: { id: 'Info Olimpiade', en: 'Olympiad Info' },
        subtitle: {
            id: 'Pantau jadwal lomba dan persiapan prestasi siswa.',
            en: 'Stay updated with competitions and schedules.',
        },
        items: [
            {
                name: { id: 'Olimpiade Sains Nasional', en: 'National Science Olympiad' },
                level: { id: 'SD - SMA', en: 'Elementary - Senior High' },
                schedule: { id: 'Februari - April', en: 'February - April' },
                category: { id: 'Gratis', en: 'Free' },
            },
            {
                name: { id: 'Matematika Islami Challenge', en: 'Islamic Math Challenge' },
                level: { id: 'SD / SMP', en: 'Elementary / Junior High' },
                schedule: { id: 'Mei - Juni', en: 'May - June' },
                category: { id: 'Berbayar', en: 'Paid' },
            },
            {
                name: { id: 'English Creative Olympiad', en: 'English Creative Olympiad' },
                level: { id: 'SMP / SMA', en: 'Junior / Senior High' },
                schedule: { id: 'Agustus', en: 'August' },
                category: { id: 'Gratis', en: 'Free' },
            },
        ],
    },
    contact: {
        eyebrow: 'Hubungi Kami',
        title: { id: 'Kontak & Informasi', en: 'Contact & Information' },
        subtitle: {
            id: 'Hubungi kami untuk konsultasi program belajar terbaik.',
            en: 'Reach us anytime for the best learning consultation.',
        },
        whatsapp: '+62 812-3456-7890',
        instagram: '@alclearning',
        email: 'info@alclearning.id',
        address: { id: 'Jl. Pendidikan Islami No. 8, Bandung, Jawa Barat 40123', en: 'Jl. Pendidikan Islami No. 8, Bandung, West Java 40123' },
        hours: {
            weekday: { id: 'Senin - Jumat: 08:00 - 20:00', en: 'Mon - Fri: 08:00 - 20:00' },
            weekend: { id: 'Sabtu: 08:00 - 16:00', en: 'Sat: 08:00 - 16:00' },
        },
    },
};

const tabs = [
    { id: 'hero', label: 'Hero', icon: '🏠' },
    { id: 'why', label: 'Kenapa ALC', icon: '✨' },
    { id: 'profile', label: 'Profil', icon: '🏫' },
    { id: 'program', label: 'Program', icon: '📚' },
    { id: 'stats', label: 'Statistik', icon: '📊' },
    { id: 'olympiad', label: 'Olimpiade', icon: '🏆' },
    { id: 'contact', label: 'Kontak', icon: '📞' },
];

const iconOptions = [
    { value: 'book', label: 'Buku' },
    { value: 'user', label: 'User' },
    { value: 'heart', label: 'Hati' },
    { value: 'trophy', label: 'Piala' },
    { value: 'clock', label: 'Jam' },
    { value: 'users', label: 'Grup' },
];

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100';

function LanguageToggle({ value, onChange }) {
    return (
        <div className="inline-flex items-center rounded-full bg-slate-100 p-1">
            <button
                type="button"
                onClick={() => onChange('id')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${value === 'id' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                🇮🇩 ID
            </button>
            <button
                type="button"
                onClick={() => onChange('en')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${value === 'en' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                🇬🇧 EN
            </button>
        </div>
    );
}

function FieldLabel({ children, required }) {
    return (
        <label className="mb-1.5 block text-xs font-medium text-slate-600">
            {children}
            {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
    );
}

function BilingualField({ label, data, path, lang, onChange, textarea = false, rows = 3, required = false }) {
    const value = data[lang] || '';
    return (
        <div>
            <FieldLabel required={required}>{label}</FieldLabel>
            {textarea ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(`${path}.${lang}`, e.target.value)}
                    className={`${inputClass} resize-none`}
                    rows={rows}
                    placeholder={`Masukkan ${label.toLowerCase()}...`}
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(`${path}.${lang}`, e.target.value)}
                    className={inputClass}
                    placeholder={`Masukkan ${label.toLowerCase()}...`}
                />
            )}
        </div>
    );
}

function Card({ children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
            {children}
        </div>
    );
}

function CardHeader({ icon, title, subtitle, actions }) {
    return (
        <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
                {icon && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-lg">
                        {icon}
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
                </div>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}

function ItemCard({ children, onDelete, title }) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50">
            <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <svg className={`h-4 w-4 text-slate-400 transition ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-medium text-slate-700">{title}</span>
                </div>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            {isOpen && <div className="border-t border-slate-200 p-4">{children}</div>}
        </div>
    );
}

function AddButton({ onClick, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-4 text-sm font-medium text-slate-500 transition hover:border-violet-400 hover:bg-violet-50 hover:text-violet-600"
        >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {label}
        </button>
    );
}

function SectionHeader({ data, path, lang, onChange, showEyebrow = true }) {
    return (
        <Card>
            <CardHeader icon="📝" title="Judul Section" subtitle="Atur judul dan subtitle yang tampil di section ini" />
            <div className="space-y-4">
                {showEyebrow && (
                    <div>
                        <FieldLabel>Eyebrow (Label kecil di atas judul)</FieldLabel>
                        <input
                            type="text"
                            value={data.eyebrow || ''}
                            onChange={(e) => onChange(`${path}.eyebrow`, e.target.value)}
                            className={inputClass}
                            placeholder="contoh: ALC, Program, Prestasi..."
                        />
                    </div>
                )}
                <BilingualField label="Judul" data={data.title} path={`${path}.title`} lang={lang} onChange={onChange} required />
                <BilingualField label="Subtitle" data={data.subtitle} path={`${path}.subtitle`} lang={lang} onChange={onChange} textarea rows={2} />
            </div>
        </Card>
    );
}

export default function Landing() {
    const [activeTab, setActiveTab] = useState('hero');
    const [data, setData] = useState(initialData);
    const [lang, setLang] = useState('id');
    const [isSaving, setIsSaving] = useState(false);

    const updateData = (path, value) => {
        setData((prev) => {
            const newData = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('Data berhasil disimpan! (Mock)');
        }, 1000);
    };

    return (
        <>
            <Head title="Content Landing" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Content Landing</h1>
                        <p className="mt-1 text-sm text-slate-500">Kelola konten halaman Home</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <LanguageToggle value={lang} onChange={setLang} />
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Simpan
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Language Indicator */}
                <div className={`rounded-xl p-3 text-center text-sm font-medium ${lang === 'id' ? 'bg-violet-50 text-violet-700' : 'bg-amber-50 text-amber-700'}`}>
                    {lang === 'id' ? '🇮🇩 Sedang mengedit konten Bahasa Indonesia' : '🇬🇧 Currently editing English content'}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                                activeTab === tab.id
                                    ? 'bg-violet-600 text-white shadow-sm'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Hero Tab */}
                {activeTab === 'hero' && (
                    <div className="space-y-5">
                        <Card>
                            <CardHeader icon="🎯" title="Hero Utama" subtitle="Headline dan deskripsi utama di bagian atas landing page" />
                            <div className="space-y-4">
                                <div>
                                    <FieldLabel>Eyebrow</FieldLabel>
                                    <input
                                        type="text"
                                        value={data.hero.eyebrow}
                                        onChange={(e) => updateData('hero.eyebrow', e.target.value)}
                                        className={inputClass}
                                        placeholder="contoh: Ar Rayyan Learning Course"
                                    />
                                </div>
                                <BilingualField label="Judul Utama" data={data.hero.title} path="hero.title" lang={lang} onChange={updateData} required />
                                <BilingualField label="Deskripsi" data={data.hero.description} path="hero.description" lang={lang} onChange={updateData} textarea rows={4} />
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <BilingualField label="Tombol CTA Utama" data={data.hero.ctaPrimary} path="hero.ctaPrimary" lang={lang} onChange={updateData} />
                                    <BilingualField label="Tombol CTA Sekunder" data={data.hero.ctaSecondary} path="hero.ctaSecondary" lang={lang} onChange={updateData} />
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <CardHeader icon="🏷️" title="Badges" subtitle="Label/badge yang tampil di bawah tombol CTA" />
                            <div className="space-y-3">
                                {data.hero.badges.map((badge, index) => (
                                    <ItemCard key={index} title={badge.title[lang] || `Badge ${index + 1}`} onDelete={() => {}}>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <BilingualField label="Judul Badge" data={badge.title} path={`hero.badges.${index}.title`} lang={lang} onChange={updateData} />
                                            <BilingualField label="Detail" data={badge.detail} path={`hero.badges.${index}.detail`} lang={lang} onChange={updateData} />
                                        </div>
                                    </ItemCard>
                                ))}
                                <AddButton label="Tambah Badge" onClick={() => {}} />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Why ALC Tab */}
                {activeTab === 'why' && (
                    <div className="space-y-5">
                        <SectionHeader data={data.whyAlc} path="whyAlc" lang={lang} onChange={updateData} />

                        <Card>
                            <CardHeader icon="⭐" title="Feature Cards" subtitle="Kartu fitur unggulan yang ditampilkan" />
                            <div className="space-y-3">
                                {data.whyAlc.features.map((feature, index) => (
                                    <ItemCard key={index} title={feature.title[lang] || `Feature ${index + 1}`} onDelete={() => {}}>
                                        <div className="space-y-4">
                                            <BilingualField label="Judul" data={feature.title} path={`whyAlc.features.${index}.title`} lang={lang} onChange={updateData} required />
                                            <BilingualField label="Deskripsi" data={feature.description} path={`whyAlc.features.${index}.description`} lang={lang} onChange={updateData} textarea rows={2} />
                                            <div>
                                                <FieldLabel>Icon</FieldLabel>
                                                <select
                                                    value={feature.icon}
                                                    onChange={(e) => updateData(`whyAlc.features.${index}.icon`, e.target.value)}
                                                    className={inputClass}
                                                >
                                                    {iconOptions.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </ItemCard>
                                ))}
                                <AddButton label="Tambah Feature" onClick={() => {}} />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-5">
                        <SectionHeader data={data.profile} path="profile" lang={lang} onChange={updateData} />

                        <Card>
                            <CardHeader icon="ℹ️" title="Tentang Kami" subtitle="Deskripsi singkat tentang ALC" />
                            <div className="space-y-4">
                                <BilingualField label="Judul" data={data.profile.aboutTitle} path="profile.aboutTitle" lang={lang} onChange={updateData} />
                                <BilingualField label="Deskripsi" data={data.profile.aboutDescription} path="profile.aboutDescription" lang={lang} onChange={updateData} textarea rows={3} />
                            </div>
                        </Card>

                        <div className="grid gap-5 lg:grid-cols-2">
                            <Card>
                                <CardHeader icon="💎" title="Nilai Utama" subtitle="Core values ALC" />
                                <div className="space-y-4">
                                    <BilingualField label="Judul Section" data={data.profile.valuesTitle} path="profile.valuesTitle" lang={lang} onChange={updateData} />
                                    <div className="space-y-2">
                                        {data.profile.values.map((value, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={value[lang]}
                                                    onChange={(e) => updateData(`profile.values.${index}.${lang}`, e.target.value)}
                                                    className={inputClass}
                                                    placeholder={`Nilai ${index + 1}`}
                                                />
                                                <button type="button" className="shrink-0 rounded-lg p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        <AddButton label="Tambah Nilai" onClick={() => {}} />
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <CardHeader icon="🎓" title="Jenjang Pendidikan" subtitle="Level pendidikan yang dilayani" />
                                <div className="space-y-4">
                                    <BilingualField label="Judul Section" data={data.profile.levelsTitle} path="profile.levelsTitle" lang={lang} onChange={updateData} />
                                    <div className="space-y-2">
                                        {data.profile.levels.map((level, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={level[lang]}
                                                    onChange={(e) => updateData(`profile.levels.${index}.${lang}`, e.target.value)}
                                                    className={inputClass}
                                                    placeholder={`Jenjang ${index + 1}`}
                                                />
                                                <button type="button" className="shrink-0 rounded-lg p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        <AddButton label="Tambah Jenjang" onClick={() => {}} />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader icon="🎯" title="Visi & Misi" subtitle="Visi dan misi lembaga" />
                            <div className="space-y-4">
                                <BilingualField label="Judul Visi" data={data.profile.visionTitle} path="profile.visionTitle" lang={lang} onChange={updateData} />
                                <BilingualField label="Isi Visi" data={data.profile.vision} path="profile.vision" lang={lang} onChange={updateData} textarea rows={2} />
                                <BilingualField label="Judul Misi" data={data.profile.missionTitle} path="profile.missionTitle" lang={lang} onChange={updateData} />
                                <BilingualField label="Isi Misi" data={data.profile.mission} path="profile.mission" lang={lang} onChange={updateData} textarea rows={3} />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Program Tab */}
                {activeTab === 'program' && (
                    <div className="space-y-5">
                        <SectionHeader data={data.program} path="program" lang={lang} onChange={updateData} />

                        <Card>
                            <CardHeader icon="📖" title="Daftar Program" subtitle="Program belajar yang ditawarkan" />
                            <div className="space-y-3">
                                {data.program.items.map((program, index) => (
                                    <ItemCard key={index} title={program.name[lang] || `Program ${index + 1}`} onDelete={() => {}}>
                                        <div className="space-y-4">
                                            <BilingualField label="Nama Program" data={program.name} path={`program.items.${index}.name`} lang={lang} onChange={updateData} required />
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <BilingualField label="Jenjang" data={program.level} path={`program.items.${index}.level`} lang={lang} onChange={updateData} />
                                                <BilingualField label="Mode Belajar" data={program.mode} path={`program.items.${index}.mode`} lang={lang} onChange={updateData} />
                                            </div>
                                            <BilingualField label="Mata Pelajaran" data={program.subjects} path={`program.items.${index}.subjects`} lang={lang} onChange={updateData} />
                                            <BilingualField label="Pertemuan" data={program.sessions} path={`program.items.${index}.sessions`} lang={lang} onChange={updateData} />
                                        </div>
                                    </ItemCard>
                                ))}
                                <AddButton label="Tambah Program" onClick={() => {}} />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Stats Tab */}
                {activeTab === 'stats' && (
                    <div className="space-y-5">
                        <Card>
                            <CardHeader icon="📈" title="Statistik" subtitle="Angka-angka pencapaian ALC yang ditampilkan" />
                            <div className="space-y-3">
                                {data.stats.items.map((stat, index) => (
                                    <ItemCard key={index} title={`${stat.value} - ${stat.label[lang]}`} onDelete={() => {}}>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <FieldLabel required>Angka/Nilai</FieldLabel>
                                                <input
                                                    type="text"
                                                    value={stat.value}
                                                    onChange={(e) => updateData(`stats.items.${index}.value`, e.target.value)}
                                                    className={inputClass}
                                                    placeholder="contoh: 50+, 100%, 10+"
                                                />
                                            </div>
                                            <BilingualField label="Label" data={stat.label} path={`stats.items.${index}.label`} lang={lang} onChange={updateData} required />
                                        </div>
                                    </ItemCard>
                                ))}
                                <AddButton label="Tambah Statistik" onClick={() => {}} />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Olympiad Tab */}
                {activeTab === 'olympiad' && (
                    <div className="space-y-5">
                        <SectionHeader data={data.olympiad} path="olympiad" lang={lang} onChange={updateData} />

                        <Card>
                            <CardHeader icon="🥇" title="Daftar Olimpiade" subtitle="Event olimpiade yang ditampilkan" />
                            <div className="space-y-3">
                                {data.olympiad.items.map((item, index) => (
                                    <ItemCard key={index} title={item.name[lang] || `Olimpiade ${index + 1}`} onDelete={() => {}}>
                                        <div className="space-y-4">
                                            <BilingualField label="Nama Olimpiade" data={item.name} path={`olympiad.items.${index}.name`} lang={lang} onChange={updateData} required />
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <BilingualField label="Jenjang" data={item.level} path={`olympiad.items.${index}.level`} lang={lang} onChange={updateData} />
                                                <BilingualField label="Jadwal" data={item.schedule} path={`olympiad.items.${index}.schedule`} lang={lang} onChange={updateData} />
                                            </div>
                                            <BilingualField label="Kategori" data={item.category} path={`olympiad.items.${index}.category`} lang={lang} onChange={updateData} />
                                        </div>
                                    </ItemCard>
                                ))}
                                <AddButton label="Tambah Olimpiade" onClick={() => {}} />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                    <div className="space-y-5">
                        <SectionHeader data={data.contact} path="contact" lang={lang} onChange={updateData} />

                        <div className="grid gap-5 lg:grid-cols-2">
                            <Card>
                                <CardHeader icon="📱" title="Sosial Media" subtitle="Link kontak sosial media ALC" />
                                <div className="space-y-4">
                                    <div>
                                        <FieldLabel>WhatsApp</FieldLabel>
                                        <div className="flex gap-2">
                                            <span className="flex items-center rounded-l-xl bg-green-50 px-3 text-green-600">
                                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                </svg>
                                            </span>
                                            <input
                                                type="text"
                                                value={data.contact.whatsapp}
                                                onChange={(e) => updateData('contact.whatsapp', e.target.value)}
                                                className={`${inputClass} rounded-l-none`}
                                                placeholder="+62 xxx-xxxx-xxxx"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <FieldLabel>Instagram</FieldLabel>
                                        <div className="flex gap-2">
                                            <span className="flex items-center rounded-l-xl bg-pink-50 px-3 text-pink-600">
                                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                                </svg>
                                            </span>
                                            <input
                                                type="text"
                                                value={data.contact.instagram}
                                                onChange={(e) => updateData('contact.instagram', e.target.value)}
                                                className={`${inputClass} rounded-l-none`}
                                                placeholder="@username"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <FieldLabel>Email</FieldLabel>
                                        <div className="flex gap-2">
                                            <span className="flex items-center rounded-l-xl bg-violet-50 px-3 text-violet-600">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4zM4 7l8 6 8-6" />
                                                </svg>
                                            </span>
                                            <input
                                                type="email"
                                                value={data.contact.email}
                                                onChange={(e) => updateData('contact.email', e.target.value)}
                                                className={`${inputClass} rounded-l-none`}
                                                placeholder="email@domain.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <CardHeader icon="🏢" title="Alamat & Jam Operasional" subtitle="Lokasi dan waktu layanan" />
                                <div className="space-y-4">
                                    <BilingualField label="Alamat Lengkap" data={data.contact.address} path="contact.address" lang={lang} onChange={updateData} textarea rows={2} />
                                    <BilingualField label="Jam Kerja (Senin - Jumat)" data={data.contact.hours.weekday} path="contact.hours.weekday" lang={lang} onChange={updateData} />
                                    <BilingualField label="Jam Kerja (Sabtu)" data={data.contact.hours.weekend} path="contact.hours.weekend" lang={lang} onChange={updateData} />
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
