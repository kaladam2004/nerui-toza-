import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../hooks/useApi';
import type { Project } from '../../types';
import { AdminStyles } from './NewsAdmin';
import ImageUpload from '../components/ImageUpload';

const empty = { slug:'', category:'solar', image_url:'', location_tg:'', location_ru:'', location_en:'', year: new Date().getFullYear(), title_tg:'', title_ru:'', title_en:'', description_tg:'', description_ru:'', description_en:'', is_featured: false, sort_order: 0 };

export default function ProjectsAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [tab, setTab] = useState<'tg'|'ru'|'en'>('tg');

  const { data: projects } = useQuery<Project[]>({ queryKey: ['admin-projects'], queryFn: () => api.get('/projects').then(r => r.data) });
  const upsert = useMutation({ mutationFn: (d: any) => editing ? api.put(`/admin/projects/${editing.id}`, d) : api.post('/admin/projects', d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-projects'] }); qc.invalidateQueries({ queryKey: ['projects'] }); close_(); } });
  const del = useMutation({ mutationFn: (id: number) => api.delete(`/admin/projects/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-projects'] }); qc.invalidateQueries({ queryKey: ['projects'] }); } });

  function open(p?: Project) { setEditing(p || null); setForm(p ? { ...p, is_featured: !!p.is_featured } : empty); setModal(true); }
  function close_() { setModal(false); setEditing(null); setForm(empty); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const categories = ['solar','energy','education','conference','women','sme','other'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20' }}>Лоиҳаҳо</h1>
        <button className="admin-btn" onClick={() => open()}>+ Илова кун</button>
      </div>
      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f5f5f6' }}>
            <tr>{['Тасвир','Унвон (тоҷикӣ)','Категория','Сол','Пеш нишон','Амал'].map(h => <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#546e7a', fontSize: '0.85rem' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {projects?.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 16px' }}><img src={p.image_url} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} /></td>
                <td style={{ padding: '14px 16px', fontWeight: 500 }}>{p.title_tg}</td>
                <td style={{ padding: '14px 16px' }}><span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '3px 10px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600 }}>{p.category}</span></td>
                <td style={{ padding: '14px 16px', color: '#78909c' }}>{p.year}</td>
                <td style={{ padding: '14px 16px' }}>{p.is_featured ? '✅' : '—'}</td>
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
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close_()}>
          <div className="modal-box" style={{ maxWidth: 680 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20', marginBottom: 25 }}>{editing ? 'Таҳрири лоиҳа' : 'Лоиҳаи нав'}</h2>
            <div className="form-row-2">
              <div className="fg"><label>Slug *</label><input value={form.slug} onChange={e => set('slug', e.target.value)} /></div>
              <div className="fg"><label>Категория</label><select value={form.category} onChange={e => set('category', e.target.value)}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            <div className="fg"><label>Акс</label><ImageUpload value={form.image_url} onChange={v => set('image_url', v)} /></div>
            <div className="form-row-2">
              <div className="fg"><label>Сол</label><input type="number" value={form.year} onChange={e => set('year', +e.target.value)} /></div>
              <div className="fg"><label>Тартиб</label><input type="number" value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} /></div>
            </div>

            <div className="lang-tabs">
              {(['tg','ru','en'] as const).map(l => <button key={l} className={tab===l?'active':''} onClick={() => setTab(l)}>{l === 'tg' ? 'TJ' : l.toUpperCase()}</button>)}
            </div>
            <div className="fg"><label>Унвон ({tab})</label><input value={form[`title_${tab}`]} onChange={e => set(`title_${tab}`, e.target.value)} /></div>
            <div className="fg"><label>Ҷойгиршавӣ ({tab})</label><input value={form[`location_${tab}`]} onChange={e => set(`location_${tab}`, e.target.value)} /></div>
            <div className="fg"><label>Тавсиф ({tab})</label><textarea rows={4} value={form[`description_${tab}`]} onChange={e => set(`description_${tab}`, e.target.value)} /></div>

            <div className="fg" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} id="feat" />
              <label htmlFor="feat" style={{ margin: 0 }}>Дар саҳифаи асосӣ нишон бидеҳ</label>
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
