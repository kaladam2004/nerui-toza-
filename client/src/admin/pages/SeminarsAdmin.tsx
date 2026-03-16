import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../hooks/useApi';
import type { Seminar } from '../../types';
import { AdminStyles } from './NewsAdmin';

const empty = {
  title_tg: '', title_ru: '', title_en: '',
  description_tg: '', description_ru: '', description_en: '',
  date: '', image_url: '',
  location_tg: '', location_ru: '', location_en: '',
  is_upcoming: false, sort_order: 0,
};

export default function SeminarsAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Seminar | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [tab, setTab] = useState<'tg' | 'ru' | 'en'>('tg');

  const { data: seminars } = useQuery<Seminar[]>({
    queryKey: ['admin-seminars'],
    queryFn: () => api.get('/seminars').then(r => r.data),
  });

  const upsert = useMutation({
    mutationFn: (d: any) => editing ? api.put(`/admin/seminars/${editing.id}`, d) : api.post('/admin/seminars', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-seminars'] }); close_(); },
  });

  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/seminars/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-seminars'] }),
  });

  function open(s?: Seminar) {
    setEditing(s || null);
    setForm(s ? { ...s, is_upcoming: !!s.is_upcoming, image_url: s.image_url || '' } : empty);
    setModal(true);
  }
  function close_() { setModal(false); setEditing(null); setForm(empty); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20' }}>Семинарҳо</h1>
        <button className="admin-btn" onClick={() => open()}>+ Илова кун</button>
      </div>

      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f5f5f6' }}>
            <tr>{['Тасвир', 'Унвон (тоҷикӣ)', 'Ҷойгиршавӣ', 'Сана', 'Вазъ', 'Амал'].map(h => (
              <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#546e7a', fontSize: '0.85rem' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {seminars?.map(s => (
              <tr key={s.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 16px' }}>
                  {s.image_url
                    ? <img src={s.image_url} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                    : <div style={{ width: 60, height: 40, background: '#e8f5e9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📚</div>
                  }
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 500, maxWidth: 220 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title_tg}</div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#78909c' }}>{s.location_tg}</td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#78909c' }}>
                  {s.date ? new Date(s.date).toLocaleDateString('ru-RU') : '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600,
                    background: s.is_upcoming ? '#e8f5e9' : '#f5f5f6',
                    color: s.is_upcoming ? '#2e7d32' : '#78909c'
                  }}>
                    {s.is_upcoming ? 'Наздик' : 'Гузашта'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => open(s)} className="admin-btn-sm">Таҳрир</button>
                    <button onClick={() => { if (confirm('Ҳазф?')) del.mutate(s.id); }} className="admin-btn-sm" style={{ background: '#c62828' }}>Ҳазф</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close_()}>
          <div className="modal-box" style={{ maxWidth: 680 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20', marginBottom: 25 }}>{editing ? 'Таҳрири семинар' : 'Семинари нав'}</h2>

            <div className="form-row-2">
              <div className="fg">
                <label>Сана *</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="fg"><label>Тартиб</label><input type="number" value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} /></div>
            </div>
            <div className="fg"><label>URL акс</label><input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." /></div>

            <div className="lang-tabs">
              {(['tg', 'ru', 'en'] as const).map(l => <button key={l} className={tab === l ? 'active' : ''} onClick={() => setTab(l)}>{l.toUpperCase()}</button>)}
            </div>
            <div className="fg"><label>Унвон ({tab})</label><input value={form[`title_${tab}`]} onChange={e => set(`title_${tab}`, e.target.value)} /></div>
            <div className="fg"><label>Ҷойгиршавӣ ({tab})</label><input value={form[`location_${tab}`]} onChange={e => set(`location_${tab}`, e.target.value)} /></div>
            <div className="fg"><label>Тавсиф ({tab})</label><textarea rows={4} value={form[`description_${tab}`]} onChange={e => set(`description_${tab}`, e.target.value)} /></div>

            <div className="fg" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" checked={form.is_upcoming} onChange={e => set('is_upcoming', e.target.checked)} id="upcoming" />
              <label htmlFor="upcoming" style={{ margin: 0 }}>Семинари наздик (upcoming)</label>
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
