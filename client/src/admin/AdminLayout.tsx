import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faProjectDiagram, faNewspaper, faConciergeBell, faUsers, faHandshake, faEnvelope, faMapMarkedAlt, faCog, faSignOutAlt, faClock, faCalculator, faImage, faUserCog } from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@tanstack/react-query';
import api from '../hooks/useApi';

const navItems = [
  { to: '/admin/dashboard',   icon: faChartBar,       label: 'Бознамо',    group: 'main' },
  { to: '/admin/projects',    icon: faProjectDiagram, label: 'Лоиҳаҳо',   group: 'main' },
  { to: '/admin/news',        icon: faNewspaper,      label: 'Ахбор',      group: 'main' },
  { to: '/admin/services',    icon: faConciergeBell,  label: 'Хидматҳо',  group: 'main' },
  { to: '/admin/team',        icon: faUsers,          label: 'Дастаи мо', group: 'main' },
  { to: '/admin/partners',    icon: faHandshake,      label: 'Шарикон',   group: 'main' },
  { to: '/admin/timeline',    icon: faClock,          label: 'Рушди мо',  group: 'content' },
  { to: '/admin/calculator',  icon: faCalculator,     label: 'Ҳисобгар',  group: 'content' },
  { to: '/admin/backgrounds', icon: faImage,          label: 'Заминаҳо',  group: 'content' },
  { to: '/admin/contacts',    icon: faEnvelope,       label: 'Тамосҳо',   group: 'system' },
  { to: '/admin/markers',     icon: faMapMarkedAlt,   label: 'Харита',    group: 'system' },
  { to: '/admin/settings',    icon: faCog,            label: 'Танзимот',  group: 'system' },
  { to: '/admin/profile',     icon: faUserCog,        label: 'Профил',    group: 'system' },
];

const groups: { key: string; label: string }[] = [
  { key: 'main',    label: 'АСОСӢ' },
  { key: 'content', label: 'МУНДАРИҶА' },
  { key: 'system',  label: 'СИСТЕМА' },
];

function SiteLogo() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="38" height="38">
      <defs>
        <linearGradient id="lg-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8bc34a"/>
          <stop offset="100%" stopColor="#c5e1a5"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="rgba(255,255,255,.1)" stroke="rgba(139,195,74,.5)" strokeWidth="1.5"/>
      <circle cx="50" cy="38" r="13" fill="url(#lg-sidebar)"/>
      <line x1="50" y1="15" x2="50" y2="9"  stroke="rgba(139,195,74,.9)" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="67" y1="21" x2="72" y2="16" stroke="rgba(139,195,74,.9)" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="75" y1="38" x2="81" y2="38" stroke="rgba(139,195,74,.9)" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="33" y1="21" x2="28" y2="16" stroke="rgba(139,195,74,.9)" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="25" y1="38" x2="19" y2="38" stroke="rgba(139,195,74,.9)" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M50 54 Q50 78 50 86" stroke="rgba(139,195,74,.8)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M50 73 Q35 61 27 66 Q31 80 50 77" fill="rgba(139,195,74,.7)"/>
      <path d="M50 63 Q65 51 73 56 Q69 70 50 73" fill="rgba(139,195,74,.5)"/>
    </svg>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();

  const { data: me } = useQuery<{ id: number; username: string; role: string }>({
    queryKey: ['admin-me'],
    queryFn: () => api.get('/auth/me').then(r => r.data),
    staleTime: 1000 * 60 * 5,
  });

  async function handleLogout() {
    await api.post('/auth/logout').catch(() => {});
    sessionStorage.removeItem('accessToken');
    navigate('/admin/login');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <SiteLogo />
          <div className="sidebar-logo-text">
            <div className="sidebar-brand">Нерӯи Тоза</div>
            <div className="sidebar-subbrand">Admin Panel</div>
          </div>
        </div>

        {/* Nav grouped */}
        <nav className="sidebar-nav">
          {groups.map(g => {
            const items = navItems.filter(n => n.group === g.key);
            return (
              <div key={g.key} className="nav-group">
                <div className="nav-group-label">{g.label}</div>
                {items.map(item => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* User info */}
        {me && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{me.username.charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{me.username}</div>
              <div className="sidebar-user-role">{me.role}</div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button className="sidebar-logout" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Баромадан</span>
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

        .admin-shell { display: flex; min-height: 100vh; background: #f0f2f5; font-family: 'Montserrat', sans-serif; }

        /* ── Sidebar ── */
        .admin-sidebar {
          width: 250px;
          background: linear-gradient(175deg, #1a3a1a 0%, #0d2b0d 60%, #071a07 100%);
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
          box-shadow: 4px 0 20px rgba(0,0,0,.25);
        }

        /* Logo area */
        .sidebar-logo {
          display: flex; align-items: center; gap: 14px;
          padding: 22px 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,.08);
          background: rgba(0,0,0,.15);
        }
        .sidebar-logo-text { display: flex; flex-direction: column; }
        .sidebar-brand {
          color: white; font-family: 'Playfair Display', serif;
          font-size: 1.15rem; line-height: 1.2; letter-spacing: 0.3px;
        }
        .sidebar-subbrand {
          color: rgba(139,195,74,.7); font-size: 0.68rem;
          font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;
        }

        /* Nav groups */
        .sidebar-nav { flex: 1; padding: 10px 0; overflow-y: auto; }
        .sidebar-nav::-webkit-scrollbar { width: 4px; }
        .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 2px; }

        .nav-group { margin-bottom: 6px; }
        .nav-group-label {
          padding: 10px 20px 5px;
          font-size: 0.65rem; font-weight: 700;
          color: rgba(255,255,255,.3); letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        /* Nav links */
        .sidebar-link {
          display: flex; align-items: center; gap: 13px;
          padding: 11px 20px;
          color: rgba(255,255,255,.65);
          text-decoration: none;
          transition: all 0.2s;
          font-size: 0.9rem; font-weight: 500;
          position: relative;
        }
        .sidebar-link:hover {
          background: rgba(255,255,255,.07);
          color: rgba(255,255,255,.95);
          padding-left: 24px;
        }
        .sidebar-link.active {
          background: linear-gradient(90deg, rgba(139,195,74,.18) 0%, rgba(139,195,74,.05) 100%);
          color: #8bc34a;
          border-right: 3px solid #8bc34a;
          font-weight: 600;
        }
        .sidebar-link.active::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px; background: #8bc34a; border-radius: 0 2px 2px 0;
        }
        .sidebar-link svg { width: 16px; min-width: 16px; opacity: .85; }
        .sidebar-link.active svg { opacity: 1; }

        /* User info */
        .sidebar-user {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 20px;
          border-top: 1px solid rgba(255,255,255,.07);
          background: rgba(0,0,0,.1);
        }
        .sidebar-user-avatar {
          width: 36px; height: 36px; border-radius: '50%'; flex-shrink: 0;
          background: linear-gradient(135deg, #2e7d32, #8bc34a);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem; font-weight: 700; color: white;
          border-radius: 50%;
        }
        .sidebar-user-info { overflow: hidden; }
        .sidebar-user-name {
          color: rgba(255,255,255,.85); font-size: 0.88rem; font-weight: 600;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sidebar-user-role {
          color: rgba(139,195,74,.6); font-size: 0.65rem; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px;
        }

        /* Logout */
        .sidebar-logout {
          display: flex; align-items: center; gap: 13px;
          padding: 16px 20px;
          color: rgba(255,255,255,.4);
          border: none; background: transparent; cursor: pointer;
          font-family: 'Montserrat', sans-serif; font-size: 0.9rem; font-weight: 500;
          width: 100%;
          border-top: 1px solid rgba(255,255,255,.07);
          transition: all 0.2s;
        }
        .sidebar-logout:hover { color: #ff6b6b; background: rgba(255,107,107,.06); }

        /* Main content */
        .admin-content { margin-left: 250px; flex: 1; padding: 32px; min-height: 100vh; }

        /* Mobile */
        @media (max-width: 768px) {
          .admin-sidebar { width: 64px; }
          .sidebar-logo-text, .sidebar-brand, .sidebar-subbrand,
          .sidebar-link span, .sidebar-logout span, .nav-group-label,
          .sidebar-user-info { display: none; }
          .sidebar-user { padding: 12px; justify-content: center; }
          .sidebar-logo { padding: 18px 13px; justify-content: center; }
          .sidebar-link { padding: 14px; justify-content: center; }
          .sidebar-link:hover { padding-left: 14px; }
          .sidebar-logout { padding: 14px; justify-content: center; }
          .admin-content { margin-left: 64px; padding: 20px 15px; }
        }
      `}</style>
    </div>
  );
}
