import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../hooks/useApi';
import type { NewsItem } from '../../types';
import ImageUpload from '../components/ImageUpload';

const empty = {
  slug: '', title_tg: '', title_ru: '', title_en: '',
  body_tg: '', body_ru: '', body_en: '',
  cover_image: '', video_url: '', category: 'news', is_published: false, published_at: '',
};

export default function NewsAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);
  const [tab, setTab] = useState<'tg'|'ru'|'en'>('tg');

  const { data: items } = useQuery<NewsItem[]>({ queryKey: ['admin-news'], queryFn: () => api.get('/news').then(r => r.data) });

  const upsert = useMutation({
    mutationFn: (data: any) => editing ? api.put(`/admin/news/${editing.id}`, data) : api.post('/admin/news', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-news'] }); closeModal(); },
  });

  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/news/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-news'] }),
  });

  const publish = useMutation({
    mutationFn: (id: number) => api.put(`/admin/news/${id}/publish`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-news'] }),
  });

  function openCreate() { setEditing(null); setForm(empty); setModal(true); }
  function openEdit(item: NewsItem) {
    setEditing(item);
    setForm({ ...item, is_published: !!item.is_published });
    setModal(true);
  }
  function closeModal() { setModal(false); setEditing(null); setForm(empty); }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20' }}>Ахбор</h1>
        <button className="admin-btn" onClick={openCreate}>+ Илова кун</button>
      </div>

      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f5f5f6' }}>
            <tr>{['Унвон (тоҷикӣ)', 'Навъ', 'Медиа', 'Вазъ', 'Санаи нашр', 'Амал'].map(h => (
              <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#546e7a', fontSize: '0.85rem' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items?.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '14px 16px', fontWeight: 500, maxWidth: 250 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title_tg}</div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#78909c' }}>{item.category}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600,
                    background: item.media_type === 'youtube' ? '#ffebee' : item.media_type === 'image' ? '#e8f5e9' : '#fff3e0',
                    color: item.media_type === 'youtube' ? '#c62828' : item.media_type === 'image' ? '#2e7d32' : '#e65100' }}>
                    {item.media_type}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600,
                    background: item.is_published ? '#e8f5e9' : '#fff3e0', color: item.is_published ? '#2e7d32' : '#e65100' }}>
                    {item.is_published ? 'Нашршуда' : 'Пешнавис'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#78909c' }}>{item.published_at ? new Date(item.published_at).toLocaleDateString() : '—'}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!item.is_published && <button onClick={() => publish.mutate(item.id)} className="admin-btn-sm" style={{ background: '#1565c0' }}>Нашр</button>}
                    <button onClick={() => openEdit(item)} className="admin-btn-sm">Таҳрир</button>
                    <button onClick={() => { if (confirm('Ҳазф?')) del.mutate(item.id); }} className="admin-btn-sm" style={{ background: '#c62828' }}>Ҳазф</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box" style={{ maxWidth: 700 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20', marginBottom: 25 }}>{editing ? 'Таҳрири ахбор' : 'Ахбори нав'}</h2>

            <div className="form-row-2">
              <div className="fg"><label>Slug *</label><input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="news-slug-2024" /></div>
              <div className="fg"><label>Категория</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}>
                  {['news','project_update','seminar','announcement'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="lang-tabs">
              {(['tg','ru','en'] as const).map(l => <button key={l} className={tab===l?'active':''} onClick={() => setTab(l)}>{l === 'tg' ? 'TJ' : l.toUpperCase()}</button>)}
            </div>

            <div className="fg"><label>Унвон ({tab})</label><input value={form[`title_${tab}`]} onChange={e => set(`title_${tab}`, e.target.value)} /></div>
            <div className="fg"><label>Матн ({tab})</label><textarea rows={5} value={form[`body_${tab}`]} onChange={e => set(`body_${tab}`, e.target.value)} placeholder="<p>Матн инҷо...</p>" /></div>

            <hr style={{ margin: '20px 0', borderColor: '#f0f0f0' }} />
            <h3 style={{ color: '#546e7a', marginBottom: 15, fontSize: '0.95rem', fontWeight: 600 }}>МЕДИА</h3>

            <div className="fg"><label>Акс (cover image)</label><ImageUpload value={form.cover_image} onChange={v => set('cover_image', v)} /></div>
            <div className="fg">
              <label>URL видео (YouTube / Vimeo / файл)</label>
              <input value={form.video_url} onChange={e => set('video_url', e.target.value)} placeholder="https://youtube.com/watch?v=..." />
              <small style={{ color: '#78909c', marginTop: 4 }}>YouTube ва Vimeo автоматӣ embed мешаванд</small>
            </div>

            {form.video_url && (form.video_url.includes('youtube') || form.video_url.includes('youtu.be')) && (
              <div style={{ background: '#ffebee', padding: 12, borderRadius: 8, fontSize: '0.85rem', color: '#c62828', marginBottom: 15 }}>
                🎬 YouTube embed автоматӣ насб мешавад
              </div>
            )}

            <div className="fg" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} id="pub" />
              <label htmlFor="pub" style={{ margin: 0 }}>Фавран нашр кун</label>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 25 }}>
              <button className="admin-btn" onClick={() => upsert.mutate(form)} disabled={upsert.isPending}>{upsert.isPending ? 'Нигоҳ...' : 'Нигоҳ доштан'}</button>
              <button className="admin-btn-cancel" onClick={closeModal}>Бекор</button>
            </div>
          </div>
        </div>
      )}

      <AdminStyles />
    </div>
  );
}

export function AdminStyles() {
  return (
    <style>{`
      .admin-btn { padding: 10px 22px; background: #2e7d32; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: 'Montserrat', sans-serif; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; }
      .admin-btn:hover { background: #1b5e20; }
      .admin-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .admin-btn-sm { padding: 6px 14px; background: #2e7d32; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.2s; font-family: 'Montserrat', sans-serif; }
      .admin-btn-cancel { padding: 10px 22px; background: #f5f5f6; color: #546e7a; border: none; border-radius: 8px; cursor: pointer; font-family: 'Montserrat', sans-serif; font-weight: 600; }
      .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
      .modal-box { background: white; border-radius: 20px; padding: 35px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 60px rgba(0,0,0,.3); }
      .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      .fg { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
      .fg label { font-weight: 600; font-size: 0.85rem; color: #546e7a; }
      .fg input, .fg select, .fg textarea { padding: 11px 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.9rem; outline: none; transition: border 0.2s; color: #263238; }
      .fg input:focus, .fg select:focus, .fg textarea:focus { border-color: #2e7d32; }
      .fg textarea { resize: vertical; }
      .lang-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
      .lang-tabs button { padding: 7px 18px; border: 2px solid #e0e0e0; border-radius: 20px; background: transparent; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; font-family: 'Montserrat', sans-serif; }
      .lang-tabs button.active { background: #2e7d32; color: white; border-color: #2e7d32; }
      @media (max-width: 600px) { .form-row-2 { grid-template-columns: 1fr; } }
    `}</style>
  );
}
