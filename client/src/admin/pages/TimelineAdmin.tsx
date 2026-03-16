import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../hooks/useApi';
import type { TimelineItem } from '../../types';
import { AdminStyles } from './NewsAdmin';

const empty = {
  year: String(new Date().getFullYear()),
  title_tg: '', title_ru: '', title_en: '',
  desc_tg: '', desc_ru: '', desc_en: '',
  projects_count: '', sort_order: 0,
};

export default function TimelineAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<TimelineItem | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [tab, setTab] = useState<'tg'|'ru'|'en'>('tg');

  const { data: items } = useQuery<TimelineItem[]>({
    queryKey: ['admin-timeline'],
    queryFn: () => api.get('/timeline').then(r => r.data),
  });

  const upsert = useMutation({
    mutationFn: (d: any) => editing ? api.put(`/admin/timeline/${editing.id}`, d) : api.post('/admin/timeline', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-timeline'] }); qc.invalidateQueries({ queryKey: ['timeline'] }); close_(); },
  });

  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/timeline/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-timeline'] }); qc.invalidateQueries({ queryKey: ['timeline'] }); },
  });

  function open(item?: TimelineItem) { setEditing(item || null); setForm(item ? { ...item } : empty); setModal(true); }
  function close_() { setModal(false); setEditing(null); setForm(empty); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20' }}>Рушди мо сол ба сол</h1>
        <button className="admin-btn" onClick={() => open()}>+ Илова кун</button>
      </div>

      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f5f5f6' }}>
            <tr>{['Сол', 'Унвон (TJ)', 'Лоиҳаҳо', 'Тартиб', 'Амал'].map(h => (
              <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#546e7a', fontSize: '0.85rem' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items?.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 14px', borderRadius: 20, fontWeight: 800, fontSize: '1rem' }}>{item.year}</span>
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 500 }}>{item.title_tg}</td>
                <td style={{ padding: '14px 16px', color: '#78909c' }}>{item.projects_count}</td>
                <td style={{ padding: '14px 16px', color: '#78909c' }}>{item.sort_order}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => open(item)} className="admin-btn-sm">Таҳрир</button>
                    <button onClick={() => { if (confirm('Ҳазф?')) del.mutate(item.id); }} className="admin-btn-sm" style={{ background: '#c62828' }}>Ҳазф</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!items || items.length === 0) && (
          <div style={{ padding: 40, textAlign: 'center', color: '#78909c' }}>Маълумот нест. Илова кунед!</div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close_()}>
          <div className="modal-box" style={{ maxWidth: 660 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20', marginBottom: 25 }}>{editing ? 'Таҳрир' : 'Қайди нав'}</h2>
            <div className="form-row-2">
              <div className="fg"><label>Сол *</label><input value={form.year} onChange={e => set('year', e.target.value)} placeholder="2024" /></div>
              <div className="fg"><label>Шумораи лоиҳаҳо</label><input value={form.projects_count} onChange={e => set('projects_count', e.target.value)} placeholder="20+" /></div>
            </div>
            <div className="fg"><label>Тартиб</label><input type="number" value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} /></div>
            <div className="lang-tabs">
              {(['tg','ru','en'] as const).map(l => <button key={l} className={tab===l?'active':''} onClick={() => setTab(l)}>{l === 'tg' ? 'TJ' : l.toUpperCase()}</button>)}
            </div>
            <div className="fg"><label>Унвон ({tab === 'tg' ? 'TJ' : tab.toUpperCase()})</label><input value={form[`title_${tab}`]} onChange={e => set(`title_${tab}`, e.target.value)} /></div>
            <div className="fg"><label>Тавсиф ({tab === 'tg' ? 'TJ' : tab.toUpperCase()})</label><textarea rows={3} value={form[`desc_${tab}`]} onChange={e => set(`desc_${tab}`, e.target.value)} /></div>
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
