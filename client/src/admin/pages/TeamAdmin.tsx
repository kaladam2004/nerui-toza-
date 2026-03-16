import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../hooks/useApi';
import type { TeamMember } from '../../types';
import { AdminStyles } from './NewsAdmin';
import ImageUpload from '../components/ImageUpload';

const empty = {
  name_tg: '', name_ru: '', name_en: '',
  position_tg: '', position_ru: '', position_en: '',
  photo_url: '', linkedin_url: '', twitter_url: '', email: '',
  page: 'about', sort_order: 0,
};

export default function TeamAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [tab, setTab] = useState<'tg' | 'ru' | 'en'>('tg');

  const { data: members } = useQuery<TeamMember[]>({
    queryKey: ['admin-team'],
    queryFn: () => api.get('/team').then(r => r.data),
  });

  const upsert = useMutation({
    mutationFn: (d: any) => editing ? api.put(`/admin/team/${editing.id}`, d) : api.post('/admin/team', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-team'] }); close_(); },
  });

  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/team/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-team'] }),
  });

  function open(m?: TeamMember) {
    setEditing(m || null);
    setForm(m ? { ...m, linkedin_url: m.linkedin_url || '', twitter_url: m.twitter_url || '', email: m.email || '' } : empty);
    setModal(true);
  }
  function close_() { setModal(false); setEditing(null); setForm(empty); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20' }}>Дастаи мо</h1>
        <button className="admin-btn" onClick={() => open()}>+ Илова кун</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {members?.map(m => (
          <div key={m.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)', transition: 'transform .2s' }}>
            <div style={{ position: 'relative', height: 180, background: '#e8f5e9', overflow: 'hidden' }}>
              {m.photo_url
                ? <img src={m.photo_url} alt={m.name_tg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>👤</div>
              }
              <span style={{ position: 'absolute', top: 10, right: 10, background: '#2e7d32', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>{m.page}</span>
            </div>
            <div style={{ padding: 18 }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4, color: '#1b5e20' }}>{m.name_tg}</p>
              <p style={{ fontSize: '0.85rem', color: '#78909c', marginBottom: 14 }}>{m.position_tg}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => open(m)} className="admin-btn-sm" style={{ flex: 1 }}>Таҳрир</button>
                <button onClick={() => { if (confirm('Ҳазф?')) del.mutate(m.id); }} className="admin-btn-sm" style={{ background: '#c62828' }}>Ҳазф</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close_()}>
          <div className="modal-box" style={{ maxWidth: 680 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20', marginBottom: 25 }}>{editing ? 'Таҳрири узв' : 'Узви нав'}</h2>

            <div className="form-row-2">
              <div className="fg">
                <label>Саҳифа</label>
                <select value={form.page} onChange={e => set('page', e.target.value)}>
                  <option value="about">Дар бораи мо</option>
                  <option value="home">Саҳифаи асосӣ</option>
                  <option value="seminar">Семинар</option>
                </select>
              </div>
              <div className="fg"><label>Тартиб</label><input type="number" value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} /></div>
            </div>
            <div className="fg"><label>Акс</label><ImageUpload value={form.photo_url} onChange={v => set('photo_url', v)} /></div>

            <div className="lang-tabs">
              {(['tg', 'ru', 'en'] as const).map(l => <button key={l} className={tab === l ? 'active' : ''} onClick={() => setTab(l)}>{l === 'tg' ? 'TJ' : l.toUpperCase()}</button>)}
            </div>
            <div className="form-row-2">
              <div className="fg"><label>Ном ({tab})</label><input value={form[`name_${tab}`]} onChange={e => set(`name_${tab}`, e.target.value)} /></div>
              <div className="fg"><label>Вазифа ({tab})</label><input value={form[`position_${tab}`]} onChange={e => set(`position_${tab}`, e.target.value)} /></div>
            </div>

            <hr style={{ margin: '20px 0', borderColor: '#f0f0f0' }} />
            <h3 style={{ color: '#546e7a', marginBottom: 15, fontSize: '0.95rem', fontWeight: 600 }}>ИРТИБОТ</h3>
            <div className="fg"><label>Email</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@example.com" /></div>
            <div className="form-row-2">
              <div className="fg"><label>LinkedIn URL</label><input value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
              <div className="fg"><label>Twitter URL</label><input value={form.twitter_url} onChange={e => set('twitter_url', e.target.value)} placeholder="https://twitter.com/..." /></div>
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
