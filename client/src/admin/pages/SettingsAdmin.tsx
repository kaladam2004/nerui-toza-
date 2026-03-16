import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../hooks/useApi';
import type { Settings } from '../../types';
import { AdminStyles } from './NewsAdmin';

export default function SettingsAdmin() {
  const qc = useQueryClient();
  const { data: settings } = useQuery<Settings>({ queryKey: ['settings'], queryFn: () => api.get('/settings').then(r => r.data) });
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (settings) setForm({ ...settings }); }, [settings]);

  const save = useMutation({
    mutationFn: () => api.put('/admin/settings', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); setSaved(true); setTimeout(() => setSaved(false), 2500); },
  });

  const groups = [
    { title: 'Тамос', keys: ['phone_primary','phone_secondary','email_primary','email_secondary'] },
    { title: 'Суроға (3 забон)', keys: ['address_tg','address_ru','address_en'] },
    { title: 'Соатҳои кор', keys: ['working_hours_tg','working_hours_ru','working_hours_en'] },
    { title: 'Шабакаҳои иҷтимоӣ', keys: ['telegram_url','facebook_url','instagram_url','youtube_url'] },
    { title: 'Статистика (Hero)', keys: ['hero_stats_projects','hero_stats_capacity','hero_stats_families'] },
  ];

  const labels: Record<string, string> = {
    phone_primary: 'Телефон асосӣ', phone_secondary: 'Телефон иловагӣ',
    email_primary: 'Email асосӣ', email_secondary: 'Email иловагӣ',
    address_tg: 'Суроға (тоҷикӣ)', address_ru: 'Адрес (русский)', address_en: 'Address (English)',
    working_hours_tg: 'Соатҳои кор (тоҷикӣ)', working_hours_ru: 'Часы работы (рус)', working_hours_en: 'Working hours (en)',
    telegram_url: 'Telegram URL', facebook_url: 'Facebook URL', instagram_url: 'Instagram URL', youtube_url: 'YouTube URL',
    hero_stats_projects: 'Лоиҳаҳо (stat)', hero_stats_capacity: 'Иқтидор (stat)', hero_stats_families: 'Оилаҳо (stat)',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20' }}>Танзимот</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {saved && <span style={{ color: '#2e7d32', fontWeight: 600 }}>✅ Нигоҳ дошта шуд</span>}
          <button className="admin-btn" onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? 'Нигоҳ...' : 'Ҳамаро нигоҳ дор'}
          </button>
        </div>
      </div>

      {groups.map(g => (
        <div key={g.title} style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 24 }}>
          <h3 style={{ color: '#1b5e20', marginBottom: 20, fontFamily: 'Playfair Display, serif', fontSize: '1.1rem' }}>{g.title}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {g.keys.map(k => (
              <div key={k} className="fg">
                <label>{labels[k] || k}</label>
                <input value={form[k] || ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <AdminStyles />
    </div>
  );
}
