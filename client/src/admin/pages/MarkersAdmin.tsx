import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../hooks/useApi';
import type { MapMarker } from '../../types';
import { AdminStyles } from './NewsAdmin';

const empty = {
  name_tg: '', name_ru: '', name_en: '',
  latitude: 38.5598, longitude: 68.7738,
  marker_type: 'solar' as const,
  is_visible: true, project_id: '',
};

const TYPE_COLORS: Record<string, string> = {
  solar: '#f57f17', wind: '#1565c0', energy: '#2e7d32', education: '#6a1b9a',
};
const TYPE_ICONS: Record<string, string> = {
  solar: '☀️', wind: '💨', energy: '⚡', education: '📚',
};

export default function MarkersAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<MapMarker | null>(null);
  const [form, setForm] = useState<any>(empty);

  const { data: markers } = useQuery<MapMarker[]>({
    queryKey: ['admin-markers'],
    queryFn: () => api.get('/admin/map-markers').then(r => r.data),
  });

  const upsert = useMutation({
    mutationFn: (d: any) => editing ? api.put(`/admin/map-markers/${editing.id}`, d) : api.post('/admin/map-markers', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-markers'] }); qc.invalidateQueries({ queryKey: ['map-markers'] }); close_(); },
  });

  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/map-markers/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-markers'] }); qc.invalidateQueries({ queryKey: ['map-markers'] }); },
  });

  const toggleVisible = useMutation({
    mutationFn: (m: MapMarker) => api.put(`/admin/map-markers/${m.id}`, { ...m, is_visible: m.is_visible ? 0 : 1 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-markers'] }); qc.invalidateQueries({ queryKey: ['map-markers'] }); },
  });

  function open(m?: MapMarker) {
    setEditing(m || null);
    setForm(m ? { ...m, is_visible: !!m.is_visible, project_id: m.project_id || '' } : empty);
    setModal(true);
  }
  function close_() { setModal(false); setEditing(null); setForm(empty); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const markerTypes = ['solar', 'wind', 'energy', 'education'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20' }}>Нишонаҳои харита</h1>
        <button className="admin-btn" onClick={() => open()}>+ Илова кун</button>
      </div>

      {/* Summary by type */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 25 }}>
        {markerTypes.map(t => {
          const count = markers?.filter(m => m.marker_type === t).length || 0;
          const visCount = markers?.filter(m => m.marker_type === t && m.is_visible).length || 0;
          return (
            <div key={t} style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', borderLeft: `4px solid ${TYPE_COLORS[t]}` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{TYPE_ICONS[t]}</div>
              <div style={{ fontWeight: 700, fontSize: '1.4rem', color: TYPE_COLORS[t] }}>{count}</div>
              <div style={{ fontSize: '0.8rem', color: '#78909c' }}>{t} • {visCount} кушода</div>
            </div>
          );
        })}
      </div>

      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f5f5f6' }}>
            <tr>{['Ном (тоҷикӣ)', 'Намуд', 'Координатаҳо', 'Намоён', 'Амал'].map(h => (
              <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#546e7a', fontSize: '0.85rem' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {markers?.map(m => (
              <tr key={m.id} style={{ borderTop: '1px solid #f0f0f0', opacity: m.is_visible ? 1 : 0.5 }}>
                <td style={{ padding: '14px 16px', fontWeight: 500 }}>{m.name_tg}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600,
                    background: TYPE_COLORS[m.marker_type] + '20', color: TYPE_COLORS[m.marker_type]
                  }}>
                    {TYPE_ICONS[m.marker_type]} {m.marker_type}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: '#78909c', fontFamily: 'monospace' }}>
                  {Number(m.latitude).toFixed(4)}, {Number(m.longitude).toFixed(4)}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button
                    onClick={() => toggleVisible.mutate(m)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem' }}
                    title={m.is_visible ? 'Пинҳон кун' : 'Нишон бидеҳ'}
                  >
                    {m.is_visible ? '👁️' : '🙈'}
                  </button>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => open(m)} className="admin-btn-sm">Таҳрир</button>
                    <button onClick={() => { if (confirm('Ҳазф?')) del.mutate(m.id); }} className="admin-btn-sm" style={{ background: '#c62828' }}>Ҳазф</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close_()}>
          <div className="modal-box" style={{ maxWidth: 620 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20', marginBottom: 25 }}>{editing ? 'Таҳрири нишона' : 'Нишонаи нав'}</h2>

            <div className="form-row-2">
              <div className="fg">
                <label>Намуд</label>
                <select value={form.marker_type} onChange={e => set('marker_type', e.target.value)}>
                  {markerTypes.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
                </select>
              </div>
              <div className="fg"><label>ID Лоиҳа (ихтиёрӣ)</label><input type="number" value={form.project_id} onChange={e => set('project_id', e.target.value)} placeholder="1" /></div>
            </div>

            <div className="form-row-2">
              <div className="fg"><label>Арзи ҷуғрофӣ (lat) *</label><input type="number" step="0.0001" value={form.latitude} onChange={e => set('latitude', +e.target.value)} /></div>
              <div className="fg"><label>Тӯли ҷуғрофӣ (lng) *</label><input type="number" step="0.0001" value={form.longitude} onChange={e => set('longitude', +e.target.value)} /></div>
            </div>

            <div style={{ background: '#e8f5e9', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.82rem', color: '#2e7d32' }}>
              📍 Тоҷикистон: lat ~37–41, lng ~67–75
            </div>

            <div className="fg"><label>Ном (тоҷикӣ) *</label><input value={form.name_tg} onChange={e => set('name_tg', e.target.value)} /></div>
            <div className="fg"><label>Ном (русӣ)</label><input value={form.name_ru} onChange={e => set('name_ru', e.target.value)} /></div>
            <div className="fg"><label>Ном (англисӣ)</label><input value={form.name_en} onChange={e => set('name_en', e.target.value)} /></div>

            <div className="fg" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" checked={form.is_visible} onChange={e => set('is_visible', e.target.checked)} id="visible" />
              <label htmlFor="visible" style={{ margin: 0 }}>Дар харита намоён</label>
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
