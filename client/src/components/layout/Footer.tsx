import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faMapMarkerAlt, faPhone, faEnvelope, faClock, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTelegram, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../hooks/useApi';
import type { Settings } from '../../types';

export default function Footer() {
  const { t } = useTranslation();
  const { data: settings } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data),
    staleTime: 1000 * 60 * 10,
  });

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          {/* Col 1 — About */}
          <div className="footer-col">
            <div className="logo" style={{ marginBottom: 20 }}>
              <div className="logo-icon">
                <FontAwesomeIcon icon={faLeaf} />
              </div>
              <div className="logo-text" style={{ color: 'white' }}>
                Нерӯи <span>Тоза</span>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,.7)', lineHeight: 1.8, marginBottom: 20 }}>
              {t('footer.about_text')}
            </p>
            <div className="social-links">
              {settings?.telegram_url  && <a href={settings.telegram_url}  className="social-link" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faTelegram} /></a>}
              {settings?.facebook_url  && <a href={settings.facebook_url}  className="social-link" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faFacebook} /></a>}
              {settings?.instagram_url && <a href={settings.instagram_url} className="social-link" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faInstagram} /></a>}
              {settings?.youtube_url   && <a href={settings.youtube_url}   className="social-link" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faYoutube} /></a>}
            </div>
          </div>

          {/* Col 2 — Links */}
          <div className="footer-col">
            <h4>{t('footer.links')}</h4>
            <ul className="footer-links">
              <li><Link to="/about"><FontAwesomeIcon icon={faChevronRight} size="xs" /> {t('nav.about')}</Link></li>
              <li><Link to="/services"><FontAwesomeIcon icon={faChevronRight} size="xs" /> {t('nav.services')}</Link></li>
              <li><Link to="/projects"><FontAwesomeIcon icon={faChevronRight} size="xs" /> {t('nav.projects')}</Link></li>
              <li><Link to="/news"><FontAwesomeIcon icon={faChevronRight} size="xs" /> {t('nav.news')}</Link></li>
            </ul>
          </div>

          {/* Col 3 — Services */}
          <div className="footer-col">
            <h4>{t('footer.services')}</h4>
            <ul className="footer-links">
              <li><Link to="/services"><FontAwesomeIcon icon={faChevronRight} size="xs" /> {t('footer.solar')}</Link></li>
              <li><Link to="/services"><FontAwesomeIcon icon={faChevronRight} size="xs" /> {t('footer.biogas')}</Link></li>
              <li><Link to="/services"><FontAwesomeIcon icon={faChevronRight} size="xs" /> {t('footer.efficiency')}</Link></li>
              <li><Link to="/calculator"><FontAwesomeIcon icon={faChevronRight} size="xs" /> {t('footer.consulting')}</Link></li>
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div className="footer-col">
            <h4>{t('footer.contact')}</h4>
            <ul className="footer-contact-info">
              <li><FontAwesomeIcon icon={faMapMarkerAlt} /><span>{settings?.address_tg || '734025, Душанбе, кӯчаи А. Сино, 29/2'}</span></li>
              <li><FontAwesomeIcon icon={faPhone} /><span>{settings?.phone_primary || '+992 93 564 20 20'}</span></li>
              <li><FontAwesomeIcon icon={faEnvelope} /><span>{settings?.email_primary || 'neruitoza@gmail.com'}</span></li>
              <li><FontAwesomeIcon icon={faClock} /><span>{settings?.working_hours_tg || 'Душанбе-Ҷумъа: 8:00 - 18:00'}</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('footer.copyright')}</p>
          <p>{t('footer.developer')}</p>
        </div>
      </div>
    </footer>
  );
}
