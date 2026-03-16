import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSolarPanel, faBiohazard, faLeaf, faArrowRight, faCalculator, faNewspaper } from '@fortawesome/free-solid-svg-icons';
import PageHero from '../components/common/PageHero';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api from '../hooks/useApi';
import type { Project, MapMarker, Settings, NewsItem } from '../types';

gsap.registerPlugin(ScrollTrigger);

// Fix leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' });

const createMarkerIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const markerColors: Record<string, string> = {
  solar: '#f97316', wind: '#3b82f6', energy: '#a855f7', education: '#22c55e',
};

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as 'tg' | 'ru' | 'en';
  const heroRef = useRef<HTMLDivElement>(null);

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects', 'featured'],
    queryFn: () => api.get('/projects?featured=true').then(r => r.data),
  });

  const { data: markers } = useQuery<MapMarker[]>({
    queryKey: ['map-markers'],
    queryFn: () => api.get('/map-markers').then(r => r.data),
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data),
    staleTime: 1000 * 60 * 10,
  });

  const { data: latestNews } = useQuery<NewsItem[]>({
    queryKey: ['news', 'home'],
    queryFn: () => api.get('/news?limit=3').then(r => r.data),
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.from('.hero h1, .hero p', { duration: 1, y: 50, opacity: 0, stagger: 0.2, ease: 'power3.out' });
      gsap.from('.hero-buttons a', { duration: 0.8, y: 30, opacity: 0, stagger: 0.15, delay: 0.4, ease: 'back.out(1.7)' });
      gsap.from('.stat-item', { scrollTrigger: { trigger: '.hero-stats', start: 'top 80%' }, duration: 0.6, y: 30, opacity: 0, stagger: 0.1, ease: 'back.out(1.7)' });

      // Scroll animations
      gsap.utils.toArray<HTMLElement>('.animate').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none none' },
          opacity: 0, y: 50, duration: 0.8, delay: (i % 4) * 0.1,
        });
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const features = [
    { icon: faSolarPanel,  titleKey: 'features.solar_title',     descKey: 'features.solar_desc',     link: '/services' },
    { icon: faBiohazard,   titleKey: 'features.biogas_title',     descKey: 'features.biogas_desc',     link: '/services' },
    { icon: faLeaf,        titleKey: 'features.innovation_title', descKey: 'features.innovation_desc', link: '/about' },
  ];

  const timeline = [
    { year: '2021', titleKey: 'timeline.2021_title', descKey: 'timeline.2021_desc', count: '5+' },
    { year: '2022', titleKey: 'timeline.2022_title', descKey: 'timeline.2022_desc', count: '8+' },
    { year: '2023', titleKey: 'timeline.2023_title', descKey: 'timeline.2023_desc', count: '12+' },
    { year: '2024', titleKey: 'timeline.2024_title', descKey: 'timeline.2024_desc', count: '20+' },
    { year: '2025', titleKey: 'timeline.2025_title', descKey: 'timeline.2025_desc', count: '25+' },
  ];

  return (
    <div ref={heroRef}>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <PageHero pageKey="home_hero" fallbackImage="https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=2000&q=80" className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>{t('hero.title')}</h1>
            <p>{t('hero.subtitle')}</p>
            <div className="hero-buttons">
              <Link to="/projects" className="btn">{t('hero.btn_projects')}</Link>
              <Link to="/about" className="btn btn-outline">{t('hero.btn_timeline')}</Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">{settings?.hero_stats_projects || '25+'}</div>
                <div className="stat-text">{t('hero.stat_projects')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{settings?.hero_stats_capacity || '150кВт'}</div>
                <div className="stat-text">{t('hero.stat_capacity')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{settings?.hero_stats_families || '500+'}</div>
                <div className="stat-text">{t('hero.stat_families')}</div>
              </div>
            </div>
          </div>
        </div>
      </PageHero>

      {/* ─── FEATURES ──────────────────────────────────────────── */}
      <section className="section features" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div className="section-title animate">
            <h2>{t('features.title')}</h2>
            <div className="divider" />
          </div>
          <div className="features-grid">
            {features.map(f => (
              <div className="feature-card animate" key={f.titleKey}>
                <div className="feature-icon">
                  <FontAwesomeIcon icon={f.icon} />
                </div>
                <h3>{t(f.titleKey)}</h3>
                <p>{t(f.descKey)}</p>
                <Link to={f.link} className="btn btn-green-outline" style={{ marginTop: 20 }}>
                  {t('features.learn_more')} <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ──────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--light)' }}>
        <div className="container">
          <div className="section-title animate">
            <h2>{t('timeline.title')}</h2>
            <p>{t('timeline.subtitle')}</p>
            <div className="divider" />
          </div>
          <div className="timeline">
            {timeline.map((item, i) => (
              <div key={item.year} className={`timeline-item animate ${i % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-content">
                  <div className="timeline-year">{item.year}</div>
                  <h3>{t(item.titleKey)}</h3>
                  <p>{t(item.descKey)}</p>
                  <div className="timeline-badge">{item.count} {t('nav.projects')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROJECTS PREVIEW ──────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div className="section-title animate">
            <h2>{t('projects.title')}</h2>
            <p>{t('projects.subtitle')}</p>
            <div className="divider" />
          </div>
          <div className="projects-grid">
            {projects?.slice(0, 3).map(p => (
              <div className="project-card animate" key={p.id}>
                <div className="project-image">
                  <img src={p.image_url} alt={p[`title_${lang}`]} loading="lazy" />
                  <div className="project-badge">{t(`projects.${p.category}`) || p.category}</div>
                </div>
                <div className="project-content">
                  <div className="project-meta">
                    <span>📍 {p[`location_${lang}`]}</span>
                    <span>📅 {p.year}</span>
                  </div>
                  <h3>{p[`title_${lang}`]}</h3>
                  <p>{p[`description_${lang}`]}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 50 }}>
            <Link to="/projects" className="btn">
              {t('projects.view_all')} <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── MAP ───────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--light)' }}>
        <div className="container">
          <div className="section-title animate">
            <h2>{t('map.title')}</h2>
            <p>{t('map.subtitle')}</p>
            <div className="divider" />
          </div>
          <div className="map-wrapper animate" style={{ borderRadius: 15, overflow: 'hidden', height: 500, boxShadow: 'var(--shadow)' }}>
            <MapContainer center={[38.56, 71.0]} zoom={7} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
              />
              {markers?.map(m => (
                <Marker
                  key={m.id}
                  position={[m.latitude, m.longitude]}
                  icon={createMarkerIcon(markerColors[m.marker_type] || 'gray')}
                >
                  <Popup>
                    <strong>{m[`name_${lang}`]}</strong><br />
                    <small>{t('map.project_type')}: {t(`map.${m.marker_type}`)}</small>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            {Object.entries(markerColors).map(([type, color]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: color, border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,.3)' }} />
                <span>{t(`map.${type}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LATEST NEWS ───────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div className="section-title animate">
            <h2><FontAwesomeIcon icon={faNewspaper} style={{ color: 'var(--accent)', marginRight: 12 }} />{t('news.title')}</h2>
            <p>{t('news.subtitle')}</p>
            <div className="divider" />
          </div>
          <div className="news-home-grid">
            {latestNews?.slice(0, 3).map(item => (
              <div className="news-home-card animate" key={item.id}>
                {item.cover_image && (
                  <div className="news-home-img">
                    <img src={item.cover_image} alt={item[`title_${lang}`]} loading="lazy" />
                    {item.media_type === 'youtube' || item.media_type === 'vimeo' ? (
                      <div className="news-play-badge">▶ Video</div>
                    ) : null}
                  </div>
                )}
                {!item.cover_image && (
                  <div className="news-home-img news-home-placeholder">
                    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                      <defs>
                        <linearGradient id={`ng${item.id}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#2e7d32"/>
                          <stop offset="100%" stopColor="#8bc34a"/>
                        </linearGradient>
                      </defs>
                      <rect width="400" height="220" fill={`url(#ng${item.id})`}/>
                      <circle cx="200" cy="85" r="35" fill="rgba(255,255,255,.25)"/>
                      <line x1="200" y1="38" x2="200" y2="24" stroke="rgba(255,255,255,.6)" strokeWidth="5" strokeLinecap="round"/>
                      <line x1="235" y1="50" x2="247" y2="38" stroke="rgba(255,255,255,.6)" strokeWidth="5" strokeLinecap="round"/>
                      <line x1="248" y1="85" x2="262" y2="85" stroke="rgba(255,255,255,.6)" strokeWidth="5" strokeLinecap="round"/>
                      <line x1="165" y1="50" x2="153" y2="38" stroke="rgba(255,255,255,.6)" strokeWidth="5" strokeLinecap="round"/>
                      <line x1="152" y1="85" x2="138" y2="85" stroke="rgba(255,255,255,.6)" strokeWidth="5" strokeLinecap="round"/>
                      <path d="M200 120 Q200 150 200 175" stroke="rgba(255,255,255,.6)" strokeWidth="5" strokeLinecap="round" fill="none"/>
                      <path d="M200 155 Q178 143 170 148 Q174 162 200 160" fill="rgba(255,255,255,.5)"/>
                      <path d="M200 142 Q222 130 230 135 Q226 149 200 155" fill="rgba(255,255,255,.35)"/>
                      <text x="200" y="205" textAnchor="middle" fill="rgba(255,255,255,.8)" fontSize="12" fontFamily="Montserrat,sans-serif">НЕРӮИ ТОЗА</text>
                    </svg>
                  </div>
                )}
                <div className="news-home-body">
                  <span className="news-cat-badge">{t(`news.${item.category}`) || item.category}</span>
                  <h3>{item[`title_${lang}`]}</h3>
                  {item.published_at && (
                    <p className="news-date">📅 {new Date(item.published_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/news" className="btn">
              {t('news.read_more')} <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CALCULATOR CTA ─────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 250, height: 250, borderRadius: '50%', background: 'rgba(139,195,74,.15)' }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>☀️</div>
          <h2 style={{ color: 'white', fontFamily: 'Playfair Display, serif', fontSize: '2.4rem', marginBottom: 16 }}>
            {lang === 'tg' ? 'Ҳисоби нерӯи офтобӣ' : lang === 'ru' ? 'Калькулятор солнечной энергии' : 'Solar Energy Calculator'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.85)', fontSize: '1.15rem', maxWidth: 600, margin: '0 auto 35px', lineHeight: 1.8 }}>
            {lang === 'tg' && 'Бидонед, ки чанд панели офтобӣ лозим аст, чанд пул сарфа мешавад ва дар чанд сол сармоя баргашт мекунад'}
            {lang === 'ru' && 'Узнайте, сколько солнечных панелей нужно, сколько денег сэкономится и когда окупятся вложения'}
            {lang === 'en' && 'Find out how many solar panels you need, how much you will save and when the investment pays back'}
          </p>
          <Link to="/calculator" className="btn" style={{ background: 'var(--accent)', color: 'var(--primary-dark)', fontSize: '1.05rem', padding: '14px 36px', fontWeight: 700 }}>
            <FontAwesomeIcon icon={faCalculator} style={{ marginRight: 10 }} />
            {lang === 'tg' ? 'Ҳисоб кун' : lang === 'ru' ? 'Рассчитать' : 'Calculate'}
          </Link>
        </div>
      </section>

      {/* ─── Inline styles ─────────────────────────────────────── */}
      <style>{`
        .hero {
          height: 100vh; min-height: 800px;
          display: flex; align-items: center;
          position: relative; color: white; overflow: hidden;
          background-size: cover; background-position: center;
        }
        .hero-content { position: relative; z-index: 2; max-width: 800px; padding-top: 80px; }
        .hero h1 { font-size: 4rem; margin-bottom: 25px; text-shadow: 0 2px 10px rgba(0,0,0,.3); line-height: 1.2; }
        .hero p  { font-size: 1.3rem; margin-bottom: 40px; max-width: 600px; }
        .hero-buttons { display: flex; gap: 1rem; margin-top: 30px; flex-wrap: wrap; }
        .hero-stats { display: flex; gap: 40px; margin-top: 60px; flex-wrap: wrap; }
        .stat-item { text-align: center; }
        .stat-number { font-size: 2.5rem; font-weight: 700; color: var(--accent); margin-bottom: 10px; font-family: 'Playfair Display', serif; }
        .stat-text { font-size: 1rem; text-transform: uppercase; letter-spacing: 1.5px; opacity: .9; }

        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 40px; }
        .feature-card { background: var(--white); border-radius: 15px; padding: 40px 30px; text-align: center; transition: var(--transition); box-shadow: var(--shadow); border: 1px solid rgba(0,0,0,.05); }
        .feature-card:hover { transform: translateY(-15px); box-shadow: 0 20px 40px rgba(0,0,0,.15); }
        .feature-icon { width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary-light), var(--accent)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; color: white; font-size: 2rem; transition: var(--transition); }
        .feature-card:hover .feature-icon { background: linear-gradient(135deg, var(--accent), var(--primary)); }
        .feature-card h3 { font-size: 1.4rem; margin-bottom: 15px; color: var(--primary-dark); }
        .feature-card p { color: var(--text-light); line-height: 1.8; }

        .timeline { position: relative; max-width: 900px; margin: 0 auto; }
        .timeline::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 3px; background: linear-gradient(to bottom, var(--primary), var(--accent)); transform: translateX(-50%); }
        .timeline-item { display: flex; justify-content: flex-end; padding-right: calc(50% + 30px); margin-bottom: 40px; }
        .timeline-item.right { justify-content: flex-start; padding-right: 0; padding-left: calc(50% + 30px); }
        .timeline-content { background: var(--white); border-radius: 15px; padding: 25px 30px; box-shadow: var(--shadow); max-width: 380px; position: relative; }
        .timeline-content::after { content: ''; position: absolute; right: -36px; top: 30px; width: 14px; height: 14px; background: var(--accent); border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 3px var(--accent); }
        .timeline-item.right .timeline-content::after { right: auto; left: -36px; }
        .timeline-year { color: var(--accent); font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
        .timeline-content h3 { font-size: 1.2rem; color: var(--primary-dark); margin-bottom: 10px; }
        .timeline-content p { color: var(--text-light); font-size: 0.95rem; line-height: 1.7; }
        .timeline-badge { display: inline-block; background: var(--primary); color: white; border-radius: 20px; padding: 4px 12px; font-size: 0.85rem; margin-top: 12px; }

        .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; }
        .project-card { background: var(--white); border-radius: 15px; overflow: hidden; box-shadow: var(--shadow); transition: var(--transition); }
        .project-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,.15); }
        .project-image { position: relative; height: 220px; overflow: hidden; }
        .project-image img { width: 100%; height: 100%; object-fit: cover; transition: var(--transition); }
        .project-card:hover .project-image img { transform: scale(1.08); }
        .project-badge { position: absolute; top: 15px; left: 15px; background: var(--primary); color: white; padding: 5px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
        .project-content { padding: 25px; }
        .project-meta { display: flex; gap: 15px; font-size: 0.85rem; color: var(--text-light); margin-bottom: 12px; flex-wrap: wrap; }
        .project-content h3 { font-size: 1.2rem; color: var(--primary-dark); margin-bottom: 10px; }
        .project-content p { color: var(--text-light); font-size: 0.95rem; line-height: 1.7; }

        .news-home-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 28px; }
        .news-home-card { background: var(--white); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow); transition: var(--transition); }
        .news-home-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,.13); }
        .news-home-img { height: 200px; overflow: hidden; position: relative; }
        .news-home-img img { width: 100%; height: 100%; object-fit: cover; transition: var(--transition); }
        .news-home-card:hover .news-home-img img { transform: scale(1.06); }
        .news-home-placeholder { background: var(--light); display: flex; align-items: center; justify-content: center; }
        .news-play-badge { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,.7); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; }
        .news-home-body { padding: 22px; }
        .news-cat-badge { display: inline-block; background: var(--primary); color: white; padding: 3px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; margin-bottom: 10px; }
        .news-home-body h3 { font-size: 1.05rem; color: var(--primary-dark); margin-bottom: 8px; line-height: 1.5; }
        .news-date { font-size: 0.82rem; color: var(--text-light); }

        @media (max-width: 768px) {
          .hero h1 { font-size: 2.5rem; }
          .hero p { font-size: 1.1rem; }
          .timeline::before { left: 20px; }
          .timeline-item, .timeline-item.right { padding: 0 0 0 55px; justify-content: flex-start; }
          .timeline-content::after { left: -35px; right: auto; }
          .timeline-item.right .timeline-content::after { left: -35px; }
        }
      `}</style>
    </div>
  );
}
