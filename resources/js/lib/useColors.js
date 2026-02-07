import { usePage } from '@inertiajs/react';

/**
 * Hook to get dynamic brand colors from SEO settings
 * Falls back to default colors if not set
 */
export function useColors() {
    const { seoSettings } = usePage().props;
    const colors = seoSettings?.colors || {};

    return {
        primary: colors.primary || '#7c3aed',
        secondary: colors.secondary || '#f59e0b',
        accent: colors.accent || '#10b981',
    };
}

/**
 * Get CSS variable value for dynamic colors
 */
export function getColorVar(colorName) {
    const colorMap = {
        primary: 'var(--color-primary, #7c3aed)',
        secondary: 'var(--color-secondary, #f59e0b)',
        accent: 'var(--color-accent, #10b981)',
    };
    return colorMap[colorName] || colorMap.primary;
}

export default useColors;
