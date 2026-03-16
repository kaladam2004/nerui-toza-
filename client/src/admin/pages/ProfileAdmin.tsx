import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../hooks/useApi';
import { AdminStyles } from './NewsAdmin';

interface AdminUser { id: number; username: string; role: string; }

function StatusMsg({ type, msg }: { type: 'ok' | 'err'; msg: string }) {
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 10, marginTop: 14, fontSize: '0.88rem', fontWeight: 600,
      background: type === 'ok' ? '#e8f5e9' : '#ffebee',
      color: type === 'ok' ? '#2e7d32' : '#c62828',
    }}>
      {type === 'ok' ? '✅ ' : '⚠️ '}{msg}
    </div>
  );
}

export default function ProfileAdmin() {
  const { data: me, refetch } = useQuery<AdminUser>({
    queryKey: ['admin-me'],
    queryFn: () => api.get('/auth/me').then(r => r.data),
  });

  /* ── Change username ─────────────────────────────────── */
  const [uForm, setUForm] = useState({ newUsername: '', currentPasswordU: '' });
  const [uStatus, setUStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [uLoading, setULoading] = useState(false);

  async function handleUsername(e: React.FormEvent) {
    e.preventDefault();
    if (uForm.newUsername.trim().length < 3) {
      setUStatus({ type: 'err', msg: 'Ном бояд камаш 3 ҳарф бошад' }); return;
    }
    setULoading(true); setUStatus(null);
    try {
      await api.put('/auth/username', { newUsername: uForm.newUsername.trim(), currentPassword: uForm.currentPasswordU });
      setUStatus({ type: 'ok', msg: 'Номи корбар бо муваффақият иваз шуд. Дубора ворид шавед.' });
      setUForm({ newUsername: '', currentPasswordU: '' });
      refetch();
    } catch (err: any) {
      setUStatus({ type: 'err', msg: err.response?.data?.error || 'Хатогӣ рух дод' });
    } finally {
      setULoading(false);
    }
  }

  /* ── Change password ─────────────────────────────────── */
  const [pForm, setPForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pStatus, setPStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [pLoading, setPLoading] = useState(false);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pForm.newPassword.length < 6) {
      setPStatus({ type: 'err', msg: 'Парол бояд камаш 6 ҳарф бошад' }); return;
    }
    if (pForm.newPassword !== pForm.confirmPassword) {
      setPStatus({ type: 'err', msg: 'Паролҳо мувофиқ нестанд' }); return;
    }
    setPLoading(true); setPStatus(null);
    try {
      await api.put('/auth/password', { currentPassword: pForm.currentPassword, newPassword: pForm.newPassword });
      setPStatus({ type: 'ok', msg: 'Парол бо муваффақият иваз шуд!' });
      setPForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPStatus({ type: 'err', msg: err.response?.data?.error || 'Пароли ҷорӣ нодуруст аст' });
    } finally {
      setPLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0',
    borderRadius: 10, fontFamily: 'Montserrat, sans-serif', fontSize: '0.92rem',
    outline: 'none', color: '#263238', boxSizing: 'border-box', transition: 'border 0.2s',
  };

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2e7d32, #8bc34a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', flexShrink: 0,
        }}>👤</div>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20', margin: 0, fontSize: '1.6rem' }}>
            {me?.username || '...'}
          </h1>
          <p style={{ color: '#78909c', margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
            {me?.role || 'admin'}
          </p>
        </div>
      </div>

      {/* ── Block 1: Change Username ── */}
      <div style={{ background: 'white', borderRadius: 18, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 24 }}>
        <h2 style={{ color: '#1b5e20', fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', marginBottom: 20 }}>
          ✏️ Иваз кардани номи корбар
        </h2>
        <p style={{ color: '#78909c', fontSize: '0.85rem', marginBottom: 20, lineHeight: 1.6 }}>
          Номи корбари ҷорӣ: <strong style={{ color: '#263238' }}>{me?.username}</strong>
        </p>

        <form onSubmit={handleUsername}>
          <div className="fg">
            <label>Номи корбари нав</label>
            <input
              value={uForm.newUsername}
              onChange={e => setUForm(f => ({ ...f, newUsername: e.target.value }))}
              style={inputStyle}
              placeholder="Номи корбари нав"
              required minLength={3}
              onFocus={e => e.target.style.borderColor = '#2e7d32'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          <div className="fg">
            <label>Тасдиқи ҳуввият (пароли ҷорӣ)</label>
            <input
              type="password"
              value={uForm.currentPasswordU}
              onChange={e => setUForm(f => ({ ...f, currentPasswordU: e.target.value }))}
              style={inputStyle}
              placeholder="Пароли ҷориро ворид кунед"
              required
              onFocus={e => e.target.style.borderColor = '#2e7d32'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          {uStatus && <StatusMsg {...uStatus} />}
          <button type="submit" className="admin-btn" disabled={uLoading} style={{ marginTop: 16 }}>
            {uLoading ? '⏳ Нигоҳ мешавад...' : 'Ном иваз кун'}
          </button>
        </form>
      </div>

      {/* ── Block 2: Change Password ── */}
      <div style={{ background: 'white', borderRadius: 18, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <h2 style={{ color: '#1b5e20', fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', marginBottom: 20 }}>
          🔒 Иваз кардани парол
        </h2>

        <form onSubmit={handlePassword}>
          <div className="fg">
            <label>Пароли ҷорӣ</label>
            <input
              type="password"
              value={pForm.currentPassword}
              onChange={e => setPForm(f => ({ ...f, currentPassword: e.target.value }))}
              style={inputStyle}
              placeholder="Пароли ҷориро ворид кунед"
              required
              onFocus={e => e.target.style.borderColor = '#2e7d32'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          <div className="form-row-2">
            <div className="fg">
              <label>Пароли нав</label>
              <input
                type="password"
                value={pForm.newPassword}
                onChange={e => setPForm(f => ({ ...f, newPassword: e.target.value }))}
                style={inputStyle}
                placeholder="Камаш 6 ҳарф"
                required minLength={6}
                onFocus={e => e.target.style.borderColor = '#2e7d32'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
            <div className="fg">
              <label>Такрори пароли нав</label>
              <input
                type="password"
                value={pForm.confirmPassword}
                onChange={e => setPForm(f => ({ ...f, confirmPassword: e.target.value }))}
                style={{
                  ...inputStyle,
                  borderColor: pForm.confirmPassword && pForm.confirmPassword !== pForm.newPassword ? '#c62828' : '#e0e0e0',
                }}
                placeholder="Пароли навро такрор кунед"
                required
                onFocus={e => e.target.style.borderColor = pForm.confirmPassword !== pForm.newPassword ? '#c62828' : '#2e7d32'}
                onBlur={e => e.target.style.borderColor = pForm.confirmPassword && pForm.confirmPassword !== pForm.newPassword ? '#c62828' : '#e0e0e0'}
              />
            </div>
          </div>

          {/* Password strength hint */}
          {pForm.newPassword && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 4, borderRadius: 2,
                    background: pForm.newPassword.length >= i * 3
                      ? (i <= 1 ? '#c62828' : i <= 2 ? '#f57f17' : i <= 3 ? '#8bc34a' : '#2e7d32')
                      : '#e0e0e0',
                    transition: 'background 0.2s',
                  }} />
                ))}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#78909c' }}>
                {pForm.newPassword.length < 6 ? 'Хеле кӯтоҳ' : pForm.newPassword.length < 9 ? 'Қабул' : pForm.newPassword.length < 12 ? 'Хуб' : 'Аъло'}
              </span>
            </div>
          )}

          {pStatus && <StatusMsg {...pStatus} />}
          <button type="submit" className="admin-btn" disabled={pLoading} style={{ marginTop: 16 }}>
            {pLoading ? '⏳ Нигоҳ мешавад...' : 'Парол иваз кун'}
          </button>
        </form>
      </div>

      <AdminStyles />
    </div>
  );
}
