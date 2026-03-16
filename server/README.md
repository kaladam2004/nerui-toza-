# Нерӯи Тоза — Backend (Server)

Express + TypeScript + SQLite сервер барои вебсайти Нерӯи Тоза.

---

## Технологияҳо

| Пакет | Вазифа |
|-------|--------|
| `express` | HTTP сервер |
| `node:sqlite` | База (ҷузъи дохилии Node.js v22+) |
| `jsonwebtoken` | JWT токенҳо (access + refresh) |
| `bcryptjs` | Хэш кардани паролҳо |
| `multer` | Бор кардани файлҳо (акс/видео, макс. 10МБ) |
| `helmet` | Сарлавҳаҳои амниятӣ |
| `cors` | CORS барои client |
| `compression` | Фишурдани посухҳо |
| `express-rate-limit` | Маҳдудкунии дархостҳо |
| `cookie-parser` | Cookie барои refresh token |
| `morgan` | Логи HTTP |

---

## Сохтори папкаҳо

```
server/
├── src/
│   ├── index.ts              # Нуқтаи оғоз
│   ├── app.ts                # Express app + ҳамаи routes
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts      # Воридшавӣ, refresh, чиқиш, парол
│   │   ├── projects.controller.ts  # CRUD лоиҳаҳо
│   │   ├── news.controller.ts      # CRUD ахбор + publish + видео
│   │   ├── contacts.controller.ts  # Тамосҳо + статистика
│   │   └── generic.controller.ts   # Services, Team, Markers, Settings,
│   │                               # Partners, Timeline, Backgrounds, Upload
│   │
│   ├── database/
│   │   ├── connection.ts     # Синглтон, WAL mode, foreign keys
│   │   └── migrate.ts        # 13 миграция (авт. иҷро)
│   │
│   ├── middleware/
│   │   ├── auth.ts           # requireAuth — санҷиши JWT
│   │   └── errorHandler.ts   # Хатоҳои глобалӣ
│   │
│   ├── utils/
│   │   └── videoParser.ts    # Муайян кардани YouTube/Vimeo/видеофайл
│   │
│   └── seed/
│       └── seed.ts           # Пур кардани база бо додаҳои намунавӣ
│
├── package.json
└── tsconfig.json
```

---

## Командаҳо

```bash
npm run dev    # Оғоз бо tsx (development)
npm run build  # TypeScript → dist/
npm run start  # Продакшн (node dist/index.js)
npm run seed   # Миграция + пур кардани база
```

---

## База (SQLite)

Файл: `nerui-toza.db` (дар решаи лоиҳа)

### Ҷадвалҳо (13 миграция)

| Ҷадвал | Маъно |
|--------|-------|
| `users` | Корбарони admin |
| `projects` | Лоиҳаҳо (3 забон) |
| `services` | Хидматҳо (3 забон) |
| `service_features` | Хусусиятҳои хидматҳо |
| `team_members` | Аъзоёни даста |
| `news` | Ахборҳо + медиа |
| `news_images` | Акс барои галерея |
| `map_markers` | Нишонаҳои харита |
| `settings` | Танзимоти сайт + тарифҳои ҳисобгар (key/value) |
| `contacts` | Паёмҳои ворид шуда |
| `partners` | Шарикон (carousel) |
| `timeline` | Рушди сол ба сол |
| `page_backgrounds` | Заминаи ҳар саҳифа (акс/видео/opacity) |

### Навъҳои медиа дар `news`

```
none        — танҳо матн
image       — як акс
gallery     — якчанд акс
youtube     — YouTube видео (автоматӣ embed)
vimeo       — Vimeo видео (автоматӣ embed)
video_file  — файли видео (HTML5 player)
```

---

## API Endpoints

### Оммавӣ (без аутентификатсия)

```
GET    /api/health
GET    /api/projects
GET    /api/projects/:id
GET    /api/services
GET    /api/team
GET    /api/map-markers
GET    /api/settings
GET    /api/news
GET    /api/news/:id
GET    /api/partners
GET    /api/timeline
GET    /api/page-backgrounds
POST   /api/contacts
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
```

### Admin (Authorization: Bearer `<token>`)

```
# Статистика + тамосҳо
GET    /api/admin/stats
GET    /api/admin/contacts
PUT    /api/admin/contacts/:id/read
DELETE /api/admin/contacts/:id

# Лоиҳаҳо
POST   /api/admin/projects
PUT    /api/admin/projects/:id
DELETE /api/admin/projects/:id

# Ахбор
POST   /api/admin/news
PUT    /api/admin/news/:id
PUT    /api/admin/news/:id/publish
DELETE /api/admin/news/:id

# Хидматҳо
POST   /api/admin/services
PUT    /api/admin/services/:id
DELETE /api/admin/services/:id

# Даста
POST   /api/admin/team
PUT    /api/admin/team/:id
DELETE /api/admin/team/:id

# Шарикон
GET    /api/admin/partners
POST   /api/admin/partners
PUT    /api/admin/partners/:id
DELETE /api/admin/partners/:id

# Нишонаҳои харита
GET    /api/admin/map-markers
POST   /api/admin/map-markers
PUT    /api/admin/map-markers/:id
DELETE /api/admin/map-markers/:id

# Таймлайн
POST   /api/admin/timeline
PUT    /api/admin/timeline/:id
DELETE /api/admin/timeline/:id

# Заминаи саҳифаҳо
PUT    /api/admin/page-backgrounds/:key

# Танзимот (ҳисобгар, статистика, суроға...)
PUT    /api/admin/settings

# Бор кардани акс/видео
POST   /api/admin/upload

# Парол
PUT    /api/auth/password
```

---

## Аутентификатсия

```
1. POST /api/auth/login  →  { accessToken } (15 дақ) + httpOnly cookie refreshToken (7 рӯз)
2. Дархостҳо: Authorization: Bearer <accessToken>
3. Вақте accessToken гузашт: POST /api/auth/refresh → токени нав
```

---

## Бор кардани файл

```
POST /api/admin/upload
Content-Type: multipart/form-data
Body: file = <акс ё видео>

Посух: { url: "/uploads/filename.jpg", filename: "..." }
```

- Ҳаҷм: максимум **10 МБ**
- Навъ: `image/*` ё `video/*`
- Файлҳо: папкаи `uploads/`

---

## Видео Embed

```
https://youtube.com/watch?v=ABC  →  https://www.youtube.com/embed/ABC
https://youtu.be/ABC              →  https://www.youtube.com/embed/ABC
https://vimeo.com/123456          →  https://player.vimeo.com/video/123456
https://example.com/vid.mp4      →  video_file (HTML5 player)
```

---

## Ҳисобгар — Калидҳои settings

```
calc_tariff_residential   # Тариф хонагӣ (сом/kWh)
calc_tariff_commercial    # Тариф тиҷоратӣ
calc_tariff_industrial    # Тариф саноатӣ
calc_usd_to_tjs           # Нарх доллар ба сомонӣ
calc_panel_w              # Ватти як панел (W)
calc_system_eff           # Самаранокии система (0.0–1.0)
calc_cost_per_kwp_usd     # Нарх дар $ барои 1 kWp
calc_co2_per_kwh          # кг CO₂ барои 1 kWh
calc_irr_dushanbe         # Нурпазирии Душанбе (kWh/m²/рӯз)
calc_irr_khatlon          # Нурпазирии Хатлон
calc_irr_sughd            # Нурпазирии Суғд
calc_irr_gbao             # Нурпазирии ВМКБ
calc_irr_rrp              # Нурпазирии НТҶТ
```

---

## Продакшн

```env
NODE_ENV=production
JWT_SECRET=<тасодуфии дарозтар>
JWT_REFRESH_SECRET=<тасодуфии дигар>
ADMIN_PASSWORD=<парол мураккаб>
CLIENT_URL=https://yourdomain.com
```
