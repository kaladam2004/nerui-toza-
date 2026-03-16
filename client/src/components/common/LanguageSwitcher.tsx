import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.substring(0, 2);

  return (
    <div className="language-switcher">
      {(['tg', 'ru', 'en'] as const).map(lang => (
        <button
          key={lang}
          className={`lang-btn${current === lang ? ' active' : ''}`}
          onClick={() => i18n.changeLanguage(lang)}
        >
          {lang === 'tg' ? 'TJ' : lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
