import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faTag, faPlay } from '@fortawesome/free-solid-svg-icons';
import api from '../hooks/useApi';
import type { NewsItem } from '../types';
import PageHero from '../components/common/PageHero';

function MediaBlock({ item, lang }: { item: NewsItem; lang: 'tg' | 'ru' | 'en' }) {
  const [playing, setPlaying] = useState(false);

  // YouTube or Vimeo — embed iframe
  if ((item.media_type === 'youtube' || item.media_type === 'vimeo') && item.video_embed_url) {
    return (
      <div className="news-video-wrapper">
        {!playing ? (
          <div className="video-thumb" onClick={() => setPlaying(true)}>
            {item.cover_image
              ? <img src={item.cover_image} alt={item[`title_${lang}`]} loading="lazy" />
              : <div className="video-placeholder" />
            }
            <div className="play-overlay">
              <div className="play-btn"><FontAwesomeIcon icon={faPlay} /></div>
            </div>
          </div>
        ) : (
          <iframe
            src={`${item.video_embed_url}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={item[`title_${lang}`]}
          />
        )}
      </div>
    );
  }

  // Direct video file
  if (item.media_type === 'video_file' && item.video_url) {
    return (
      <div className="news-video-wrapper">
        <video controls preload="metadata" style={{ width: '100%', borderRadius: 12 }}>
          <source src={item.video_url} />
        </video>
      </div>
    );
  }

  // Single image
  if (item.cover_image) {
    return (
      <div className="news-image-wrapper">
        <img src={item.cover_image} alt={item[`title_${lang}`]} loading="lazy" />
      </div>
    );
  }

  // Gallery
  if (item.media_type === 'gallery' && item.images?.length) {
    return (
      <div className="news-gallery">
        {item.images.map(img => (
          <div key={img.id} className="gallery-item">
            <img src={img.url} alt={img[`caption_${lang}`] || ''} loading="lazy" />
            {img[`caption_${lang}`] && <p className="gallery-caption">{img[`caption_${lang}`]}</p>}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function countWords(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

function truncateHtml(html: string, maxWords: number) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(Boolean);
  if (words.length <= maxWords) return html;
  return words.slice(0, maxWords).join(' ') + '…';
}

export default function NewsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as 'tg' | 'ru' | 'en';
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const { data: newsItems, isLoading } = useQuery<NewsItem[]>({
    queryKey: ['news', 'published'],
    queryFn: () => api.get('/news?published=true').then(r => r.data),
  });

  const categories = ['all', 'news', 'project_update', 'seminar', 'announcement'];

  const filtered = newsItems?.filter(n => category === 'all' || n.category === category);

  return (
    <>
      <PageHero pageKey="news_hero" fallbackImage="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=2000&q=80">
        <div className="container">
          <div className="hero-content">
            <h1>{t('news.title')}</h1>
            <p>{t('news.subtitle')}</p>
          </div>
        </div>
      </PageHero>

      <section className="section">
        <div className="container">
          {/* Category filter */}
          <div className="filter-tabs">
            {categories.map(c => (
              <button
                key={c}
                className={`filter-btn${category === c ? ' active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c === 'all' ? t('news.all') : t(`news.${c}`)}
              </button>
            ))}
          </div>

          {isLoading && <div className="loading-state"><p>{t('common.loading')}</p></div>}

          <div className="news-grid">
            {filtered?.map(item => (
              <article className="news-card" key={item.id}>
                <MediaBlock item={item} lang={lang} />
                <div className="news-content">
                  <div className="news-meta">
                    <span><FontAwesomeIcon icon={faTag} /> {t(`news.${item.category}`) || item.category}</span>
                    {item.published_at && (
                      <span><FontAwesomeIcon icon={faCalendar} /> {new Date(item.published_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  <h2>{item[`title_${lang}`]}</h2>
                  {(() => {
                    const body = item[`body_${lang}`];
                    const isLong = countWords(body) > 30;
                    const isOpen = expanded.has(item.id);
                    return (
                      <>
                        <div className="news-body" dangerouslySetInnerHTML={{ __html: isLong && !isOpen ? truncateHtml(body, 30) : body }} />
                        {isLong && (
                          <button
                            onClick={() => setExpanded(prev => {
                              const next = new Set(prev);
                              isOpen ? next.delete(item.id) : next.add(item.id);
                              return next;
                            })}
                            style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', padding: 0 }}
                          >
                            {isOpen ? (lang === 'ru' ? 'Скрыть ▲' : lang === 'en' ? 'Show less ▲' : 'Камтар ▲') : (lang === 'ru' ? 'Читать далее ▼' : lang === 'en' ? 'Read more ▼' : 'Маълумоти бештар ▼')}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </article>
            ))}
          </div>

          {filtered?.length === 0 && !isLoading && (
            <div className="empty-state">
              <p>{t('common.not_found')}</p>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .filter-tabs { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; }
        .filter-btn { padding: 10px 24px; border-radius: 30px; border: 2px solid var(--primary); background: transparent; color: var(--primary); font-weight: 600; cursor: pointer; transition: var(--transition); font-family: 'Montserrat', sans-serif; font-size: 0.95rem; }
        .filter-btn.active, .filter-btn:hover { background: var(--primary); color: white; }

        .news-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 40px; }
        .news-card { background: var(--white); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow); transition: var(--transition); }
        .news-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,.15); }

        .news-video-wrapper { position: relative; width: 100%; padding-top: 56.25%; overflow: hidden; }
        .news-video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
        .news-video-wrapper .video-thumb { position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; }
        .news-video-wrapper .video-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .video-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, var(--primary-dark), var(--primary)); }
        .play-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.3); transition: background 0.3s; }
        .play-overlay:hover { background: rgba(0,0,0,.5); }
        .play-btn { width: 70px; height: 70px; background: rgba(255,255,255,.95); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 1.5rem; transition: var(--transition); padding-left: 5px; }
        .play-btn:hover { transform: scale(1.1); }

        .news-image-wrapper { height: 240px; overflow: hidden; }
        .news-image-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: var(--transition); }
        .news-card:hover .news-image-wrapper img { transform: scale(1.05); }

        .news-gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; }
        .gallery-item img { width: 100%; height: 150px; object-fit: cover; }
        .gallery-caption { font-size: 0.8rem; color: var(--text-light); padding: 4px 8px; }

        .news-content { padding: 25px; }
        .news-meta { display: flex; gap: 15px; font-size: 0.85rem; color: var(--text-light); margin-bottom: 12px; flex-wrap: wrap; }
        .news-meta span { display: flex; align-items: center; gap: 6px; }
        .news-content h2 { font-size: 1.3rem; color: var(--primary-dark); margin-bottom: 12px; line-height: 1.4; }
        .news-body { color: var(--text-light); font-size: 0.95rem; line-height: 1.8; }
        .news-body p { margin-bottom: 10px; }
        .news-body img { border-radius: 8px; margin: 10px 0; }

        .loading-state, .empty-state { text-align: center; padding: 60px; color: var(--text-light); }
        @media (max-width: 768px) { .news-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
