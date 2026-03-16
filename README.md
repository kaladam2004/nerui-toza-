# Нерӯи Тоза — Вебсайти расмӣ

Вебсайти расмии ташкилоти ғайритиҷоратии **«Нерӯи Тоза»** — ташвиқи энергияи тоза дар Тоҷикистон.

Лоиҳа дорои **сайти оммавӣ** (Тоҷикӣ / Русӣ / Англисӣ) ва **панели идоракунӣ** (Admin Panel) мебошад.

---

## Технологияҳо

| Қисм | Технология |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite 5 |
| Backend | Node.js v24 + Express + TypeScript |
| База | SQLite (`node:sqlite` — ҷузъи дохилии Node.js) |
| Auth | JWT (access 15 дақ) + httpOnly refresh cookie (7 рӯз) |
| i18n | i18next — 3 забон: **TJ** / RU / EN |
| Харита | React-Leaflet + OpenStreetMap |
| Анимация | GSAP + ScrollTrigger |
| Видео | YouTube / Vimeo автоматӣ embed |
| Аксҳо | Сервер (multer → `/uploads/`) |
| Ҳисобгар | Тарифҳои Барқи Тоҷик 2026 + NASA PVGIS |

---

## Сохтори лоиҳа

```
nerui-toza-app/
├── package.json          # Root — як командаи оғоз
├── .env                  # Тағйирёбандаҳои муҳит
├── nerui-toza.db         # SQLite база (баъди seed)
├── uploads/              # Акс ва видеоҳои бор шуда (сервер)
│
├── server/               # Backend (Node.js + Express)
│   └── src/
│       ├── controllers/  # Логикаи API
│       ├── database/     # Migrate + Connection
│       ├── middleware/   # Auth + Error handler
│       ├── utils/        # Video URL parser
│       └── seed/         # Додаҳои аввалия
│
└── client/               # Frontend (React + Vite)
    └── src/
        ├── pages/        # Саҳифаҳои оммавӣ (7 та)
        ├── admin/        # Панели идоракунӣ (12 бахш)
        ├── components/   # Header, Footer, PageHero, PartnersCarousel
        ├── hooks/        # useApi, usePageBackground
        ├── i18n/         # Тарҷумаҳо (tg/ru/en)
        ├── styles/       # globals.css
        └── types/        # TypeScript интерфейсҳо
```

---

## Оғоз кардан

### 1. Насб кардани вобастагиҳо

```bash
npm run install:all
```

### 2. Танзими `.env`

```env
PORT=3002
NODE_ENV=development
JWT_SECRET=nerui_toza_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=nerui_toza_refresh_secret_change_in_production
DB_PATH=./nerui-toza.db
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=./uploads
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

> ⚠️ **Барои продакшн:** `JWT_SECRET` ва `JWT_REFRESH_SECRET`-ро иваз кунед!

### 3. Тайёр кардани база

```bash
npm run seed
```

Ин команда ҳамаи 13 миграцияро мегузаронад ва додаҳои намунавӣ мегузорад:
- Корбари admin (`admin` / `admin123`)
- Лоиҳаҳо, хидматҳо, аъзоёни даста
- Заминаҳои саҳифаҳо (7 та), таймлайн (5 та)
- Танзимоти ҳисобгар (тарифҳои Барқи Тоҷик 2026)
- Нишонаҳои харита

### 4. Оғоз (Development)

```bash
npm run dev
```

- 🖥️ **Backend:** `http://localhost:3002`
- 🌐 **Frontend:** `http://localhost:5173`

---

## Логини Admin Panel

```
URL:    http://localhost:5173/admin
Логин:  admin
Парол:  admin123
```

---

## Саҳифаҳои оммавӣ

| URL | Саҳифа |
|-----|--------|
| `/` | Саҳифаи асосӣ |
| `/about` | Дар бораи мо |
| `/projects` | Лоиҳаҳо |
| `/services` | Хидматҳо |
| `/news` | Ахбор |
| `/calculator` | Ҳисобгари нерӯи офтобӣ ва биогаз |
| `/contact` | Тамос |

## Панели Admin

| URL | Бахш |
|-----|------|
| `/admin/dashboard` | Бознамои умумӣ |
| `/admin/projects` | CRUD лоиҳаҳо + upload акс |
| `/admin/news` | CRUD ахбор + видео + upload |
| `/admin/services` | CRUD хидматҳо + хусусиятҳо |
| `/admin/team` | CRUD аъзоёни даста |
| `/admin/partners` | CRUD шарикон (carousel) |
| `/admin/timeline` | CRUD рушди сол ба сол |
| `/admin/calculator` | Тарифҳо + нурпазирии минтақаҳо |
| `/admin/backgrounds` | Заминаи ҳар саҳифа (акс/видео/opacity) |
| `/admin/contacts` | Паёмҳои ворид шуда |
| `/admin/markers` | Нишонаҳои харита |
| `/admin/settings` | Танзимоти сайт |

---

## Командаҳо

```bash
npm run dev          # Оғоз (server + client)
npm run build        # Продакшн build
npm run start        # Оғози продакшн сервер
npm run seed         # Миграция + пур кардани база
npm run install:all  # Насб кардани ҳамаи вобастагиҳо
```

---

## Сохтани продакшн

```bash
npm run build
npm run start
```

Дар режими продакшн, сервер React app-ро аз `client/dist` серв мекунад.

---

## Муаллиф

Лоиҳа барои **«Нерӯи Тоза»**, Ҷумҳурии Тоҷикистон.
