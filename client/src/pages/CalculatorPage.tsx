import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '../hooks/useApi';
import type { Settings } from '../types';
import PageHero from '../components/common/PageHero';

// ── Biogas constants (FAO standards) ─────────────────────────────────────────
const BIOGAS_PER_COW  = 2.0;
const BIOGAS_PER_PIG  = 0.4;
const BIOGAS_PER_GOAT = 0.3;
const BIOGAS_HEAT_KWH = 6.0;
const FIREWOOD_KG_PER_KWH = 0.43;
const FIREWOOD_PRICE_TJS = 2.0;
const PANEL_AREA = 1.8; // m² per panel

type Tab = 'solar' | 'biogas';

export default function CalculatorPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('solar');

  const { data: settings } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data),
    staleTime: 1000 * 60 * 10,
  });

  // ── Read from API settings (with defaults) ────────────────────────────────
  const s = settings || {} as Settings;
  const tariff_residential = parseFloat(s.calc_tariff_residential || '0.09');
  const tariff_commercial  = parseFloat(s.calc_tariff_commercial  || '0.22');
  const tariff_industrial  = parseFloat(s.calc_tariff_industrial  || '0.28');
  const usdToTjs           = parseFloat(s.calc_usd_to_tjs         || '10.9');
  const panelW             = parseFloat(s.calc_panel_w            || '400');
  const systemEff          = parseFloat(s.calc_system_eff         || '0.80');
  const costPerKwpUsd      = parseFloat(s.calc_cost_per_kwp_usd   || '850');
  const co2PerKwh          = parseFloat(s.calc_co2_per_kwh        || '0.22');

  const TARIFFS = { residential: tariff_residential, commercial: tariff_commercial, industrial: tariff_industrial };

  const REGIONS: Record<string, { label: string; kwh: number }> = {
    dushanbe: { label: 'Душанбе', kwh: parseFloat(s.calc_irr_dushanbe || '5.1') },
    khatlon:  { label: 'Хатлон', kwh: parseFloat(s.calc_irr_khatlon  || '5.9') },
    sughd:    { label: 'Суғд',   kwh: parseFloat(s.calc_irr_sughd    || '4.7') },
    gbao:     { label: 'ВМКБ',   kwh: parseFloat(s.calc_irr_gbao     || '5.5') },
    rrp:      { label: 'НТҶТ',   kwh: parseFloat(s.calc_irr_rrp      || '5.0') },
  };

  // ── Solar state ───────────────────────────────────────────────────────────
  const [monthlyBill, setMonthlyBill] = useState(150);
  const [tariffType, setTariffType] = useState<'residential' | 'commercial' | 'industrial'>('residential');
  const [region, setRegion] = useState('dushanbe');
  const [roofArea, setRoofArea] = useState(30);

  // ── Biogas state ──────────────────────────────────────────────────────────
  const [cows, setCows]   = useState(3);
  const [pigs, setPigs]   = useState(0);
  const [goats, setGoats] = useState(2);

  // ── Solar calculations ────────────────────────────────────────────────────
  const tariff         = TARIFFS[tariffType];
  const monthlyKwh     = monthlyBill / tariff;
  const dailyKwh       = monthlyKwh / 30;
  const irrad          = (REGIONS[region] || REGIONS.dushanbe).kwh;
  const systemKwp      = Math.ceil((dailyKwh / (irrad * systemEff)) * 10) / 10;
  const panelCount     = Math.ceil((systemKwp * 1000) / panelW);
  const panelCountRoof = Math.floor(roofArea / PANEL_AREA);
  const finalPanels    = Math.min(panelCount, panelCountRoof);
  const finalKwp       = (finalPanels * panelW) / 1000;
  const annualGen      = finalKwp * irrad * 365 * systemEff;
  const annualSavings  = annualGen * tariff;
  const systemCostUSD  = finalKwp * costPerKwpUsd;
  const systemCostTJS  = systemCostUSD * usdToTjs;
  const payback        = annualSavings > 0 ? systemCostTJS / annualSavings : 0;
  const co2Saved       = annualGen * co2PerKwh;
  const coverage       = Math.min(100, Math.round((annualGen / (monthlyKwh * 12)) * 100));

  // ── Biogas calculations ───────────────────────────────────────────────────
  const dailyBiogas   = cows * BIOGAS_PER_COW + pigs * BIOGAS_PER_PIG + goats * BIOGAS_PER_GOAT;
  const annualBiogas  = dailyBiogas * 365;
  const annualHeat    = annualBiogas * BIOGAS_HEAT_KWH;
  const firewoodSaved = annualHeat * FIREWOOD_KG_PER_KWH;
  const moneySaved    = firewoodSaved * FIREWOOD_PRICE_TJS;
  const biogasKwh     = annualBiogas * 1.4;
  const plantCostTJS  = (dailyBiogas * 500 + 2000) * usdToTjs / 10;
  const biogasPayback = moneySaved > 0 ? plantCostTJS / moneySaved : 0;

  const iNum = (n: number, d = 0) => n.toLocaleString('ru', { maximumFractionDigits: d });

  return (
    <div>
      <PageHero pageKey="calc_hero" fallbackImage="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=2000&q=80">
        <div className="container">
          <div className="hero-content">
            <h1>{t('calculator.title')}</h1>
            <p>{t('calculator.subtitle')}</p>
          </div>
        </div>
      </PageHero>

      <section className="section" style={{ background: 'var(--light)' }}>
        <div className="container" style={{ maxWidth: 960 }}>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 40, background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.08)' }}>
            {([['solar', '☀️', t('calculator.solar_tab')], ['biogas', '🌿', t('calculator.biogas_tab')]] as const).map(([key, icon, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                flex: 1, padding: '18px 24px', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700, fontSize: '1rem', transition: 'all 0.3s',
                background: tab === key ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'transparent',
                color: tab === key ? 'white' : 'var(--text-light)',
              }}>
                {icon} {label}
              </button>
            ))}
          </div>

          {/* ── SOLAR TAB ── */}
          {tab === 'solar' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
              <div style={{ background: 'white', borderRadius: 20, padding: 35, boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>
                <h2 style={{ color: 'var(--primary-dark)', marginBottom: 28, fontFamily: 'Playfair Display, serif', fontSize: '1.5rem' }}>
                  ☀️ {t('calculator.solar_title')}
                </h2>

                <CalcField label={t('calculator.monthly_bill')} unit="сомонӣ">
                  <input type="range" min={20} max={2000} step={10} value={monthlyBill} onChange={e => setMonthlyBill(+e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                  <div style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>{iNum(monthlyBill)} сом.</div>
                  <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)' }}>≈ {iNum(monthlyKwh, 0)} kWh/ой</div>
                </CalcField>

                <CalcField label={t('calculator.consumer_type')} unit="">
                  <select value={tariffType} onChange={e => setTariffType(e.target.value as typeof tariffType)} style={selectStyle}>
                    <option value="residential">🏠 Хонагӣ — {tariff_residential} сом/kWh</option>
                    <option value="commercial">🏢 Тиҷоратӣ — {tariff_commercial} сом/kWh</option>
                    <option value="industrial">🏭 Саноатӣ — {tariff_industrial} сом/kWh</option>
                  </select>
                </CalcField>

                <CalcField label={t('calculator.region')} unit="">
                  <select value={region} onChange={e => setRegion(e.target.value)} style={selectStyle}>
                    {Object.entries(REGIONS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label} — {v.kwh} kWh/m²/рӯз</option>
                    ))}
                  </select>
                </CalcField>

                <CalcField label={t('calculator.roof_area')} unit="m²">
                  <input type="range" min={5} max={200} step={5} value={roofArea} onChange={e => setRoofArea(+e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                  <div style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>{roofArea} м²</div>
                </CalcField>

                <div style={{ background: '#e8f5e9', borderRadius: 10, padding: '12px 16px', fontSize: '0.82rem', color: '#2e7d32', marginTop: 10 }}>
                  ℹ️ Тариф тибқи санади КДБВТ ва «Барқи Тоҷик», 2026.
                  Нурпазирии офтоб аз маълумоти NASA/PVGIS барои Тоҷикистон.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ResultCard emoji="⚡" label={t('calculator.system_size')} value={`${finalKwp} кВт`} sub={`${finalPanels} плитаи ${panelW}W`} color="#f57f17" />
                <ResultCard emoji="🔆" label={t('calculator.annual_gen')} value={`${iNum(annualGen, 0)} kWh`} sub={`${iNum(annualGen / 12, 0)} kWh/ой`} color="#1565c0" />
                <ResultCard emoji="💰" label={t('calculator.annual_savings')} value={`${iNum(annualSavings, 0)} сом.`} sub={`${iNum(annualSavings / 12, 0)} сом./ой`} color="#2e7d32" />
                <ResultCard emoji="🏷️" label={t('calculator.system_cost')} value={`${iNum(systemCostTJS, 0)} сом.`} sub={`≈ $${iNum(systemCostUSD, 0)}`} color="#6a1b9a" />
                <ResultCard emoji="📅" label={t('calculator.payback')} value={`${iNum(payback, 1)} сол`} sub={`${coverage}% истеъмолро мепӯшад`} color="#c62828" />
                <ResultCard emoji="🌱" label={t('calculator.co2_saved')} value={`${iNum(co2Saved, 0)} кг/сол`} sub="CO₂ камшавӣ" color="#558b2f" />
              </div>
            </div>
          )}

          {/* ── BIOGAS TAB ── */}
          {tab === 'biogas' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
              <div style={{ background: 'white', borderRadius: 20, padding: 35, boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>
                <h2 style={{ color: 'var(--primary-dark)', marginBottom: 28, fontFamily: 'Playfair Display, serif', fontSize: '1.5rem' }}>
                  🌿 {t('calculator.biogas_title')}
                </h2>

                <CalcField label="🐄 Гов (сар)" unit="сар">
                  <input type="range" min={0} max={50} value={cows} onChange={e => setCows(+e.target.value)} style={{ width: '100%', accentColor: '#795548' }} />
                  <div style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, color: '#795548' }}>{cows} сар</div>
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-light)' }}>× {BIOGAS_PER_COW} м³/рӯз = {(cows * BIOGAS_PER_COW).toFixed(1)} м³</div>
                </CalcField>

                <CalcField label="🐖 Хук (сар)" unit="сар">
                  <input type="range" min={0} max={100} value={pigs} onChange={e => setPigs(+e.target.value)} style={{ width: '100%', accentColor: '#e91e63' }} />
                  <div style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, color: '#e91e63' }}>{pigs} сар</div>
                </CalcField>

                <CalcField label="🐐 Буз (сар)" unit="сар">
                  <input type="range" min={0} max={100} value={goats} onChange={e => setGoats(+e.target.value)} style={{ width: '100%', accentColor: '#ff9800' }} />
                  <div style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, color: '#ff9800' }}>{goats} сар</div>
                </CalcField>

                <div style={{ background: '#e8f5e9', borderRadius: 10, padding: '12px 16px', fontSize: '0.82rem', color: '#2e7d32', marginTop: 15 }}>
                  ℹ️ Ҳисоб тибқи стандартҳои FAO ва таҷрибаи лоиҳаҳои биогазии Тоҷикистон. 1 м³ биогаз ≈ {BIOGAS_HEAT_KWH} kWh гармӣ.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ResultCard emoji="💨" label="Биогаз дар рӯз" value={`${dailyBiogas.toFixed(1)} м³`} sub={`${iNum(annualBiogas, 0)} м³/сол`} color="#795548" />
                <ResultCard emoji="🔥" label="Гармии солона" value={`${iNum(annualHeat, 0)} kWh`} sub="ҳарорат ва пухтупаз" color="#f57f17" />
                <ResultCard emoji="🪵" label="Ҳезум сарфа" value={`${iNum(firewoodSaved, 0)} кг/сол`} sub="ё ангишт/яшмоқ" color="#4e342e" />
                <ResultCard emoji="💰" label="Пул сарфа" value={`${iNum(moneySaved, 0)} сом./сол`} sub={`${iNum(moneySaved / 12, 0)} сом./ой`} color="#2e7d32" />
                <ResultCard emoji="💡" label="Барқи эквивалентӣ" value={`${iNum(biogasKwh, 0)} kWh/сол`} sub="агар генератор бошад" color="#1565c0" />
                <ResultCard emoji="📅" label="Ҷуброни сармоя" value={`${iNum(biogasPayback, 1)} сол`} sub={`Арзиши иншоот ≈ ${iNum(plantCostTJS, 0)} сом.`} color="#c62828" />
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ background: 'white', borderRadius: 14, padding: '18px 24px', marginTop: 30, fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.7, boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
            <strong style={{ color: 'var(--primary-dark)' }}>⚠️ Эзоҳ:</strong> Ин ҳисобгар барои тахминии аввалия пешбинӣ шудааст.
            Натиҷаҳои дақиқтар аз тарафи мутахассисони «Нерӯи Тоза» баъди баррасии ҷойи мушаххас пешниҳод карда мешаванд.
            Нарх ва тариф аз сенаи бозор вобаста буда метавонанд тағйир ёбанд.
            <br />
            <strong>Маълумот:</strong> Тарифҳои ВКЧДМСТ ва «Барқи Тоҷик», 2026 | Нурпазирии офтоб: NASA PVGIS | Биогаз: FAO Technical Manual.
          </div>
        </div>
      </section>

      <style>{`
        input[type="range"] { height: 6px; border-radius: 3px; cursor: pointer; }
        @media (max-width: 768px) { .calc-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function CalcField({ label, unit, children }: { label: string; unit: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{label}</span>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>{unit}</span>
      </div>
      {children}
    </div>
  );
}

function ResultCard({ emoji, label, value, sub, color }: { emoji: string; label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '18px 22px', boxShadow: '0 2px 12px rgba(0,0,0,.06)', borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>{emoji}</div>
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, color }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '2px solid #e0e0e0',
  borderRadius: 8, fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem',
  outline: 'none', color: 'var(--text)', background: 'white', cursor: 'pointer',
};
