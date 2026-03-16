import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../../../.env') });

import { getDb } from '../database/connection';
import { runMigrations } from '../database/migrate';
import bcrypt from 'bcryptjs';

async function seed() {
  runMigrations();
  const db = getDb();

  // ─── ADMIN USER ───────────────────────────────────────────────
  const adminUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminUser) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
    console.log('✓ Admin user created (username: admin, password: admin123)');
  }

  // ─── SETTINGS ────────────────────────────────────────────────
  const settings = [
    { key: 'phone_primary',     value: '+992 93 564 20 20',        label: 'Телефон асосӣ' },
    { key: 'phone_secondary',   value: '+992 93 564 20 20',        label: 'Телефон иловагӣ' },
    { key: 'email_primary',     value: 'neruitoza@gmail.com',      label: 'Email асосӣ' },
    { key: 'email_secondary',   value: 'info@neruitoza.tj',        label: 'Email иловагӣ' },
    { key: 'address_tg',        value: '734025, Душанбе, кӯчаи А. Сино, 29/2', label: 'Суроға (тоҷикӣ)' },
    { key: 'address_ru',        value: '734025, Душанбе, ул. А. Сино, 29/2',   label: 'Адрес (русский)' },
    { key: 'address_en',        value: '734025, Dushanbe, A. Sino str., 29/2', label: 'Address (English)' },
    { key: 'working_hours_tg',  value: 'Душанбе-Ҷумъа: 8:00 - 18:00', label: 'Соатҳои кор (тоҷикӣ)' },
    { key: 'working_hours_ru',  value: 'Понедельник-Пятница: 8:00 - 18:00', label: 'Часы работы (русский)' },
    { key: 'working_hours_en',  value: 'Monday-Friday: 8:00 AM - 6:00 PM', label: 'Working hours (English)' },
    { key: 'telegram_url',      value: 'https://t.me/neruitoza',   label: 'Telegram' },
    { key: 'facebook_url',      value: 'https://facebook.com/neruitoza', label: 'Facebook' },
    { key: 'instagram_url',     value: 'https://instagram.com/neruitoza', label: 'Instagram' },
    { key: 'youtube_url',       value: 'https://youtube.com/@neruitoza', label: 'YouTube' },
    { key: 'hero_stats_projects',  value: '25+',  label: 'Статистика: лоиҳаҳо' },
    { key: 'hero_stats_capacity',  value: '150кВт', label: 'Статистика: иқтидор' },
    { key: 'hero_stats_families',  value: '500+', label: 'Статистика: оилаҳо' },
    // Calculator settings
    { key: 'calc_tariff_residential', value: '0.12', label: 'Тариф хонагӣ (сомонӣ/kWh)' },
    { key: 'calc_tariff_commercial',  value: '0.28', label: 'Тариф тиҷоратӣ (сомонӣ/kWh)' },
    { key: 'calc_tariff_industrial',  value: '0.38', label: 'Тариф саноатӣ (сомонӣ/kWh)' },
    { key: 'calc_irrad_dushanbe',     value: '5.1',  label: 'Нурпазирӣ: Душанбе (kWh/m²/рӯз)' },
    { key: 'calc_irrad_khatlon',      value: '5.9',  label: 'Нурпазирӣ: Хатлон (kWh/m²/рӯз)' },
    { key: 'calc_irrad_sughd',        value: '4.7',  label: 'Нурпазирӣ: Суғд (kWh/m²/рӯз)' },
    { key: 'calc_irrad_gbao',         value: '5.5',  label: 'Нурпазирӣ: ВМКБ (kWh/m²/рӯз)' },
    { key: 'calc_irrad_rrp',          value: '5.0',  label: 'Нурпазирӣ: НТҶТ (kWh/m²/рӯз)' },
    { key: 'calc_cost_per_kwp',       value: '850',  label: 'Арзиши насби система ($/kWp)' },
    { key: 'calc_usd_to_tjs',         value: '10.9', label: 'Курси USD ба TJS' },
    { key: 'calc_panel_w',            value: '400',  label: 'Қудрати панел (W)' },
  ];

  const upsertSetting = db.prepare(`
    INSERT INTO settings (key, value, label) VALUES (?, ?, ?)
    ON CONFLICT(key) DO NOTHING
  `);
  for (const s of settings) upsertSetting.run(s.key, s.value, s.label);
  console.log('✓ Settings seeded');

  // ─── PROJECTS ────────────────────────────────────────────────
  const existingProjects = db.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number };
  if (existingProjects.c === 0) {
    const insertProject = db.prepare(`
      INSERT INTO projects (slug, category, image_url, location_tg, location_ru, location_en,
        year, title_tg, title_ru, title_en, description_tg, description_ru, description_en,
        is_featured, sort_order)
      VALUES (@slug, @category, @image_url, @location_tg, @location_ru, @location_en,
        @year, @title_tg, @title_ru, @title_en, @description_tg, @description_ru, @description_en,
        @is_featured, @sort_order)
    `);

    const projects = [
      {
        slug: 'qaratog-solar-10kw',
        category: 'solar',
        image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
        location_tg: 'Деҳаи Қаратоғ, Вилояти Хатлон',
        location_ru: 'Деревня Каратог, Хатлонская область',
        location_en: 'Village of Karatog, Khatlon Region',
        year: 2023,
        title_tg: 'Системаи фотоэлектрики дар деҳаи Қаратоғ',
        title_ru: 'Фотоэлектрическая система в деревне Каратог',
        title_en: 'Photovoltaic system in Karatog village',
        description_tg: 'Насби системаи 10 кВт барои таъмини нерӯ дар деҳаи Қаратоғ.',
        description_ru: 'Установка системы на 10 кВт для обеспечения электроэнергией села Каратог.',
        description_en: 'Installation of a 10 kW system to provide electricity to the village of Karatog.',
        is_featured: 1, sort_order: 1,
      },
      {
        slug: 'shohin-schools-16kw',
        category: 'solar',
        image_url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80',
        location_tg: 'Ноҳияи Ш.Шоҳин, Вилояти Хатлон',
        location_ru: 'Район Ш.Шохин, Хатлонская область',
        location_en: 'Sh. Shohin District, Khatlon Region',
        year: 2023,
        title_tg: 'Системаи фотоэлектрики дар се мактаби ноҳияи Ш.Шоҳин',
        title_ru: 'Фотоэлектрическая система в трёх школах района Ш.Шохин',
        title_en: 'Photovoltaic system in three schools of Sh. Shohin District',
        description_tg: 'Насби системаи 16 кВт барои таъмини нерӯ дар муассисаҳои таълимӣ.',
        description_ru: 'Установка системы мощностью 16 кВт для обеспечения электроэнергией учебных заведений.',
        description_en: 'Installation of a 16 kW system to provide electricity to educational institutions.',
        is_featured: 1, sort_order: 2,
      },
      {
        slug: 'shohin-livestock-9kw',
        category: 'solar',
        image_url: 'https://images.unsplash.com/photo-1595437193398-f24279553f4f?w=800&q=80',
        location_tg: 'Ноҳияи Ш.Шоҳин, Вилояти Хатлон',
        location_ru: 'Район Ш.Шохин, Хатлонская область',
        location_en: 'Sh. Shohin District, Khatlon Region',
        year: 2023,
        title_tg: 'Системаи фотоэлектрики дар хоҷагиҳои чорводории ноҳияи Ш.Шоҳин',
        title_ru: 'Фотоэлектрическая система в животноводческих хозяйствах района Ш.Шохин',
        title_en: 'Photovoltaic system in livestock farms of Sh. Shohin District',
        description_tg: 'Насби системаи 9 кВт барои таъмини нерӯ дар хоҷагиҳои чорводории минтақаи сарҳадӣ.',
        description_ru: 'Установка системы мощностью 9 кВт для обеспечения электроэнергием животноводческих хозяйств приграничного района.',
        description_en: 'Installation of a 9 kW system to provide electricity to livestock farms in the border area.',
        is_featured: 1, sort_order: 3,
      },
      {
        slug: 'shahrithus-5kw',
        category: 'solar',
        image_url: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800&q=80',
        location_tg: 'Ноҳияи Шаҳритус',
        location_ru: 'Район Шахритус',
        location_en: 'Shahrithus District',
        year: 2022,
        title_tg: 'Васлу насби системаи офтобӣ 5 кВт дар ноҳияи Шаҳритус',
        title_ru: 'Установка солнечной системы мощностью 5 кВт в районе Шахритус',
        title_en: 'Installation of a 5 kW solar system in Shahrithus District',
        description_tg: 'Насби системаи офтобии 5 кВт барои таъмини нерӯи барқ ба аҳолии ноҳияи Шаҳритус.',
        description_ru: 'Установка солнечной системы мощностью 5 кВт для обеспечения электроэнергией населения района Шахритус.',
        description_en: 'Installation of a 5 kW solar system to provide electricity to the population of Shahrithus District.',
        is_featured: 0, sort_order: 4,
      },
      {
        slug: 'yagnob-energy-assessment',
        category: 'energy',
        image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
        location_tg: 'Водии Яғноб',
        location_ru: 'Долина Ягноб',
        location_en: 'Yagnob Valley',
        year: 2024,
        title_tg: 'Арзёбии дастрасӣ ба энергия дар водии Яғноб',
        title_ru: 'Оценка доступа к энергии в долине Ягноб',
        title_en: 'Energy access assessment in Yagnob Valley',
        description_tg: 'Арзёбии дастрасӣ ба энергия ва мушкилоти амнияти энергетикӣ барои сокинони водии Яғноб.',
        description_ru: 'Оценка доступа к энергии и проблем энергетической безопасности для жителей долины Ягноб.',
        description_en: 'Assessment of energy access and energy security issues for residents of Yagnob Valley.',
        is_featured: 0, sort_order: 5,
      },
      {
        slug: 'clean-energy-schools',
        category: 'education',
        image_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
        location_tg: 'Вилояти Суғд',
        location_ru: 'Согдийская область',
        location_en: 'Sughd Region',
        year: 2024,
        title_tg: "Лоиҳаи 'Нерӯи тоза барои мактабҳо'",
        title_ru: "Проект 'Чистая энергия для школ'",
        title_en: "'Clean energy for schools' project",
        description_tg: 'Таъмини нерӯи тоза барои мактабҳои вилояти Суғд тавассути системаҳои офтобӣ.',
        description_ru: 'Обеспечение чистой энергией школ Согдийской области с помощью солнечных систем.',
        description_en: 'Providing clean energy to schools in Sughd Region through solar systems.',
        is_featured: 0, sort_order: 6,
      },
    ];

    for (const p of projects) insertProject.run(p);
    console.log('✓ Projects seeded');
  }

  // ─── MAP MARKERS ─────────────────────────────────────────────
  const existingMarkers = db.prepare('SELECT COUNT(*) as c FROM map_markers').get() as { c: number };
  if (existingMarkers.c === 0) {
    const insertMarker = db.prepare(`
      INSERT INTO map_markers (name_tg, name_ru, name_en, latitude, longitude, marker_type, is_visible)
      VALUES (@name_tg, @name_ru, @name_en, @latitude, @longitude, @marker_type, @is_visible)
    `);
    const markers = [
      { name_tg: 'Системаи 5 кВт дар ноҳияи Шаҳритус', name_ru: 'Система 5 кВт в районе Шахритус', name_en: 'Installation of a 5 kW system in Shahrithus District', latitude: 37.25, longitude: 68.19, marker_type: 'solar', is_visible: 1 },
      { name_tg: 'Системаи 7 кВт дар ноҳияи Ш.Шоҳин', name_ru: 'Система 7 кВт в районе Ш.Шохин', name_en: 'Installation of a 7 kW solar system in Sh. Shohin District', latitude: 37.59, longitude: 69.87, marker_type: 'solar', is_visible: 1 },
      { name_tg: 'Системаи 16 кВт барои мактабҳо', name_ru: 'Система 16 кВт для учебных заведений', name_en: 'Installation of a 16 kW system for educational institutions', latitude: 37.89, longitude: 70.12, marker_type: 'solar', is_visible: 1 },
      { name_tg: 'Системаи офтобӣ дар хоҷагиҳои чорводорӣ', name_ru: 'Фотоэлектрическая система в животноводческих хозяйствах', name_en: 'Photovoltaic system in livestock farms', latitude: 37.59, longitude: 69.72, marker_type: 'solar', is_visible: 1 },
      { name_tg: 'Системаи 11 кВт дар Евон', name_ru: 'Система 11 кВт в Евон', name_en: 'Installation of an 11 kW solar system in Yevon', latitude: 38.31, longitude: 69.04, marker_type: 'solar', is_visible: 1 },
      { name_tg: 'Системаи 11 кВт дар Қаратоғ', name_ru: 'Система 11 кВт в Каратог', name_en: 'Installation of an 11 kW solar system in Karatog', latitude: 38.58, longitude: 69.35, marker_type: 'solar', is_visible: 1 },
      { name_tg: 'Арзёбии энергетикии водии Яғноб', name_ru: 'Оценка энергетики долины Ягноб', name_en: 'Energy assessment in Yagnob Valley', latitude: 39.42, longitude: 68.83, marker_type: 'energy', is_visible: 1 },
      { name_tg: "Лоиҳаи 'Нерӯи тоза барои мактабҳо'", name_ru: "Проект 'Чистая энергия для школ'", name_en: "'Clean energy for schools' project", latitude: 39.90, longitude: 69.00, marker_type: 'education', is_visible: 1 },
    ];
    for (const m of markers) insertMarker.run(m);
    console.log('✓ Map markers seeded');
  }

  // ─── TEAM MEMBERS ────────────────────────────────────────────
  const existingTeam = db.prepare('SELECT COUNT(*) as c FROM team_members').get() as { c: number };
  if (existingTeam.c === 0) {
    const insertMember = db.prepare(`
      INSERT INTO team_members (name_tg, name_ru, name_en, position_tg, position_ru, position_en, photo_url, page, sort_order)
      VALUES (@name_tg, @name_ru, @name_en, @position_tg, @position_ru, @position_en, @photo_url, @page, @sort_order)
    `);
    const members = [
      { name_tg: 'Исматов Анушервон', name_ru: 'Исматов Анушервон', name_en: 'Ismatov Anushervon', position_tg: 'Директори иҷроия', position_ru: 'Исполнительный директор', position_en: 'Executive Director', photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', page: 'about', sort_order: 1 },
      { name_tg: 'Раҳимов Бахром', name_ru: 'Рахимов Бахром', name_en: 'Rakhimov Bakhrom', position_tg: 'Муҳандиси асосӣ', position_ru: 'Главный инженер', position_en: 'Chief Engineer', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', page: 'about', sort_order: 2 },
      { name_tg: 'Назарова Малика', name_ru: 'Назарова Малика', name_en: 'Nazarova Malika', position_tg: 'Мутахассиси лоиҳаҳо', position_ru: 'Менеджер проектов', position_en: 'Project Manager', photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', page: 'about', sort_order: 3 },
      { name_tg: 'Давлатов Ҷамшед', name_ru: 'Давлатов Джамшед', name_en: 'Davlatov Jamshed', position_tg: 'Коршиноси техникӣ', position_ru: 'Технический консультант', position_en: 'Technical Consultant', photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', page: 'about', sort_order: 4 },
    ];
    for (const m of members) insertMember.run(m);
    console.log('✓ Team members seeded');
  }

  // ─── SERVICES ────────────────────────────────────────────────
  const existingServices = db.prepare('SELECT COUNT(*) as c FROM services').get() as { c: number };
  if (existingServices.c === 0) {
    const insertService = db.prepare(`
      INSERT INTO services (slug, category_tg, category_ru, category_en, image_url,
        title_tg, title_ru, title_en, description_tg, description_ru, description_en, sort_order)
      VALUES (@slug, @category_tg, @category_ru, @category_en, @image_url,
        @title_tg, @title_ru, @title_en, @description_tg, @description_ru, @description_en, @sort_order)
    `);
    const insertFeature = db.prepare(`
      INSERT INTO service_features (service_id, feature_tg, feature_ru, feature_en, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    const services = [
      {
        slug: 'solar-energy',
        category_tg: 'Нерӯи офтобӣ',
        category_ru: 'Солнечная энергия',
        category_en: 'Solar Energy',
        image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
        title_tg: 'Сохтмони системаҳои фотоэлектрикӣ',
        title_ru: 'Строительство фотоэлектрических систем',
        title_en: 'Photovoltaic Systems Construction',
        description_tg: 'Таҳия ва насби системаҳои нерӯи офтобӣ барои манзилҳо, корхонаҳо ва муассисаҳои давлатӣ.',
        description_ru: 'Разработка и установка солнечных энергосистем для домов, предприятий и государственных учреждений.',
        description_en: 'Development and installation of solar power systems for homes, businesses and government institutions.',
        sort_order: 1,
        features: [
          ['Арзёбии иқтидори офтобии минтақа', 'Оценка солнечного потенциала региона', 'Solar potential assessment of the region'],
          ['Таҳияи лоиҳаи техникӣ', 'Разработка технического проекта', 'Technical project development'],
          ['Насб ва танзим', 'Монтаж и настройка', 'Installation and configuration'],
          ['Нигоҳубин ва дастгирии техникӣ', 'Техническое обслуживание', 'Maintenance and technical support'],
        ],
      },
      {
        slug: 'biogas',
        category_tg: 'Биогаз',
        category_ru: 'Биогаз',
        category_en: 'Biogas',
        image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
        title_tg: 'Истифодаи нерӯ аз биогаз',
        title_ru: 'Использование энергии биогаза',
        title_en: 'Biogas Energy Utilization',
        description_tg: 'Таҳқиқот ва татбиқи технологияҳои нави истифодаи биогаз дар шароити кӯҳистони Тоҷикистон.',
        description_ru: 'Исследование и внедрение новых технологий использования биогаза в горных условиях Таджикистана.',
        description_en: 'Research and implementation of new biogas utilization technologies in Tajikistan\'s mountainous conditions.',
        sort_order: 2,
        features: [
          ['Арзёбии захираҳои биомасса', 'Оценка ресурсов биомассы', 'Biomass resource assessment'],
          ['Таҳияи тарҳи биогазӣ', 'Проектирование биогазовой установки', 'Biogas plant design'],
          ['Насб ва роҳандозӣ', 'Монтаж и запуск', 'Installation and commissioning'],
          ['Омӯзиши кормандон', 'Обучение персонала', 'Staff training'],
        ],
      },
      {
        slug: 'efficiency-consulting',
        category_tg: 'Машваратҳо',
        category_ru: 'Консультации',
        category_en: 'Consulting',
        image_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80',
        title_tg: 'Машварати самаранокии энергетикӣ',
        title_ru: 'Консультации по энергоэффективности',
        title_en: 'Energy Efficiency Consulting',
        description_tg: 'Пешниҳоди ҳалли самарабахш барои коҳиш додани истифодаи нерӯ дар корхонаҳо ва манзилҳо.',
        description_ru: 'Предложение эффективных решений для снижения энергопотребления на предприятиях и в домах.',
        description_en: 'Offering efficient solutions to reduce energy consumption in businesses and homes.',
        sort_order: 3,
        features: [
          ['Аудити энергетикии иншоот', 'Энергетический аудит объекта', 'Energy audit of the facility'],
          ['Таҳлили масрафи энергия', 'Анализ энергопотребления', 'Energy consumption analysis'],
          ['Тавсияҳои амалӣ', 'Практические рекомендации', 'Practical recommendations'],
          ['Назорати иҷро', 'Контроль выполнения', 'Implementation monitoring'],
        ],
      },
    ];

    for (const s of services) {
      const { features, ...serviceData } = s;
      const result = insertService.run(serviceData);
      const serviceId = result.lastInsertRowid;
      features.forEach(([tg, ru, en], i) => {
        insertFeature.run(serviceId, tg, ru, en, i + 1);
      });
    }
    console.log('✓ Services seeded');
  }

  // ─── SEMINARS ────────────────────────────────────────────────
  const existingSeminars = db.prepare('SELECT COUNT(*) as c FROM seminars').get() as { c: number };
  if (existingSeminars.c === 0) {
    const insertSeminar = db.prepare(`
      INSERT INTO seminars (title_tg, title_ru, title_en, description_tg, description_ru, description_en,
        date, location_tg, location_ru, location_en, is_upcoming, sort_order)
      VALUES (@title_tg, @title_ru, @title_en, @description_tg, @description_ru, @description_en,
        @date, @location_tg, @location_ru, @location_en, @is_upcoming, @sort_order)
    `);
    const seminars = [
      { title_tg: 'Семинар оид ба нерӯи офтобӣ', title_ru: 'Семинар по солнечной энергии', title_en: 'Solar Energy Seminar', description_tg: 'Семинари омӯзишӣ оид ба насб ва нигоҳубини системаҳои офтобӣ', description_ru: 'Учебный семинар по установке и обслуживанию солнечных систем', description_en: 'Training seminar on installation and maintenance of solar systems', date: '2024-03-15', location_tg: 'Душанбе', location_ru: 'Душанбе', location_en: 'Dushanbe', is_upcoming: 0, sort_order: 1 },
      { title_tg: 'Тренинги самаранокии энергетикӣ', title_ru: 'Тренинг по энергоэффективности', title_en: 'Energy Efficiency Training', description_tg: 'Барномаи омӯзишии барои мутахассисони соҳаи энергетика', description_ru: 'Образовательная программа для специалистов в области энергетики', description_en: 'Educational program for energy sector specialists', date: '2024-06-20', location_tg: 'Хуҷанд', location_ru: 'Худжанд', location_en: 'Khujand', is_upcoming: 1, sort_order: 2 },
    ];
    for (const s of seminars) insertSeminar.run(s);
    console.log('✓ Seminars seeded');
  }

  // ─── SAMPLE NEWS ─────────────────────────────────────────────
  const existingNews = db.prepare('SELECT COUNT(*) as c FROM news').get() as { c: number };
  if (existingNews.c === 0) {
    const insertNews = db.prepare(`
      INSERT INTO news (slug, title_tg, title_ru, title_en, body_tg, body_ru, body_en,
        media_type, cover_image, video_url, video_embed_url, category, is_published, published_at, sort_order)
      VALUES (@slug, @title_tg, @title_ru, @title_en, @body_tg, @body_ru, @body_en,
        @media_type, @cover_image, @video_url, @video_embed_url, @category, @is_published, @published_at, @sort_order)
    `);
    const newsItems = [
      {
        slug: 'new-solar-project-khatlon-2024',
        title_tg: 'Лоиҳаи нави офтобӣ дар вилояти Хатлон',
        title_ru: 'Новый солнечный проект в Хатлонской области',
        title_en: 'New solar project in Khatlon Region',
        body_tg: '<p>Мо бо хурсандӣ хабар медиҳем, ки лоиҳаи нави офтобии 15 кВт дар вилояти Хатлон ба пуррагӣ насб шуд. Ин лоиҳа ба беш аз 50 оила имкони истифодаи нерӯи тозаро фароҳам меоварад.</p>',
        body_ru: '<p>Мы с радостью сообщаем, что новый солнечный проект мощностью 15 кВт в Хатлонской области полностью установлен. Этот проект обеспечит более 50 семей чистой энергией.</p>',
        body_en: '<p>We are pleased to announce that a new 15 kW solar project in Khatlon Region has been fully installed. This project will provide more than 50 families with clean energy.</p>',
        media_type: 'image',
        cover_image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80',
        video_url: null, video_embed_url: null,
        category: 'project_update', is_published: 1,
        published_at: '2024-03-10', sort_order: 1,
      },
      {
        slug: 'energy-seminar-dushanbe-2024',
        title_tg: 'Семинар оид ба нерӯи тоза дар Душанбе',
        title_ru: 'Семинар по чистой энергии в Душанбе',
        title_en: 'Clean Energy Seminar in Dushanbe',
        body_tg: '<p>Мо семинари омӯзишии оид ба нерӯи тоза барои мутахассисони соҳа баргузор кардем. Дар семинар зиёда аз 100 нафар иштирок намуданд.</p>',
        body_ru: '<p>Мы провели обучающий семинар по чистой энергии для отраслевых специалистов. В семинаре приняли участие более 100 человек.</p>',
        body_en: '<p>We conducted a training seminar on clean energy for industry specialists. More than 100 people participated in the seminar.</p>',
        media_type: 'youtube',
        cover_image: null,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        video_embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        category: 'seminar', is_published: 1,
        published_at: '2024-02-20', sort_order: 2,
      },
    ];
    for (const n of newsItems) insertNews.run(n);
    console.log('✓ Sample news seeded');
  }

  // ─── TIMELINE ────────────────────────────────────────────────
  const existingTimeline = db.prepare('SELECT COUNT(*) as c FROM timeline').get() as { c: number };
  if (existingTimeline.c === 0) {
    const insertTimeline = db.prepare(`
      INSERT OR IGNORE INTO timeline (year, title_tg, title_ru, title_en, desc_tg, desc_ru, desc_en, projects_count, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const timelineItems = [
      ['2021', '2021 — Соли асосгузорӣ', '2021 — Год основания', '2021 — Foundation Year',
       'Таъсиси ташкилот ва иҷрои аввалин лоиҳаҳо дар ноҳияҳои ҷумҳурӣ',
       'Основание организации и реализация первых проектов в районах республики',
       'Organization founded and first projects in rural districts', '5+', 0],
      ['2022', '2022 — Рушди минтақавӣ', '2022 — Региональное развитие', '2022 — Regional Growth',
       'Васеъ кардани фаъолият ба вилоятҳои Суғд ва Хатлон',
       'Расширение деятельности в Согдийскую и Хатлонскую области',
       'Expansion to Sughd and Khatlon regions', '8+', 1],
      ['2023', '2023 — Рақамикунонии фаъолият', '2023 — Цифровизация', '2023 — Digitization',
       'Истифодаи технологияҳои рақамӣ ва системаҳои идоракунии онлайн',
       'Использование цифровых технологий и онлайн-систем управления',
       'Digital technologies and online management systems', '12+', 2],
      ['2024', '2024 — Интишори миллиӣ', '2024 — Национальный охват', '2024 — National Scale',
       'Фаъолият дар ҳамаи вилоятҳо ва шарикони байналмилалӣ',
       'Деятельность во всех областях и международные партнёры',
       'Active in all regions and international partnerships', '20+', 3],
      ['2025', '2025 — Оғози кор дар хориҷа', '2025 — Начало международной работы', '2025 — International Expansion',
       'Иҷрои аввалин лоиҳаҳо дар Ӯзбекистон ва Афғонистон',
       'Реализация первых проектов в Узбекистане и Афганистане',
       'First projects in Uzbekistan and Afghanistan', '25+', 4],
    ];
    timelineItems.forEach(row => insertTimeline.run(...row));
    console.log('✓ Timeline seeded');
  }

  console.log('\n✅ Database seeded successfully!');
  console.log('   Admin login: admin / admin123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
