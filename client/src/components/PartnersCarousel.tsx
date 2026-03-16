import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../hooks/useApi';
import type { Partner } from '../types';

export default function PartnersCarousel() {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);

  const { data: partners } = useQuery<Partner[]>({
    queryKey: ['partners'],
    queryFn: () => api.get('/partners').then(r => r.data),
    staleTime: 1000 * 60 * 10,
  });

  // Auto-scroll with CSS animation — duplicate items for infinite loop
  const items = partners ?? [];

  return (
    <section style={{ background: 'var(--white)', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '48px 0', overflow: 'hidden' }}>
      <div className="container" style={{ marginBottom: 28 }}>
        <h2 style={{ textAlign: 'center', fontFamily: 'Playfair Display, serif', color: 'var(--primary-dark)', fontSize: '1.8rem', marginBottom: 6 }}>
          {t('about.partners_title')}
        </h2>
        <div className="divider" style={{ width: 60, height: 3, background: 'var(--accent)', margin: '0 auto' }} />
      </div>

      {items.length === 0 ? null : (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Fade masks */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to right, white, transparent)', zIndex: 2, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to left, white, transparent)', zIndex: 2, pointerEvents: 'none' }} />

          <div ref={trackRef} className="partners-track">
            {/* Duplicate for seamless loop */}
            {[...items, ...items, ...items].map((p, i) => (
              <PartnerLogo key={`${p.id}-${i}`} partner={p} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .partners-track {
          display: flex;
          align-items: center;
          gap: 40px;
          animation: scroll-partners ${Math.max(20, items.length * 4)}s linear infinite;
          width: max-content;
          padding: 10px 40px;
        }
        .partners-track:hover { animation-play-state: paused; }
        @keyframes scroll-partners {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% / 3)); }
        }
        .partner-logo-wrap {
          background: var(--light);
          border-radius: 12px;
          padding: 16px 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 160px;
          height: 80px;
          transition: all 0.3s;
          filter: grayscale(60%);
          opacity: 0.75;
          flex-shrink: 0;
          border: 1px solid #eee;
        }
        .partner-logo-wrap:hover {
          filter: grayscale(0%);
          opacity: 1;
          transform: scale(1.05);
          box-shadow: 0 8px 24px rgba(0,0,0,.1);
          border-color: var(--accent);
        }
        .partner-logo-wrap img { max-width: 120px; max-height: 50px; object-fit: contain; }
        .partner-logo-wrap .partner-name { font-weight: 700; font-size: 0.9rem; color: var(--primary-dark); text-align: center; font-family: 'Montserrat', sans-serif; }
      `}</style>
    </section>
  );
}

function PartnerLogo({ partner }: { partner: Partner }) {
  const wrap = (
    <div className="partner-logo-wrap">
      {partner.logo_url
        ? <img src={partner.logo_url} alt={partner.name} />
        : <span className="partner-name">{partner.name}</span>
      }
    </div>
  );

  if (partner.website_url) {
    return (
      <a href={partner.website_url} target="_blank" rel="noreferrer noopener" style={{ textDecoration: 'none' }}>
        {wrap}
      </a>
    );
  }
  return wrap;
}
