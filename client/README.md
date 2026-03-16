# Нерӯи Тоза — Frontend (Client)

React 18 + TypeScript + Vite 5 — сайти оммавӣ ва панели идоракунӣ.

---

## Технологияҳо

| Пакет | Вазифа |
|-------|--------|
| `react` + `react-dom` | UI framework |
| `typescript` | Типизатсия |
| `vite` | Сервери таҳия ва build |
| `react-router-dom` | Навигатсия (lazy loading) |
| `@tanstack/react-query` | Server state + кэш |
| `axios` | HTTP клиент (bо interceptor) |
| `i18next` + `react-i18next` | 3 забон: TJ / RU / EN |
| `react-leaflet` + `leaflet` | Харита |
| `gsap` + ScrollTrigger | Анимация |
| `@fortawesome/react-fontawesome` | Иконкаҳо |
| `react-hook-form` | Форми тамос |

---

## Сохтори папкаҳо

```
client/src/
├── App.tsx                        # Router + lazy loading + RequireAuth
│
├── pages/                         # Саҳифаҳои оммавӣ
│   ├── HomePage.tsx               # Hero, stats, features, timeline, projects, map, news, calculator CTA
│   ├── AboutPage.tsx              # Миссия, даста, таймлайн, шарикон
│   ├── ProjectsPage.tsx           # Лоиҳаҳо бо филтр по категория
│   ├── ServicesPage.tsx           # Хидматҳо бо хусусиятҳо
│   ├── NewsPage.tsx               # Ахбор (акс/YouTube/Vimeo/gallery) + "read more"
│   ├── CalculatorPage.tsx         # Ҳисобгари офтобӣ ва биогаз (аз API)
│   └── ContactPage.tsx            # Форми тамос + харитаи Leaflet
│
├── admin/
│   ├── AdminLogin.tsx             # Воридшавӣ (SVG логотип)
│   ├── AdminLayout.tsx            # Sidebar сегурӯҳа + SVG логотип
│   ├── components/
│   │   └── ImageUpload.tsx        # Тугмаи upload (муштарак барои ҳама формҳо)
│   └── pages/
│       ├── Dashboard.tsx          # Статистика
│       ├── NewsAdmin.tsx          # CRUD + upload акс + видео embed
│       ├── ProjectsAdmin.tsx      # CRUD + upload акс
│       ├── ServicesAdmin.tsx      # CRUD + хусусиятҳо + upload
│       ├── TeamAdmin.tsx          # CRUD + upload акс
│       ├── PartnersAdmin.tsx      # CRUD + upload логотип + carousel preview
│       ├── TimelineAdmin.tsx      # CRUD рушди сол ба сол
│       ├── CalculatorAdmin.tsx    # Таҳрири тарифҳо ва нурпазирӣ
│       ├── BackgroundsAdmin.tsx   # Заминаи ҳар саҳифа (акс/YouTube/opacity)
│       ├── ContactsAdmin.tsx      # Дидани паёмҳо
│       ├── MarkersAdmin.tsx       # Нишонаҳои харита
│       └── SettingsAdmin.tsx      # Танзимоти сайт
│
├── components/
│   ├── layout/
│   │   ├── Layout.tsx             # Header + PartnersCarousel + Footer
│   │   ├── Header.tsx             # Меню + SVG логотип
│   │   └── Footer.tsx
│   └── common/
│       ├── LanguageSwitcher.tsx   # TJ / RU / EN
│       ├── PageHero.tsx           # Hero бо акс ё YouTube видеои заминавӣ
│       └── PartnersCarousel.tsx   # Лентаи шарикон (CSS animation)
│
├── hooks/
│   ├── useApi.ts                  # Axios + JWT interceptor + auto-refresh
│   └── usePageBackground.ts      # Fetch заминаи саҳифа аз API
│
├── i18n/
│   ├── index.ts
│   └── locales/
│       ├── tg.json
│       ├── ru.json
│       └── en.json
│
├── styles/
│   └── globals.css
│
└── types/
    └── index.ts                   # Project, Service, TeamMember, NewsItem,
                                   # Partner, TimelineItem, PageBackground, ...
```

---

## Оғоз кардан

```bash
cd client && npm install && npm run dev
# ё аз решаи лоиҳа:
npm run dev
```

---

## Командаҳо

```bash
npm run dev      # http://localhost:5173 (HMR)
npm run build    # → dist/
npm run preview  # Пешнамоиши build
```

---

## Proxy (Development)

```typescript
// vite.config.ts
'/api':     → http://localhost:3002
'/uploads': → http://localhost:3002
```

---

## Навигатсия

### Оммавӣ

| URL | Саҳифа |
|-----|--------|
| `/` | Саҳифаи асосӣ |
| `/about` | Дар бораи мо |
| `/projects` | Лоиҳаҳо |
| `/services` | Хидматҳо |
| `/news` | Ахбор |
| `/calculator` | Ҳисобгар |
| `/contact` | Тамос |

### Admin (RequireAuth)

| URL | Бахш |
|-----|------|
| `/admin/login` | Воридшавӣ |
| `/admin/dashboard` | Бознамо |
| `/admin/projects` | Лоиҳаҳо |
| `/admin/news` | Ахбор |
| `/admin/services` | Хидматҳо |
| `/admin/team` | Даста |
| `/admin/partners` | Шарикон |
| `/admin/timeline` | Рушди мо |
| `/admin/calculator` | Ҳисобгар |
| `/admin/backgrounds` | Заминаҳо |
| `/admin/contacts` | Тамосҳо |
| `/admin/markers` | Харита |
| `/admin/settings` | Танзимот |

---

## Аутентификатсия

```
sessionStorage → accessToken (тоза мешавад баъди баста шудани браузер)
httpOnly cookie → refreshToken (7 рӯз)

Interceptor (useApi.ts):
  401 → POST /api/auth/refresh → токени нав
  Агар refresh хато → redirect /admin/login
```

---

## PageHero — заминаи динамикӣ

Ҳамаи саҳифаҳо аз `usePageBackground(pageKey)` заминаашонро мегиранд:

```tsx
<PageHero pageKey="home_hero" fallbackImage="https://...">
  ...контент...
</PageHero>
```

Агар `video_url` дар база бошад (YouTube) — видеои заминавӣ autoplay мешавад.
Агар не — `image_url` нишон дода мешавад.
Агар ҳеч чиз набошад — `fallbackImage` истифода мешавад.

---

## ImageUpload — бор кардани акс

Компоненти муштараки `admin/components/ImageUpload.tsx` дар ҳамаи формҳо:

```tsx
<ImageUpload value={form.image_url} onChange={v => set('image_url', v)} />
```

- URL дастӣ ворид карда мешавад
- Ё файл аз компютер интихоб мешавад → POST `/api/admin/upload` → URL

---

## PartnersCarousel

```tsx
// Layout.tsx — байни <Outlet /> ва <Footer />
<PartnersCarousel />
```

- Аксро пахш кунед → ба сомонаи шарик меравад
- Hover → animation мемонад
- Маъмул аз `/api/partners` (фақат is_visible = 1)

---

## Ҳисобгар — аз API

`CalculatorPage.tsx` тарифҳоро аз `/api/settings` (калидҳои `calc_*`) мехонад.
Admin метавонад тариф, нурпазирии минтақаҳо, нархи доллар ва ғайраро аз `CalculatorAdmin` иваз кунад.

---

## Забонҳо

```typescript
const { t, i18n } = useTranslation();
t('nav.home')              // "Асосӣ" | "Главная" | "Home"
i18n.changeLanguage('ru')
```

Забон дар `localStorage` ҳамчун `selectedLanguage` нигоҳ дошта мешавад.

---

## CSS Рангҳо

```css
--primary:       #2e7d32
--primary-dark:  #1b5e20
--primary-light: #4caf50
--accent:        #8bc34a
--text:          #263238
--text-light:    #546e7a
```
