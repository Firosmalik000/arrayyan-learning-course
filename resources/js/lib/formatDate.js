const normalizeIsoString = (value) => {
    if (!value) return null;
    const raw = value.toString().trim();
    if (!raw) return null;

    const isoLike = /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?)?(Z|[+-]\d{2}:\d{2})?$/;
    if (!isoLike.test(raw)) return null;

    let normalized = raw.includes(' ') ? raw.replace(' ', 'T') : raw;
    normalized = normalized.replace(/\.(\d{3})\d+(?=Z|[+-]\d{2}:\d{2}|$)/, '.$1');

    return normalized;
};

export const parseDateValue = (value) => {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    if (typeof value === 'number') {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const raw = value.toString().trim();
    if (!raw) return null;

    const normalizedIso = normalizeIsoString(raw);
    if (normalizedIso) {
        const date = new Date(normalizedIso);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const hasLetters = /[a-zA-Z]/.test(raw);
    if (hasLetters) return null;

    const fallbackDate = new Date(raw);
    return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
};

export const formatDate = (value, lang = 'id') => {
    if (!value) return '-';
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }

    const parsed = parseDateValue(value);
    if (!parsed) {
        const raw = value.toString().trim();
        return raw || '-';
    }

    return parsed.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};
