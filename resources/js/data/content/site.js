/**
 * Site-wide content and configuration
 * Contact info, social links, operating hours
 */

export const siteConfig = {
    name: 'Ar Rayyan Learning Course',
    shortName: 'ALC',
    tagline: {
        id: 'Pendampingan Belajar yang Aman, Nyaman, dan Terarah',
        en: 'Safe, Comfortable, and Guided Learning Support',
    },
};

export const contactInfo = {
    whatsapp: {
        number: '+62 812-3456-7890',
        link: 'https://wa.me/6281234567890',
    },
    instagram: {
        handle: '@alclearning',
        link: 'https://instagram.com/alclearning',
    },
    email: {
        address: 'info@alclearning.id',
        link: 'mailto:info@alclearning.id',
    },
    socials: [
        {
            key: 'whatsapp',
            label: { id: 'WhatsApp', en: 'WhatsApp' },
            value: '+62 812-3456-7890',
            link: 'https://wa.me/6281234567890',
            icon: 'whatsapp',
            tone: 'green',
        },
        {
            key: 'instagram',
            label: { id: 'Instagram', en: 'Instagram' },
            value: '@alclearning',
            link: 'https://instagram.com/alclearning',
            icon: 'instagram',
            tone: 'rose',
        },
        {
            key: 'email',
            label: { id: 'Email', en: 'Email' },
            value: 'info@alclearning.id',
            link: 'mailto:info@alclearning.id',
            icon: 'mail',
            tone: 'violet',
        },
    ],
    address: {
        id: 'Jl. Pendidikan Islami No. 8, Bandung, Jawa Barat 40123',
        en: 'Jl. Pendidikan Islami No. 8, Bandung, West Java 40123',
        mapLink: 'https://maps.google.com',
    },
};

export const operatingHours = {
    id: {
        weekday: 'Sen - Jum: 08:00 - 20:00',
        weekend: 'Sabtu: 08:00 - 16:00',
    },
    en: {
        weekday: 'Mon - Fri: 08:00 - 20:00',
        weekend: 'Sat: 08:00 - 16:00',
    },
};

export const stats = {
    id: [
        { value: '50+', label: 'Pengajar Aktif', icon: 'users', tone: 'violet' },
        { value: '500+', label: 'Siswa Terbimbing', icon: 'trophy', tone: 'amber' },
        { value: '30+', label: 'Program Belajar', icon: 'book', tone: 'violet' },
        { value: '10+', label: 'Tahun Berpengalaman', icon: 'clock', tone: 'amber' },
    ],
    en: [
        { value: '50+', label: 'Active Tutors', icon: 'users', tone: 'violet' },
        { value: '500+', label: 'Students Guided', icon: 'trophy', tone: 'amber' },
        { value: '30+', label: 'Learning Programs', icon: 'book', tone: 'violet' },
        { value: '10+', label: 'Years of Experience', icon: 'clock', tone: 'amber' },
    ],
};
