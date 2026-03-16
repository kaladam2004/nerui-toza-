import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../hooks/useApi';
import { AdminStyles } from './NewsAdmin';

const DEFAULTS: Record<string, string> = {
  calc_tariff_residential: '0.12',
  calc_tariff_commercial: '0.28',
  calc_tariff_industrial: '0.38',
  calc_irrad_dushanbe: '5.1',
  calc_irrad_khatlon: '5.9',
  calc_irrad_sughd: '4.7',
  calc_irrad_gbao: '5.5',
  calc_irrad_rrp: '5.0',
  calc_cost_per_kwp: '850',
  calc_usd_to_tjs: '10.9',
  calc_panel_w: '400',
};

export default function CalculatorAdmin() {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data),
  });

  useEffect(() => {
    if (settings) {
      const merged = { ...DEFAULTS };
      Object.keys(DEFAULTS).forEach(k => {
        if (settings[k]) merged[k] = settings[k];
      });
      setValues(merged);
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: () => api.put('/admin/settings', values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      qc.invalidateQueries({ queryKey: ['calc-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const set = (k: string, v: string) => setValues(prev => ({ ...prev, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20' }}>Ҳисобгари нерӯи офтобӣ — Танзим</h1>
        <button className="admin-btn" onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? '...' : saved ? '✅ Нигоҳ шуд' : 'Нигоҳ доштан'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Tariffs */}
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h3 style={{ color: '#1b5e20', marginBottom: 6, fontFamily: 'Playfair Display, serif' }}>⚡ Тарифҳои барқ</h3>
          <p style={{ fontSize: '0.82rem', color: '#78909c', marginBottom: 20 }}>Манбаъ: ВКЧДМСТ ва «Барқи Тоҷик», 2026</p>

          <div className="fg">
            <label>🏠 Хонагӣ (сомонӣ/kWh)</label>
            <input type="number" step="0.01" value={values.calc_tariff_residential} onChange={e => set('calc_tariff_residential', e.target.value)} />
            <small style={{ color: '#78909c' }}>То 150 kWh/ой — тарифи асосӣ</small>
          </div>
          <div className="fg">
            <label>🏢 Тиҷоратӣ (сомонӣ/kWh)</label>
            <input type="number" step="0.01" value={values.calc_tariff_commercial} onChange={e => set('calc_tariff_commercial', e.target.value)} />
          </div>
          <div className="fg">
            <label>🏭 Саноатӣ (сомонӣ/kWh)</label>
            <input type="number" step="0.01" value={values.calc_tariff_industrial} onChange={e => set('calc_tariff_industrial', e.target.value)} />
          </div>
          <hr style={{ margin: '20px 0', borderColor: '#f0f0f0' }} />
          <div className="fg">
            <label>💵 Курси USD ба TJS</label>
            <input type="number" step="0.1" value={values.calc_usd_to_tjs} onChange={e => set('calc_usd_to_tjs', e.target.value)} />
          </div>
          <div className="fg">
            <label>🔧 Арзиши насб ($/kWp)</label>
            <input type="number" value={values.calc_cost_per_kwp} onChange={e => set('calc_cost_per_kwp', e.target.value)} />
            <small style={{ color: '#78909c' }}>Нархи миёнаи бозор дар Тоҷикистон</small>
          </div>
          <div className="fg">
            <label>☀️ Қудрати панел (W)</label>
            <input type="number" value={values.calc_panel_w} onChange={e => set('calc_panel_w', e.target.value)} />
            <small style={{ color: '#78909c' }}>Стандарт: 400W (Jinko/Longi/JA Solar)</small>
          </div>
        </div>

        {/* Solar irradiation by region */}
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h3 style={{ color: '#1b5e20', marginBottom: 6, fontFamily: 'Playfair Display, serif' }}>🌞 Нурпазирии офтоб</h3>
          <p style={{ fontSize: '0.82rem', color: '#78909c', marginBottom: 20 }}>Манбаъ: NASA PVGIS, kWh/m²/рӯз — миёнаи солона</p>

          {[
            { key: 'calc_irrad_dushanbe', label: '🏙️ Душанбе' },
            { key: 'calc_irrad_khatlon',  label: '🌾 Хатлон (ҷануб)' },
            { key: 'calc_irrad_sughd',    label: '🏔️ Суғд (шимол)' },
            { key: 'calc_irrad_gbao',     label: '🗻 ВМКБ (шарқ)' },
            { key: 'calc_irrad_rrp',      label: '🌿 НТҶТ' },
          ].map(({ key, label }) => (
            <div className="fg" key={key}>
              <label>{label}</label>
              <input type="number" step="0.1" value={values[key]} onChange={e => set(key, e.target.value)} />
            </div>
          ))}

          <div style={{ background: '#e8f5e9', borderRadius: 10, padding: '12px 16px', marginTop: 10, fontSize: '0.82rem', color: '#2e7d32' }}>
            ℹ️ Маълумот: NASA PVGIS барои Тоҷикистон. 1 kWp система дар Тоҷикистон миёнаи 1600-2100 kWh/сол истеҳсол мекунад.
          </div>
        </div>
      </div>
      <AdminStyles />
    </div>
  );
}
