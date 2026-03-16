import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import api from '../hooks/useApi';
import type { Service } from '../types';
import PageHero from '../components/common/PageHero';

export default function ServicesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as 'tg' | 'ru' | 'en';

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: () => api.get('/services').then(r => r.data),
  });

  return (
    <>
      <PageHero pageKey="services_hero" fallbackImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=2000&q=80">
        <div className="container"><div className="hero-content"><h1>{t('services.title')}</h1><p>{t('services.subtitle')}</p></div></div>
      </PageHero>

      <section className="section">
        <div className="container">
          {isLoading && <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>{t('common.loading')}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
            {services?.map((s, i) => (
              <div key={s.id} className={`service-block ${i % 2 !== 0 ? 'reverse' : ''}`}>
                <div className="service-image">
                  <img src={s.image_url} alt={s[`title_${lang}`]} loading="lazy" />
                </div>
                <div className="service-content">
                  <div className="service-category">{s[`category_${lang}`]}</div>
                  <h2>{s[`title_${lang}`]}</h2>
                  <p>{s[`description_${lang}`]}</p>
                  <ul className="service-features">
                    {s.features?.map(f => (
                      <li key={f.id}><FontAwesomeIcon icon={faCheckCircle} />{f[`feature_${lang}`]}</li>
                    ))}
                  </ul>
                  <Link to="/contact" className="btn" style={{ marginTop: 20 }}>
                    {t('contact.title')} <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .service-block { display: grid; grid-template-columns: 1fr 1.2fr; gap: 50px; align-items: center; }
        .service-block.reverse { direction: rtl; }
        .service-block.reverse > * { direction: ltr; }
        .service-image img { width: 100%; border-radius: 15px; box-shadow: var(--shadow); object-fit: cover; height: 380px; }
        .service-category { display: inline-block; background: var(--accent); color: white; padding: 5px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; margin-bottom: 15px; }
        .service-content h2 { font-size: 2rem; color: var(--primary-dark); margin-bottom: 15px; }
        .service-content > p { color: var(--text-light); line-height: 1.8; margin-bottom: 20px; }
        .service-features { list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .service-features li { display: flex; align-items: center; gap: 12px; color: var(--text); }
        .service-features li svg { color: var(--primary); font-size: 1.1rem; flex-shrink: 0; }
        @media (max-width: 900px) { .service-block, .service-block.reverse { grid-template-columns: 1fr; direction: ltr; } .service-image img { height: 250px; } }
      `}</style>
    </>
  );
}
