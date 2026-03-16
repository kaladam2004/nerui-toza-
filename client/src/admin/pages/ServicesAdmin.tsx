import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../hooks/useApi';
import type { Service } from '../../types';
import { AdminStyles } from './NewsAdmin';
import ImageUpload from '../components/ImageUpload';

const emptyFeature = () => ({ feature_tg: '', feature_ru: '', feature_en: '' });
const empty = {
  slug: '', image_url: '', sort_order: 0,
  category_tg: '', category_ru: '', category_en: '',
  title_tg: '', title_ru: '', title_en: '',
  description_tg: '', description_ru: '', description_en: '',
  features: [emptyFeature()],
};

export default function ServicesAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [tab, setTab] = useState<'tg' | 'ru' | 'en'>('tg');

  const { data: services } = useQuery<Service[]>({
    queryKey: ['admin-services'],
    queryFn: () => api.get('/services').then(r => r.data),
  });

  const upsert = useMutation({
    mutationFn: (d: any) => editing ? api.put(`/admin/services/${editing.id}`, d) : api.post('/admin/services', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); close_(); },
  });

  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/services/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
  });

  function open(s?: Service) {
    setEditing(s || null);
    setForm(s ? { ...s, features: s.features?.length ? s.features : [emptyFeature()] } : { ...empty, features: [emptyFeature()] });
    setModal(true);
  }
  function close_() { setModal(false); setEditing(null); setForm({ ...empty, features: [emptyFeature()] }); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  function setFeature(i: number, k: string, v: string) {
    setForm((f: any) => {
      const features = [...f.features];
      features[i] = { ...features[i], [k]: v };
      return { ...f, features };
    });
  }
  function addFeature() { setForm((f: any) => ({ ...f, features: [...f.features, emptyFeature()] })); }
  function removeFeature(i: number) {
    setForm((f: any) => ({ ...f, features: f.features.filter((_: any, idx: number) => idx !== i) }));
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20' }}>Хидматҳо</h1>
        <button className="admin-btn" onClick={() => open()}>+ Илова кун</button>
      </div>

      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f5f5f6' }}>
            <tr>{['Тасвир', 'Унвон (тоҷикӣ)', 'Категория', 'Хусусиятҳо', 'Тартиб', 'Амал'].map(h => (
              <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#546e7a', fontSize: '0.85rem' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {services?.map(s => (
              <tr key={s.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 16px' }}>
                  {s.image_url
                    ? <img src={s.image_url} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                    : <div style={{ width: 60, height: 40, background: '#e8f5e9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🌿</div>
                  }
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 500 }}>{s.title_tg}</td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#78909c' }}>{s.category_tg}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '3px 10px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600 }}>
                    {s.features?.length || 0} та
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#78909c' }}>{s.sort_order}</td>
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
          <div className="modal-box" style={{ maxWidth: 720 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20', marginBottom: 25 }}>{editing ? 'Таҳрири хидмат' : 'Хидмати нав'}</h2>

            <div className="form-row-2">
              <div className="fg"><label>Slug *</label><input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="solar-energy" /></div>
              <div className="fg"><label>Тартиб</label><input type="number" value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} /></div>
            </div>
            <div className="fg"><label>Акс</label><ImageUpload value={form.image_url} onChange={v => set('image_url', v)} /></div>

            <div className="lang-tabs">
              {(['tg', 'ru', 'en'] as const).map(l => <button key={l} className={tab === l ? 'active' : ''} onClick={() => setTab(l)}>{l === 'tg' ? 'TJ' : l.toUpperCase()}</button>)}
            </div>
            <div className="fg"><label>Категория ({tab})</label><input value={form[`category_${tab}`]} onChange={e => set(`category_${tab}`, e.target.value)} /></div>
            <div className="fg"><label>Унвон ({tab})</label><input value={form[`title_${tab}`]} onChange={e => set(`title_${tab}`, e.target.value)} /></div>
            <div className="fg"><label>Тавсиф ({tab})</label><textarea rows={3} value={form[`description_${tab}`]} onChange={e => set(`description_${tab}`, e.target.value)} /></div>

            <hr style={{ margin: '20px 0', borderColor: '#f0f0f0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ color: '#546e7a', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>ХУСУСИЯТҲО</h3>
              <button className="admin-btn-sm" onClick={addFeature}>+ Илова</button>
            </div>

            {form.features.map((feat: any, i: number) => (
              <div key={i} style={{ background: '#f8faf8', borderRadius: 8, padding: 14, marginBottom: 10, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#78909c' }}>Хусусият #{i + 1}</span>
                  {form.features.length > 1 && (
                    <button onClick={() => removeFeature(i)} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>×</button>
                  )}
                </div>
                <div className="form-row-2">
                  <div className="fg" style={{ marginBottom: 8 }}><label>TJ</label><input value={feat.feature_tg} onChange={e => setFeature(i, 'feature_tg', e.target.value)} /></div>
                  <div className="fg" style={{ marginBottom: 8 }}><label>RU</label><input value={feat.feature_ru} onChange={e => setFeature(i, 'feature_ru', e.target.value)} /></div>
                </div>
                <div className="fg" style={{ marginBottom: 0 }}><label>EN</label><input value={feat.feature_en} onChange={e => setFeature(i, 'feature_en', e.target.value)} /></div>
              </div>
            ))}

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
