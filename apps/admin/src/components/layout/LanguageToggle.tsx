import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const NEXT_LANG: Record<string, 'ko' | 'en'> = {
    ko: 'en',
    en: 'ko',
};

const LanguageToggle = () => {
    const { i18n, t } = useTranslation();
    const current = (i18n.resolvedLanguage ?? i18n.language ?? 'ko').slice(0, 2);
    const next = NEXT_LANG[current] ?? 'en';

    const handleClick = () => {
        void i18n.changeLanguage(next);
    };

    return (
        <button
            type="button"
            className="lang-toggle"
            onClick={handleClick}
            aria-label={t('nav.language')}
            title={t('nav.language')}
        >
            <Globe size={18} />
            <span className="lang-label">{current.toUpperCase()}</span>

            <style>{`
                .lang-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: none;
                    border: 1px solid hsl(var(--color-border));
                    border-radius: var(--radius-md);
                    color: hsl(var(--color-text-muted));
                    cursor: pointer;
                    padding: 4px 10px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    transition: var(--transition-base);
                }
                .lang-toggle:hover {
                    color: hsl(var(--color-text-main));
                    border-color: hsl(var(--color-text-muted));
                }
                .lang-label {
                    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
                }
            `}</style>
        </button>
    );
};

export default LanguageToggle;
