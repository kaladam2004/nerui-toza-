import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../hooks/useApi';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', creds);
      sessionStorage.setItem('accessToken', data.accessToken);
      navigate('/admin/dashboard');
    } catch {
      setError('Номи корбар ё рамз нодуруст аст');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #071a07 0%, #1a3a1a 45%, #2e7d32 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: 'Montserrat, sans-serif',
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'fixed', top: -120, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(139,195,74,.07)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -100, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'rgba(46,125,50,.12)', pointerEvents: 'none' }} />

      <div style={{
        background: 'white', borderRadius: 24, padding: '48px 44px',
        width: '100%', maxWidth: 440,
        boxShadow: '0 30px 80px rgba(0,0,0,.35)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo + brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ margin: '0 auto 18px', width: 96, height: 96 }}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="96" height="96">
              <defs>
                <linearGradient id="lg-login" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2e7d32"/>
                  <stop offset="100%" stopColor="#8bc34a"/>
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#lg-login)"/>
              {/* Sun */}
              <circle cx="50" cy="37" r="13.5" fill="rgba(255,255,220,.95)"/>
              <line x1="50" y1="13" x2="50" y2="7"  stroke="rgba(255,255,180,.95)" strokeWidth="4" strokeLinecap="round"/>
              <line x1="68" y1="19" x2="73" y2="14" stroke="rgba(255,255,180,.95)" strokeWidth="4" strokeLinecap="round"/>
              <line x1="76" y1="37" x2="82" y2="37" stroke="rgba(255,255,180,.95)" strokeWidth="4" strokeLinecap="round"/>
              <line x1="32" y1="19" x2="27" y2="14" stroke="rgba(255,255,180,.95)" strokeWidth="4" strokeLinecap="round"/>
              <line x1="24" y1="37" x2="18" y2="37" stroke="rgba(255,255,180,.95)" strokeWidth="4" strokeLinecap="round"/>
              {/* Leaf */}
              <path d="M50 54 Q50 80 50 88" stroke="rgba(255,255,255,.75)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <path d="M50 75 Q33 62 25 67 Q29 82 50 79" fill="rgba(255,255,255,.8)"/>
              <path d="M50 65 Q67 52 75 57 Q71 72 50 75" fill="rgba(255,255,255,.6)"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.9rem', color: '#1b5e20', fontFamily: 'Playfair Display, serif', marginBottom: 6, letterSpacing: 0.5 }}>Нерӯи Тоза</h1>
          <p style={{ color: '#8bc34a', fontWeight: 700, letterSpacing: 2.5, fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: 4 }}>ЭНЕРГИЯИ ТОЗА • ТОҶИКИСТОН</p>
          <div style={{ width: 40, height: 2, background: 'linear-gradient(90deg, #8bc34a, #2e7d32)', borderRadius: 2, margin: '12px auto 0' }} />
        </div>

        <p style={{ textAlign: 'center', color: '#78909c', fontSize: '0.88rem', marginBottom: 28, fontWeight: 500 }}>Панели идораи сайт</p>

        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: 10, marginBottom: 22, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 8, color: '#37474f', fontSize: '0.88rem' }}>Номи корбар</label>
            <input
              value={creds.username}
              onChange={e => setCreds(c => ({ ...c, username: e.target.value }))}
              style={{ width: '100%', padding: '13px 16px', border: '2px solid #e8ecef', borderRadius: 12, fontFamily: 'Montserrat, sans-serif', fontSize: '0.95rem', outline: 'none', color: '#263238', transition: 'border 0.2s', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#2e7d32'}
              onBlur={e => e.target.style.borderColor = '#e8ecef'}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 8, color: '#37474f', fontSize: '0.88rem' }}>Рамз</label>
            <input
              type="password"
              value={creds.password}
              onChange={e => setCreds(c => ({ ...c, password: e.target.value }))}
              style={{ width: '100%', padding: '13px 16px', border: '2px solid #e8ecef', borderRadius: 12, fontFamily: 'Montserrat, sans-serif', fontSize: '0.95rem', outline: 'none', color: '#263238', transition: 'border 0.2s', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#2e7d32'}
              onBlur={e => e.target.style.borderColor = '#e8ecef'}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #2e7d32, #1b5e20)',
              color: 'white', border: 'none', borderRadius: 50,
              fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Montserrat, sans-serif', letterSpacing: 1.5, textTransform: 'uppercase',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(46,125,50,.4)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '⏳ Воридшавӣ...' : 'Ворид шудан →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#b0bec5', fontSize: '0.75rem', marginTop: 28 }}>
          © {new Date().getFullYear()} Нерӯи Тоза · Тоҷикистон
        </p>
      </div>
    </div>
  );
}
