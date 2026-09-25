import SectionHeader from './Public/SectionHeader';

export default function SectionTitle({
    eyebrow,
    title,
    subtitle,
    align = 'left',
    highlight = false,
    className = '',
}) {
    return (
        <SectionHeader
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            align={align}
            className={className}
        />
    );
}
