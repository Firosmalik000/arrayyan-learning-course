/**
 * Data module index
 * Central export for all shared data and content
 *
 * Page-specific data should be in each page's folder:
 * - Pages/Public/Home/data.js
 * - Pages/Public/Olympiad/data.js
 * - Pages/Public/Register/data.js
 */

// Animations
export * from './animations';

// Icons
export { icons, toneStyles } from './icons';

// Site-wide content (shared across pages)
export { siteConfig, contactInfo, operatingHours, stats } from './content/site';

// Programs content (shared across pages)
export {
    packages,
    olympiadHighlights,
    getLocalizedPackages,
    getLocalizedOlympiads,
} from './content/programs';
