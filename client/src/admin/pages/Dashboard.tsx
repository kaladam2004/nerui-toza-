import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../hooks/useApi';

interface Stats { projects: number; unreadContacts: number; totalContacts: number; team: number; seminars: number; news: number; }

export default function Dashboard() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
    refetchInterval: 30000,
  });

  const cards = [
    { label: 'Лоиҳаҳо',    value: stats?.projects,       link: '/admin/projects',  color: '#2e7d32', emoji: '📊' },
    { label: 'Ахбор',       value: stats?.news,           link: '/admin/news',      color: '#1565c0', emoji: '📰' },
    { label: 'Тамосҳои нав', value: stats?.unreadContacts, link: '/admin/contacts',  color: '#c62828', emoji: '✉️' },
    { label: 'Кормандон',   value: stats?.team,           link: '/admin/team',      color: '#6a1b9a', emoji: '👥' },
    { label: 'Семинарҳо',   value: stats?.seminars,       link: '/admin/seminars',  color: '#e65100', emoji: '🎓' },
    { label: 'Тамос ҳамагӣ', value: stats?.totalContacts, link: '/admin/contacts',  color: '#00695c', emoji: '📬' },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20', marginBottom: 8 }}>Бознамо</h1>
      <p style={{ color: '#78909c', marginBottom: 30 }}>Хуш омадед ба панели идораи Нерӯи Тоза</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
        {cards.map(c => (
          <Link to={c.link} key={c.label} style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)', textDecoration: 'none', borderLeft: `4px solid ${c.color}`, transition: 'all 0.25s' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>{c.emoji}</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: c.color, fontFamily: 'Playfair Display, serif' }}>
              {c.value ?? '—'}
            </div>
            <div style={{ color: '#546e7a', fontWeight: 600, marginTop: 6 }}>{c.label}</div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 40, background: 'white', borderRadius: 16, padding: 30, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20', marginBottom: 15 }}>Амалҳои зуд</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/admin/news" style={{ padding: '10px 22px', background: '#2e7d32', color: 'white', borderRadius: 30, textDecoration: 'none', fontWeight: 600 }}>+ Ахбор илова кун</Link>
          <Link to="/admin/projects" style={{ padding: '10px 22px', background: '#1565c0', color: 'white', borderRadius: 30, textDecoration: 'none', fontWeight: 600 }}>+ Лоиҳа илова кун</Link>
          <Link to="/admin/contacts" style={{ padding: '10px 22px', background: '#c62828', color: 'white', borderRadius: 30, textDecoration: 'none', fontWeight: 600 }}>Тамосҳо ({stats?.unreadContacts ?? 0} нав)</Link>
        </div>
      </div>
    </div>
  );
}
