/**
 * Framer Motion animation variants
 * Reusable across all components
 */

export const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
};

export const fadeDown = {
    hidden: { opacity: 0, y: -24 },
    visible: { opacity: 1, y: 0 },
};

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

export const stagger = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

export const staggerFast = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

export const staggerSlow = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.2,
        },
    },
};

export const scaleUp = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
};

export const slideInLeft = {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
};

export const slideInRight = {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0 },
};
