import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faEye, faSolarPanel, faLeaf, faHandshake, faUsers, faGlobe, faAward } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faFacebook } from '@fortawesome/free-brands-svg-icons';
import api from '../hooks/useApi';
import type { TeamMember, Settings } from '../types';
import PageHero from '../components/common/PageHero';

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as 'tg' | 'ru' | 'en';

  const { data: team } = useQuery<TeamMember[]>({
    queryKey: ['team', 'about'],
    queryFn: () => api.get('/team?page=about').then(r => r.data),
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data),
    staleTime: 1000 * 60 * 10,
  });

  const stats = [
    { icon: faSolarPanel, value: settings?.hero_stats_projects || '25+',  label: { tg: 'Лоиҳаи иҷрошуда', ru: 'Реализованных проектов', en: 'Projects completed' } },
    { icon: faUsers,      value: settings?.hero_stats_families || '500+', label: { tg: 'Оилаи манфиатбар',  ru: 'Семей-бенефициаров',  en: 'Beneficiary families' } },
    { icon: faGlobe,      value: '5',                                       label: { tg: 'Вилояти фаъол',     ru: 'Активных регионов',   en: 'Active regions' } },
    { icon: faAward,      value: '4+',                                      label: { tg: 'Соли таҷриба',       ru: 'Лет опыта',           en: 'Years of experience' } },
  ];

  const history = [
    {
      year: '2021', icon: faLeaf,
      tg: 'Таъсиси ташкилот ва огози аввалин лоихахо дар нохияхои чумхури',
      ru: 'Основание организации и первые проекты в районах республики',
      en: 'Organization founded, first projects in rural districts',
    },
    {
      year: '2022', icon: faSolarPanel,
      tg: 'Васеъ кардани фаъолият ба вилоятхои Сугд ва Хатлон — 8+ лоиха',
      ru: 'Расширение на Согдийскую и Хатлонскую области — 8+ проектов',
      en: 'Expansion to Sughd and Khatlon regions — 8+ projects',
    },
    {
      year: '2023', icon: faGlobe,
      tg: 'Ракамикунонии раванд — системахои онлайн, 12+ лоиха',
      ru: 'Цифровизация деятельности — онлайн-системы управления, 12+ проектов',
      en: 'Digitization of operations — online management systems, 12+ projects',
    },
    {
      year: '2024', icon: faHandshake,
      tg: 'Фаъолият дар хамаи вилоятхо — 20+ лоиха, шарикони байналмилали',
      ru: 'Деятельность во всех областях — 20+ проектов, международные партнёры',
      en: 'Active in all regions — 20+ projects, international partnerships',
    },
    {
      year: '2025', icon: faAward,
      tg: 'Огози кор дар хорича — Узбекистон ва Афгонистон',
      ru: 'Начало работы за рубежом — Узбекистан и Афганистан',
      en: 'International expansion — Uzbekistan and Afghanistan',
    },
  ];

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <PageHero pageKey="about_hero" fallbackImage="https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=2000&q=80">
        <div className="container">
          <div className="hero-content">
            <h1>{t('about.title')}</h1>
            <p>{t('about.subtitle')}</p>
          </div>
        </div>
      </PageHero>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', padding: '50px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30 }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.4rem' }}>
                  <FontAwesomeIcon icon={s.icon} />
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{s.label[lang]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT + MISSION ──────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div className="about-grid">
            <div className="about-image-block">
              <img
                src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80"
                alt="Нерӯи Тоза — команда"
                style={{ borderRadius: 20, boxShadow: '0 15px 40px rgba(0,0,0,.15)', width: '100%', objectFit: 'cover', height: 420 }}
              />
              <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, background: 'rgba(0,0,0,.65)', borderRadius: 12, padding: '14px 18px', color: 'white' }}>
                <strong style={{ color: 'var(--accent)' }}>«Нерӯи Тоза»</strong> — аз соли 2021
              </div>
            </div>
            <div className="about-text">
              <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)', marginBottom: 18, fontFamily: 'Playfair Display, serif' }}>{t('about.title')}</h2>
              <p style={{ color: 'var(--text-light)', lineHeight: 1.9, marginBottom: 16 }}>{t('about.description')}</p>
              <p style={{ color: 'var(--text-light)', lineHeight: 1.9, marginBottom: 24 }}>
                {lang === 'tg' && 'Мо аз соли 2021 дар самти рушди нерӯи тоза ва технологияҳои экологиявӣ кор мекунем. Лоиҳаҳои мо дар саросари Тоҷикистон — аз Хатлон то Суғд ва Бадахшон — амалӣ мешаванд.'}
                {lang === 'ru' && 'Мы работаем в сфере развития чистой энергии с 2021 года. Наши проекты реализуются по всему Таджикистану — от Хатлона до Согда и Бадахшана.'}
                {lang === 'en' && 'Since 2021 we have been developing clean energy and ecological technologies. Our projects span across Tajikistan — from Khatlon to Sughd and Badakhshan.'}
              </p>
              <div className="mission-vision">
                <div className="mv-card">
                  <div className="mv-icon"><FontAwesomeIcon icon={faBullseye} /></div>
                  <h3>{t('about.mission_title')}</h3>
                  <p>
                    {lang === 'tg' && 'Таъмини дастрасии оилаҳои деҳотӣ ба нерӯи тоза ва арзон тавассути технологияҳои офтобӣ ва биогазӣ.'}
                    {lang === 'ru' && 'Обеспечение доступа сельских семей к чистой и доступной энергии посредством солнечных и биогазовых технологий.'}
                    {lang === 'en' && 'Ensuring rural families access to clean, affordable energy through solar and biogas technologies.'}
                  </p>
                </div>
                <div className="mv-card">
                  <div className="mv-icon"><FontAwesomeIcon icon={faEye} /></div>
                  <h3>{t('about.vision_title')}</h3>
                  <p>
                    {lang === 'tg' && 'Тоҷикистони пурра аз нерӯи тоза — бидуни нигаронӣ аз нарх ва дастрасӣ.'}
                    {lang === 'ru' && 'Таджикистан, полностью работающий на чистой энергии — без беспокойства о цене и доступности.'}
                    {lang === 'en' && 'A Tajikistan fully powered by clean energy — without concern about cost or access.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HISTORY TIMELINE ─────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--light)' }}>
        <div className="container">
          <div className="section-title">
            <h2 style={{ fontFamily: 'Playfair Display, serif' }}>
              {lang === 'tg' ? 'Таърихи мо' : lang === 'ru' ? 'Наша история' : 'Our History'}
            </h2>
            <div className="divider" />
          </div>
          <div className="about-timeline">
            {history.map((h, i) => (
              <div key={h.year} className={`about-tl-item ${i % 2 === 0 ? 'al' : 'ar'}`}>
                <div className="about-tl-content">
                  <div className="about-tl-year">{h.year}</div>
                  <div className="about-tl-icon"><FontAwesomeIcon icon={h.icon} /></div>
                  <p>{h[lang]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div className="section-title">
            <h2>{t('about.team_title')}</h2>
            <div className="divider" />
          </div>
          {team && team.length > 0 ? (
            <div className="team-grid">
              {team.map(m => (
                <div className="team-card" key={m.id}>
                  <div className="team-image">
                    <img
                      src={m.photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'}
                      alt={m[`name_${lang}`]}
                      loading="lazy"
                    />
                  </div>
                  <div className="team-info">
                    <h3>{m[`name_${lang}`]}</h3>
                    <p className="team-position">{m[`position_${lang}`]}</p>
                    {m.email && <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: 6 }}>{m.email}</p>}
                    <div className="team-social">
                      {m.linkedin_url && (
                        <a href={m.linkedin_url} target="_blank" rel="noreferrer" title="LinkedIn">
                          <FontAwesomeIcon icon={faLinkedin} />
                        </a>
                      )}
                      {m.twitter_url && (
                        <a href={m.twitter_url} target="_blank" rel="noreferrer" title="Facebook/Twitter">
                          <FontAwesomeIcon icon={faFacebook} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: 40 }}>
              {lang === 'tg' ? 'Маълумот бор мешавад...' : lang === 'ru' ? 'Загрузка...' : 'Loading...'}
            </p>
          )}
        </div>
      </section>

      <style>{`
        .about-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 60px; align-items: start; }
        .about-image-block { position: relative; }
        .mission-vision { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 28px; }
        .mv-card { background: var(--light); border-radius: 14px; padding: 24px; border-top: 4px solid var(--accent); }
        .mv-icon { width: 48px; height: 48px; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 14px; font-size: 1.1rem; }
        .mv-card h3 { color: var(--primary-dark); margin-bottom: 8px; font-size: 1rem; }
        .mv-card p { color: var(--text-light); font-size: 0.88rem; line-height: 1.7; }

        .about-timeline { position: relative; max-width: 760px; margin: 0 auto; }
        .about-timeline::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 3px; background: linear-gradient(to bottom, var(--primary), var(--accent)); transform: translateX(-50%); }
        .about-tl-item { display: flex; justify-content: flex-end; padding-right: calc(50% + 28px); margin-bottom: 36px; }
        .about-tl-item.ar { justify-content: flex-start; padding-right: 0; padding-left: calc(50% + 28px); }
        .about-tl-content { background: var(--white); border-radius: 14px; padding: 22px 26px; box-shadow: var(--shadow); max-width: 320px; position: relative; }
        .about-tl-content::after { content: ''; position: absolute; right: -32px; top: 26px; width: 12px; height: 12px; background: var(--accent); border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 3px var(--accent); }
        .about-tl-item.ar .about-tl-content::after { right: auto; left: -32px; }
        .about-tl-year { color: var(--accent); font-weight: 800; font-size: 1.1rem; margin-bottom: 8px; }
        .about-tl-icon { width: 36px; height: 36px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.9rem; margin-bottom: 10px; }
        .about-tl-content p { color: var(--text-light); font-size: 0.9rem; line-height: 1.7; }

        .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 30px; }
        .team-card { background: var(--white); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow); transition: var(--transition); text-align: center; }
        .team-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,.12); }
        .team-image { height: 280px; overflow: hidden; }
        .team-image img { width: 100%; height: 100%; object-fit: cover; transition: var(--transition); }
        .team-card:hover .team-image img { transform: scale(1.06); }
        .team-info { padding: 20px; }
        .team-info h3 { color: var(--primary-dark); margin-bottom: 5px; font-size: 1.05rem; }
        .team-position { color: var(--text-light); font-size: 0.88rem; }
        .team-social { margin-top: 12px; display: flex; justify-content: center; gap: 10px; }
        .team-social a { width: 34px; height: 34px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: var(--transition); }
        .team-social a:hover { background: var(--accent); transform: translateY(-2px); }

        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr; }
          .mission-vision { grid-template-columns: 1fr; }
          .about-timeline::before { left: 20px; }
          .about-tl-item, .about-tl-item.ar { padding: 0 0 0 50px; justify-content: flex-start; }
          .about-tl-content::after { left: -30px !important; right: auto !important; }
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
