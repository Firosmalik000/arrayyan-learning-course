import { Head, usePage } from '@inertiajs/react';
import { useI18n } from '@/lib/i18n';

/**
 * SeoHead - Reusable SEO component for all pages
 *
 * Features:
 * - Dynamic title with site name suffix
 * - Meta description
 * - Open Graph tags (Facebook, WhatsApp, etc.)
 * - Twitter Card tags
 * - Canonical URL
 * - JSON-LD structured data
 * - Robots directives
 *
 * @param {Object} props
 * @param {string} props.title - Page title (required)
 * @param {string} props.description - Meta description
 * @param {string} props.image - OG/Twitter image URL (absolute)
 * @param {string} props.type - Page type: website, article, event, product (default: website)
 * @param {string} props.url - Canonical URL (auto-generated if not provided)
 * @param {Object} props.structuredData - Additional JSON-LD data to merge
 * @param {boolean} props.noIndex - Set noindex for this page
 * @param {string} props.keywords - Meta keywords
 */
export default function SeoHead({
    title,
    description,
    image,
    type = 'website',
    url,
    structuredData,
    noIndex = false,
    keywords,
}) {
    const { language } = useI18n();
    const { seoSettings, url: currentUrl } = usePage().props;

    // Get settings with fallbacks
    const settings = seoSettings || {};
    const general = settings.general || {};
    const contact = settings.contact || {};
    const social = settings.social || {};
    const advanced = settings.advanced || {};

    // Resolve values with language support
    const siteName = general.siteName?.[language] || general.siteName?.id || 'Ar Rayyan Learning Course';
    const defaultDescription = general.defaultDescription?.[language] || general.defaultDescription?.id || '';
    const defaultKeywords = general.keywords || '';

    // Build full title
    const fullTitle = title ? `${title} - ${siteName}` : siteName;

    // Use provided description or default
    const metaDescription = description || defaultDescription;

    // Build canonical URL
    const canonicalBase = advanced.canonicalBase || (typeof window !== 'undefined' ? window.location.origin : '');
    const canonicalUrl = url || currentUrl || '';

    // OG Image - use provided or default
    const ogImage = image || social.ogImage?.url || '';

    // Twitter handle
    const twitterHandle = social.twitterHandle || '';

    // Robots directive
    const robotsContent = noIndex ? 'noindex, nofollow' : (advanced.robotsDefault || 'index, follow');

    // Build Organization structured data from contact info
    const buildOrganizationSchema = () => {
        if (!siteName) return null;

        const schema = {
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: siteName,
            url: canonicalBase,
        };

        if (contact.logo?.url) {
            schema.logo = contact.logo.url;
        }

        if (contact.phone) {
            schema.telephone = contact.phone;
        }

        if (contact.email) {
            schema.email = contact.email;
        }

        if (contact.address?.streetAddress) {
            schema.address = {
                '@type': 'PostalAddress',
                streetAddress: contact.address.streetAddress,
                addressLocality: contact.address.addressLocality,
                addressRegion: contact.address.addressRegion,
                postalCode: contact.address.postalCode,
                addressCountry: contact.address.addressCountry || 'ID',
            };
        }

        // Build sameAs from social links
        const socialLinks = (contact.socials || [])
            .filter((s) => s.link)
            .map((s) => s.link);
        if (socialLinks.length > 0) {
            schema.sameAs = socialLinks;
        }

        return schema;
    };

    // Build page-specific structured data
    const buildPageSchema = () => {
        if (!structuredData) return null;
        return {
            '@context': 'https://schema.org',
            ...structuredData,
        };
    };

    const orgSchema = buildOrganizationSchema();
    const pageSchema = buildPageSchema();

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            {metaDescription && <meta name="description" content={metaDescription} />}
            {(keywords || defaultKeywords) && <meta name="keywords" content={keywords || defaultKeywords} />}
            <meta name="robots" content={robotsContent} />

            {/* Canonical URL */}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {/* Open Graph Tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            {metaDescription && <meta property="og:description" content={metaDescription} />}
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
            <meta property="og:site_name" content={siteName} />
            {ogImage && <meta property="og:image" content={ogImage} />}
            <meta property="og:locale" content={language === 'id' ? 'id_ID' : 'en_US'} />

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={fullTitle} />
            {metaDescription && <meta name="twitter:description" content={metaDescription} />}
            {ogImage && <meta name="twitter:image" content={ogImage} />}
            {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

            {/* Site Verification */}
            {advanced.googleVerification && (
                <meta name="google-site-verification" content={advanced.googleVerification} />
            )}
            {advanced.bingVerification && (
                <meta name="msvalidate.01" content={advanced.bingVerification} />
            )}

            {/* JSON-LD Structured Data */}
            {orgSchema && (
                <script type="application/ld+json">
                    {JSON.stringify(orgSchema)}
                </script>
            )}
            {pageSchema && (
                <script type="application/ld+json">
                    {JSON.stringify(pageSchema)}
                </script>
            )}
        </Head>
    );
}
