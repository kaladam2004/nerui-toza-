import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../hooks/useApi';
import type { PageBackground } from '../../types';
import { AdminStyles } from './NewsAdmin';

export default function BackgroundsAdmin() {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const { data: backgrounds } = useQuery<PageBackground[]>({
    queryKey: ['admin-backgrounds'],
    queryFn: () => api.get('/page-backgrounds').then(r => r.data),
  });

  const [localValues, setLocalValues] = useState<Record<string, Partial<PageBackground>>>({});

  function getVal(bg: PageBackground, field: keyof PageBackground): any {
    return localValues[bg.page_key]?.[field] ?? bg[field];
  }

  function setVal(key: string, field: keyof PageBackground, val: any) {
    setLocalValues(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
  }

  async function handleUpload(pageKey: string, file: File) {
    setUploading(pageKey);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/admin/upload', fd);
      setVal(pageKey, 'image_url', data.url);
    } finally {
      setUploading(null);
    }
  }

  async function handleSave(bg: PageBackground) {
    setSaving(bg.page_key);
    try {
      const updated = { ...bg, ...localValues[bg.page_key] };
      await api.put(`/admin/page-backgrounds/${bg.page_key}`, updated);
      qc.invalidateQueries({ queryKey: ['admin-backgrounds'] });
      qc.invalidateQueries({ queryKey: ['page-backgrounds'] });
      setSaved(bg.page_key);
      setTimeout(() => setSaved(null), 2500);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20', marginBottom: 8 }}>Заминаи саҳифаҳо</h1>
      <p style={{ color: '#78909c', marginBottom: 28, fontSize: '0.9rem' }}>Аксро бор кунед (дар сервер нигоҳ дошта мешавад). Барои видеои заминавӣ — URL-и YouTube-ро гузоред.</p>

      <div style={{ display: 'grid', gap: 20 }}>
        {backgrounds?.map(bg => {
          const imgUrl = getVal(bg, 'image_url') as string;
          const videoUrl = getVal(bg, 'video_url') as string;
          const opacity = getVal(bg, 'overlay_opacity') as number;
          const isSaving = saving === bg.page_key;
          const isSaved  = saved  === bg.page_key;
          const isUploading = uploading === bg.page_key;

          return (
            <div key={bg.page_key} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0 }}>
                {/* Preview */}
                <div style={{ position: 'relative', height: 160, background: '#263238', overflow: 'hidden' }}>
                  {imgUrl && <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1 - opacity }} />}
                  <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${opacity})`, display: 'flex', alignItems: 'flex-end', padding: 14 }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,.6)', marginBottom: 2 }}>{bg.page_key}</div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{bg.page_label}</div>
                    </div>
                  </div>
                  {videoUrl && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: '#c62828', color: 'white', padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>▶ VIDEO</div>
                  )}
                </div>

                {/* Controls */}
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                    <div className="fg" style={{ marginBottom: 0 }}>
                      <label>URL акс</label>
                      <input value={imgUrl} onChange={e => setVal(bg.page_key, 'image_url', e.target.value)} placeholder="https://... ё /uploads/..." style={{ fontSize: '0.82rem' }} />
                    </div>
                    <div className="fg" style={{ marginBottom: 0 }}>
                      <label>URL видеои заминавӣ (YouTube autoplay)</label>
                      <input value={videoUrl} onChange={e => setVal(bg.page_key, 'video_url', e.target.value)} placeholder="https://youtube.com/watch?v=..." style={{ fontSize: '0.82rem' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14 }}>
                    {/* Upload button */}
                    <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, background: '#e8f5e9', color: '#2e7d32', padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600 }}>
                      {isUploading ? '⏳ Бор мешавад...' : '📁 Аксро бор кун'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleUpload(bg.page_key, e.target.files[0]); }} />
                    </label>

                    {/* Opacity */}
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.82rem', color: '#546e7a', fontWeight: 600 }}>Торики ниқоб: {Math.round(opacity * 100)}%</span>
                      <input type="range" min="0" max="1" step="0.05" value={opacity}
                        onChange={e => setVal(bg.page_key, 'overlay_opacity', +e.target.value)}
                        style={{ width: '100%', accentColor: '#2e7d32', marginTop: 4 }} />
                    </div>
                  </div>

                  <button className="admin-btn" onClick={() => handleSave(bg)} disabled={isSaving} style={{ fontSize: '0.85rem' }}>
                    {isSaving ? '...' : isSaved ? '✅ Нигоҳ шуд' : 'Нигоҳ доштан'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <AdminStyles />
    </div>
  );
}
