import { getDb } from './connection';

export function runMigrations() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      run_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const migrations: { name: string; sql: string }[] = [
    {
      name: '001_users',
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `,
    },
    {
      name: '002_projects',
      sql: `
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT NOT NULL UNIQUE,
          category TEXT NOT NULL DEFAULT 'solar',
          image_url TEXT NOT NULL DEFAULT '',
          location_tg TEXT NOT NULL DEFAULT '',
          location_ru TEXT NOT NULL DEFAULT '',
          location_en TEXT NOT NULL DEFAULT '',
          year INTEGER NOT NULL DEFAULT 2024,
          title_tg TEXT NOT NULL,
          title_ru TEXT NOT NULL,
          title_en TEXT NOT NULL,
          description_tg TEXT NOT NULL DEFAULT '',
          description_ru TEXT NOT NULL DEFAULT '',
          description_en TEXT NOT NULL DEFAULT '',
          is_featured INTEGER NOT NULL DEFAULT 0,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `,
    },
    {
      name: '003_services',
      sql: `
        CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT NOT NULL UNIQUE,
          category_tg TEXT NOT NULL DEFAULT '',
          category_ru TEXT NOT NULL DEFAULT '',
          category_en TEXT NOT NULL DEFAULT '',
          image_url TEXT NOT NULL DEFAULT '',
          title_tg TEXT NOT NULL,
          title_ru TEXT NOT NULL,
          title_en TEXT NOT NULL,
          description_tg TEXT NOT NULL DEFAULT '',
          description_ru TEXT NOT NULL DEFAULT '',
          description_en TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS service_features (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
          feature_tg TEXT NOT NULL,
          feature_ru TEXT NOT NULL,
          feature_en TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0
        );
      `,
    },
    {
      name: '004_team_members',
      sql: `
        CREATE TABLE IF NOT EXISTS team_members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name_tg TEXT NOT NULL,
          name_ru TEXT NOT NULL,
          name_en TEXT NOT NULL,
          position_tg TEXT NOT NULL,
          position_ru TEXT NOT NULL,
          position_en TEXT NOT NULL,
          photo_url TEXT NOT NULL DEFAULT '',
          linkedin_url TEXT,
          twitter_url TEXT,
          email TEXT,
          page TEXT NOT NULL DEFAULT 'about',
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `,
    },
    {
      name: '005_seminars',
      sql: `
        CREATE TABLE IF NOT EXISTS seminars (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title_tg TEXT NOT NULL,
          title_ru TEXT NOT NULL,
          title_en TEXT NOT NULL,
          description_tg TEXT NOT NULL DEFAULT '',
          description_ru TEXT NOT NULL DEFAULT '',
          description_en TEXT NOT NULL DEFAULT '',
          date TEXT NOT NULL,
          location_tg TEXT NOT NULL DEFAULT '',
          location_ru TEXT NOT NULL DEFAULT '',
          location_en TEXT NOT NULL DEFAULT '',
          image_url TEXT,
          is_upcoming INTEGER NOT NULL DEFAULT 0,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `,
    },
    {
      name: '006_contacts',
      sql: `
        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          is_read INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `,
    },
    {
      name: '007_news',
      sql: `
        CREATE TABLE IF NOT EXISTS news (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT NOT NULL UNIQUE,
          title_tg TEXT NOT NULL,
          title_ru TEXT NOT NULL,
          title_en TEXT NOT NULL,
          body_tg TEXT NOT NULL DEFAULT '',
          body_ru TEXT NOT NULL DEFAULT '',
          body_en TEXT NOT NULL DEFAULT '',
          media_type TEXT NOT NULL DEFAULT 'none',
          cover_image TEXT,
          video_url TEXT,
          video_embed_url TEXT,
          category TEXT NOT NULL DEFAULT 'news',
          is_published INTEGER NOT NULL DEFAULT 0,
          published_at TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS news_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          news_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
          url TEXT NOT NULL,
          caption_tg TEXT,
          caption_ru TEXT,
          caption_en TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0
        );
      `,
    },
    {
      name: '008_settings',
      sql: `
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          label TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `,
    },
    {
      name: '009_map_markers',
      sql: `
        CREATE TABLE IF NOT EXISTS map_markers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
          name_tg TEXT NOT NULL,
          name_ru TEXT NOT NULL,
          name_en TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          marker_type TEXT NOT NULL DEFAULT 'solar',
          is_visible INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `,
    },
    {
      name: '010_translations',
      sql: `
        CREATE TABLE IF NOT EXISTS translations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT NOT NULL,
          locale TEXT NOT NULL,
          value TEXT NOT NULL,
          context TEXT,
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(key, locale)
        );
      `,
    },
    {
      name: '011_partners',
      sql: `
        CREATE TABLE IF NOT EXISTS partners (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          logo_url TEXT NOT NULL DEFAULT '',
          website_url TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL DEFAULT 0,
          is_visible INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `,
    },
    {
      name: '012_timeline',
      sql: `
        CREATE TABLE IF NOT EXISTS timeline (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          year TEXT NOT NULL,
          title_tg TEXT NOT NULL DEFAULT '',
          title_ru TEXT NOT NULL DEFAULT '',
          title_en TEXT NOT NULL DEFAULT '',
          desc_tg TEXT NOT NULL DEFAULT '',
          desc_ru TEXT NOT NULL DEFAULT '',
          desc_en TEXT NOT NULL DEFAULT '',
          projects_count TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `,
    },
    {
      name: '013_page_backgrounds',
      sql: `
        CREATE TABLE IF NOT EXISTS page_backgrounds (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          page_key TEXT NOT NULL UNIQUE,
          page_label TEXT NOT NULL DEFAULT '',
          image_url TEXT NOT NULL DEFAULT '',
          video_url TEXT NOT NULL DEFAULT '',
          overlay_opacity REAL NOT NULL DEFAULT 0.55,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        INSERT OR IGNORE INTO page_backgrounds (page_key, page_label, image_url, overlay_opacity) VALUES
          ('home_hero',    'Асосӣ — Герой',       'https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=2000&q=80', 0.70),
          ('about_hero',   'Дар бораи мо — Герой','https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=2000&q=80', 0.55),
          ('projects_hero','Лоиҳаҳо — Герой',     'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=2000&q=80', 0.55),
          ('services_hero','Хидматҳо — Герой',    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=2000&q=80', 0.55),
          ('news_hero',    'Ахбор — Герой',        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=2000&q=80', 0.55),
          ('calc_hero',    'Ҳисобгар — Герой',    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=2000&q=80', 0.60),
          ('contact_hero', 'Тамос — Герой',        'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=2000&q=80', 0.55);
      `,
    },
  ];

  const checkMigration = db.prepare('SELECT id FROM _migrations WHERE name = ?');
  const insertMigration = db.prepare('INSERT INTO _migrations (name) VALUES (?)');

  for (const migration of migrations) {
    const existing = checkMigration.get(migration.name);
    if (!existing) {
      db.exec(migration.sql);
      insertMigration.run(migration.name);
      console.log(`✓ Migration ${migration.name} applied`);
    }
  }

  console.log('✓ All migrations complete');
}
