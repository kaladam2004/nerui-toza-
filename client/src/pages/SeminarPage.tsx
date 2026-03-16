import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import api from '../hooks/useApi';
import type { Seminar } from '../types';

export default function SeminarPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as 'tg' | 'ru' | 'en';

  const { data: seminars } = useQuery<Seminar[]>({
    queryKey: ['seminars'],
    queryFn: () => api.get('/seminars').then(r => r.data),
  });

  const upcoming = seminars?.filter(s => s.is_upcoming === 1);
  const past     = seminars?.filter(s => s.is_upcoming !== 1);

  return (
    <>
      <section className="page-hero" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=2000&q=80')" }}>
        <div className="container"><div className="hero-content"><h1>{t('seminar.title')}</h1><p>{t('seminar.subtitle')}</p></div></div>
      </section>

      <section className="section">
        <div className="container">
          {upcoming && upcoming.length > 0 && (
            <>
              <div className="section-title"><h2>{t('seminar.upcoming')}</h2><div className="divider" /></div>
              <div className="seminars-grid" style={{ marginBottom: 80 }}>
                {upcoming.map(s => <SeminarCard key={s.id} seminar={s} lang={lang} t={t} upcoming />)}
              </div>
            </>
          )}
          {past && past.length > 0 && (
            <>
              <div className="section-title"><h2>{t('seminar.past')}</h2><div className="divider" /></div>
              <div className="seminars-grid">
                {past.map(s => <SeminarCard key={s.id} seminar={s} lang={lang} t={t} />)}
              </div>
            </>
          )}
        </div>
      </section>

      <style>{`
        .seminars-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; }
      `}</style>
    </>
  );
}

function SeminarCard({ seminar: s, lang, t, upcoming }: { seminar: Seminar; lang: 'tg'|'ru'|'en'; t: any; upcoming?: boolean }) {
  return (
    <div style={{ background: 'var(--white)', borderRadius: 15, overflow: 'hidden', boxShadow: 'var(--shadow)', transition: 'var(--transition)' }}>
      {s.image_url && <img src={s.image_url} alt={s[`title_${lang}`]} style={{ width: '100%', height: 200, objectFit: 'cover' }} loading="lazy" />}
      <div style={{ padding: 25 }}>
        {upcoming && <span style={{ background: 'var(--accent)', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>{t('seminar.upcoming')}</span>}
        <h3 style={{ color: 'var(--primary-dark)', margin: '12px 0 10px', fontSize: '1.15rem' }}>{s[`title_${lang}`]}</h3>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 15, lineHeight: 1.7 }}>{s[`description_${lang}`]}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9rem', color: 'var(--text-light)' }}>
          <span><FontAwesomeIcon icon={faCalendar} style={{ color: 'var(--primary)', marginRight: 8 }} />{new Date(s.date).toLocaleDateString()}</span>
          <span><FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: 'var(--primary)', marginRight: 8 }} />{s[`location_${lang}`]}</span>
        </div>
      </div>
    </div>
  );
}
