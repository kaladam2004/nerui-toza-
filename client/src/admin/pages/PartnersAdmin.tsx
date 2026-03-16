import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../hooks/useApi';
import type { Partner } from '../../types';
import { AdminStyles } from './NewsAdmin';
import ImageUpload from '../components/ImageUpload';

const empty = { name: '', logo_url: '', website_url: '', sort_order: 0, is_visible: true };

export default function PartnersAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState<any>(empty);

  const { data: partners } = useQuery<Partner[]>({
    queryKey: ['admin-partners'],
    queryFn: () => api.get('/admin/partners').then(r => r.data),
  });

  const upsert = useMutation({
    mutationFn: (d: any) => editing ? api.put(`/admin/partners/${editing.id}`, d) : api.post('/admin/partners', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-partners'] }); qc.invalidateQueries({ queryKey: ['partners'] }); close_(); },
  });

  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/partners/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-partners'] }); qc.invalidateQueries({ queryKey: ['partners'] }); },
  });

  const toggleVisible = useMutation({
    mutationFn: (p: Partner) => api.put(`/admin/partners/${p.id}`, { ...p, is_visible: p.is_visible ? 0 : 1 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-partners'] }); qc.invalidateQueries({ queryKey: ['partners'] }); },
  });

  function open(p?: Partner) {
    setEditing(p || null);
    setForm(p ? { ...p, is_visible: !!p.is_visible } : empty);
    setModal(true);
  }
  function close_() { setModal(false); setEditing(null); setForm(empty); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20' }}>Шарикони мо</h1>
        <button className="admin-btn" onClick={() => open()}>+ Илова кун</button>
      </div>

      {/* Preview carousel-like grid */}
      {partners && partners.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 25, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <p style={{ fontWeight: 600, color: '#546e7a', fontSize: '0.85rem', marginBottom: 16 }}>ПЕШНАМОИШ</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {partners.map(p => (
              <div key={p.id} style={{ background: '#f8faf8', borderRadius: 10, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, opacity: p.is_visible ? 1 : 0.4, border: '1px solid #e0e0e0' }}>
                {p.logo_url
                  ? <img src={p.logo_url} alt={p.name} style={{ height: 36, maxWidth: 80, objectFit: 'contain' }} />
                  : <span style={{ fontWeight: 700, color: '#2e7d32', fontSize: '0.9rem' }}>{p.name}</span>
                }
                {!p.is_visible && <span style={{ fontSize: '0.75rem', color: '#78909c' }}>пинҳон</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f5f5f6' }}>
            <tr>{['Логотип', 'Ном', 'Сомона', 'Тартиб', 'Намоён', 'Амал'].map(h => (
              <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#546e7a', fontSize: '0.85rem' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {partners?.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #f0f0f0', opacity: p.is_visible ? 1 : 0.5 }}>
                <td style={{ padding: '10px 16px' }}>
                  {p.logo_url
                    ? <img src={p.logo_url} alt={p.name} style={{ height: 40, maxWidth: 80, objectFit: 'contain' }} />
                    : <div style={{ width: 60, height: 40, background: '#e8f5e9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🤝</div>
                  }
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>{p.name}</td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                  {p.website_url
                    ? <a href={p.website_url} target="_blank" rel="noreferrer" style={{ color: '#1565c0', textDecoration: 'none' }}>{p.website_url.replace(/^https?:\/\//, '').slice(0, 30)}</a>
                    : <span style={{ color: '#78909c' }}>—</span>
                  }
                </td>
                <td style={{ padding: '14px 16px', color: '#78909c' }}>{p.sort_order}</td>
                <td style={{ padding: '14px 16px' }}>
                  <button onClick={() => toggleVisible.mutate(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem' }}>
                    {p.is_visible ? '👁️' : '🙈'}
                  </button>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => open(p)} className="admin-btn-sm">Таҳрир</button>
                    <button onClick={() => { if (confirm('Ҳазф?')) del.mutate(p.id); }} className="admin-btn-sm" style={{ background: '#c62828' }}>Ҳазф</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!partners || partners.length === 0) && (
          <div style={{ padding: 40, textAlign: 'center', color: '#78909c' }}>
            Шарике вуҷуд надорад. Илова кунед!
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close_()}>
          <div className="modal-box" style={{ maxWidth: 560 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20', marginBottom: 25 }}>{editing ? 'Таҳрири шарик' : 'Шарики нав'}</h2>

            <div className="fg"><label>Ном *</label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="USAID, GIZ, ACTED..." /></div>
            <div className="fg"><label>Логотип</label><ImageUpload value={form.logo_url} onChange={v => set('logo_url', v)} /></div>
            <div className="fg"><label>URL сомона</label><input type="url" value={form.website_url} onChange={e => set('website_url', e.target.value)} placeholder="https://example.com" /></div>
            <div className="fg"><label>Тартиби намоиш</label><input type="number" value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} /></div>

            <div className="fg" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" checked={form.is_visible} onChange={e => set('is_visible', e.target.checked)} id="vis" />
              <label htmlFor="vis" style={{ margin: 0 }}>Дар сайт намоён бошад</label>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 25 }}>
              <button className="admin-btn" onClick={() => upsert.mutate(form)} disabled={upsert.isPending}>{upsert.isPending ? '...' : 'Нигоҳ доштан'}</button>
              <button className="admin-btn-cancel" onClick={close_}>Бекор</button>
            </div>
          </div>
        </div>
      )}
      <AdminStyles />
    </div>
  );
}
