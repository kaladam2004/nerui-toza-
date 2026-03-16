import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <header id="header" className={scrolled ? 'scrolled' : ''}>
      <div className="container">
        <nav className="navbar">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <FontAwesomeIcon icon={faLeaf} />
            </div>
            <div className="logo-text">
              Нерӯи <span>Тоза</span>
            </div>
          </Link>

          <ul className={`nav-links${menuOpen ? ' active' : ''}`}>
            <li><Link to="/" className={isActive('/')}>{t('nav.home')}</Link></li>
            <li><Link to="/about" className={isActive('/about')}>{t('nav.about')}</Link></li>
            <li><Link to="/projects" className={isActive('/projects')}>{t('nav.projects')}</Link></li>
            <li><Link to="/services" className={isActive('/services')}>{t('nav.services')}</Link></li>
            <li><Link to="/news" className={isActive('/news')}>{t('nav.news')}</Link></li>
            <li><Link to="/calculator" className={isActive('/calculator')}>{t('nav.calculator')}</Link></li>
            <li><Link to="/contact" className={isActive('/contact')}>{t('nav.contact')}</Link></li>
          </ul>

          <button
            className="mobile-toggle"
            aria-label="Menu"
            onClick={() => setMenuOpen(o => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </div>
    </header>
  );
}
