import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '../hooks/useApi';
import type { Project } from '../types';
import PageHero from '../components/common/PageHero';

export default function ProjectsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as 'tg' | 'ru' | 'en';
  const [category, setCategory] = useState('all');

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data),
  });

  const categories = ['all', 'solar', 'energy', 'education', 'conference', 'women', 'sme'];
  const filtered = projects?.filter(p => category === 'all' || p.category === category);

  return (
    <>
      <PageHero pageKey="projects_hero" fallbackImage="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=2000&q=80">
        <div className="container">
          <div className="hero-content">
            <h1>{t('projects.title')}</h1>
            <p>{t('projects.subtitle')}</p>
          </div>
        </div>
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="filter-tabs">
            {categories.map(c => (
              <button key={c} className={`filter-btn${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>
                {c === 'all' ? t('projects.all') : (t(`projects.${c}`) || c)}
              </button>
            ))}
          </div>

          {isLoading && <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>{t('common.loading')}</p>}

          <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 30 }}>
            {filtered?.map(p => (
              <div className="project-card" key={p.id} style={{ background: 'var(--white)', borderRadius: 15, overflow: 'hidden', boxShadow: 'var(--shadow)', transition: 'var(--transition)' }}>
                <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                  <img src={p.image_url} alt={p[`title_${lang}`]} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 15, left: 15, background: 'var(--primary)', color: 'white', padding: '5px 14px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600 }}>
                    {t(`projects.${p.category}`) || p.category}
                  </div>
                </div>
                <div style={{ padding: 25 }}>
                  <div style={{ display: 'flex', gap: 15, fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 12 }}>
                    <span>📍 {p[`location_${lang}`]}</span>
                    <span>📅 {p.year}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-dark)', marginBottom: 10 }}>{p[`title_${lang}`]}</h3>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: 1.7 }}>{p[`description_${lang}`]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .filter-tabs { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; }
        .filter-btn { padding: 10px 24px; border-radius: 30px; border: 2px solid var(--primary); background: transparent; color: var(--primary); font-weight: 600; cursor: pointer; transition: var(--transition); font-family: 'Montserrat', sans-serif; }
        .filter-btn.active, .filter-btn:hover { background: var(--primary); color: white; }
        .project-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,.15) !important; }
      `}</style>
    </>
  );
}
