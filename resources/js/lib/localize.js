/**
 * Ambil string lokal dari nilai yang bisa berupa string atau { id, en }.
 * Standarisasi akses konten bilingual di seluruh halaman.
 *
 * @param {string|object|null|undefined} value
 * @param {string} lang - 'id' | 'en'
 * @param {string} fallback
 * @returns {string}
 */
export function localizeField(value, lang = 'id', fallback = '') {
    if (value == null) {
        return fallback;
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'object') {
        const localized = value[lang] ?? value.id ?? value.en ?? fallback;

        if (localized && typeof localized === 'object') {
            return localized[lang] ?? localized.id ?? localized.en ?? fallback;
        }

        return localized ?? fallback;
    }

    return fallback;
}

export default localizeField;
