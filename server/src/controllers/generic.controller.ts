// Generic CRUD controllers for: services, team, seminars, map_markers, settings
import { Request, Response } from 'express';
import { getDb } from '../database/connection';

// ──── SERVICES ───────────────────────────────────────────────────────────────
export function getServices(_req: Request, res: Response) {
  const db = getDb();
  const services = db.prepare('SELECT * FROM services ORDER BY sort_order').all() as any[];
  const getFeatures = db.prepare('SELECT * FROM service_features WHERE service_id = ? ORDER BY sort_order');
  res.json(services.map(s => ({ ...s, features: getFeatures.all(s.id) })));
}

export function createService(req: Request, res: Response) {
  const db = getDb();
  const { slug, category_tg, category_ru, category_en, image_url,
    title_tg, title_ru, title_en, description_tg, description_ru, description_en,
    sort_order, features } = req.body;
  const result = db.prepare(`
    INSERT INTO services (slug, category_tg, category_ru, category_en, image_url,
      title_tg, title_ru, title_en, description_tg, description_ru, description_en, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(slug, category_tg, category_ru, category_en, image_url,
    title_tg, title_ru, title_en, description_tg, description_ru, description_en, sort_order || 0);
  const serviceId = result.lastInsertRowid;
  if (Array.isArray(features)) {
    const ins = db.prepare('INSERT INTO service_features (service_id, feature_tg, feature_ru, feature_en, sort_order) VALUES (?, ?, ?, ?, ?)');
    features.forEach((f: any, i: number) => ins.run(serviceId, f.feature_tg, f.feature_ru, f.feature_en, i));
  }
  res.status(201).json({ id: serviceId });
}

export function updateService(req: Request, res: Response) {
  const db = getDb();
  const { slug, category_tg, category_ru, category_en, image_url,
    title_tg, title_ru, title_en, description_tg, description_ru, description_en,
    sort_order, features } = req.body;
  db.prepare(`
    UPDATE services SET slug=?, category_tg=?, category_ru=?, category_en=?, image_url=?,
    title_tg=?, title_ru=?, title_en=?, description_tg=?, description_ru=?, description_en=?,
    sort_order=?, updated_at=datetime('now') WHERE id=?
  `).run(slug, category_tg, category_ru, category_en, image_url,
    title_tg, title_ru, title_en, description_tg, description_ru, description_en,
    sort_order || 0, req.params.id);
  if (Array.isArray(features)) {
    db.prepare('DELETE FROM service_features WHERE service_id = ?').run(req.params.id);
    const ins = db.prepare('INSERT INTO service_features (service_id, feature_tg, feature_ru, feature_en, sort_order) VALUES (?, ?, ?, ?, ?)');
    features.forEach((f: any, i: number) => ins.run(req.params.id, f.feature_tg, f.feature_ru, f.feature_en, i));
  }
  res.json({ success: true });
}

export function deleteService(req: Request, res: Response) {
  getDb().prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.json({ success: true });
}

// ──── TEAM ───────────────────────────────────────────────────────────────────
export function getTeam(req: Request, res: Response) {
  const db = getDb();
  const { page } = req.query;
  let sql = 'SELECT * FROM team_members';
  const params: any[] = [];
  if (page) { sql += ' WHERE page = ?'; params.push(page); }
  sql += ' ORDER BY sort_order';
  res.json(db.prepare(sql).all(...params));
}

export function createTeamMember(req: Request, res: Response) {
  const db = getDb();
  const { name_tg, name_ru, name_en, position_tg, position_ru, position_en,
    photo_url, linkedin_url, twitter_url, email, page, sort_order } = req.body;
  const result = db.prepare(`
    INSERT INTO team_members (name_tg, name_ru, name_en, position_tg, position_ru, position_en,
      photo_url, linkedin_url, twitter_url, email, page, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name_tg, name_ru, name_en, position_tg, position_ru, position_en,
    photo_url || '', linkedin_url || null, twitter_url || null, email || null,
    page || 'about', sort_order || 0);
  res.status(201).json({ id: result.lastInsertRowid });
}

export function updateTeamMember(req: Request, res: Response) {
  const db = getDb();
  const { name_tg, name_ru, name_en, position_tg, position_ru, position_en,
    photo_url, linkedin_url, twitter_url, email, page, sort_order } = req.body;
  db.prepare(`
    UPDATE team_members SET name_tg=?, name_ru=?, name_en=?, position_tg=?, position_ru=?, position_en=?,
    photo_url=?, linkedin_url=?, twitter_url=?, email=?, page=?, sort_order=?, updated_at=datetime('now')
    WHERE id=?
  `).run(name_tg, name_ru, name_en, position_tg, position_ru, position_en,
    photo_url || '', linkedin_url || null, twitter_url || null, email || null,
    page || 'about', sort_order || 0, req.params.id);
  res.json({ success: true });
}

export function deleteTeamMember(req: Request, res: Response) {
  getDb().prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
  res.json({ success: true });
}

// ──── SEMINARS ───────────────────────────────────────────────────────────────
export function getSeminars(req: Request, res: Response) {
  const db = getDb();
  const { upcoming } = req.query;
  let sql = 'SELECT * FROM seminars WHERE 1=1';
  const params: any[] = [];
  if (upcoming === 'true') { sql += ' AND is_upcoming = 1'; }
  sql += ' ORDER BY date DESC';
  res.json(db.prepare(sql).all(...params));
}

export function createSeminar(req: Request, res: Response) {
  const db = getDb();
  const { title_tg, title_ru, title_en, description_tg, description_ru, description_en,
    date, location_tg, location_ru, location_en, image_url, is_upcoming, sort_order } = req.body;
  const result = db.prepare(`
    INSERT INTO seminars (title_tg, title_ru, title_en, description_tg, description_ru, description_en,
      date, location_tg, location_ru, location_en, image_url, is_upcoming, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title_tg, title_ru, title_en, description_tg || '', description_ru || '', description_en || '',
    date, location_tg, location_ru, location_en, image_url || null, is_upcoming ? 1 : 0, sort_order || 0);
  res.status(201).json({ id: result.lastInsertRowid });
}

export function updateSeminar(req: Request, res: Response) {
  const db = getDb();
  const { title_tg, title_ru, title_en, description_tg, description_ru, description_en,
    date, location_tg, location_ru, location_en, image_url, is_upcoming, sort_order } = req.body;
  db.prepare(`
    UPDATE seminars SET title_tg=?, title_ru=?, title_en=?, description_tg=?, description_ru=?, description_en=?,
    date=?, location_tg=?, location_ru=?, location_en=?, image_url=?, is_upcoming=?, sort_order=?,
    updated_at=datetime('now') WHERE id=?
  `).run(title_tg, title_ru, title_en, description_tg || '', description_ru || '', description_en || '',
    date, location_tg, location_ru, location_en, image_url || null, is_upcoming ? 1 : 0,
    sort_order || 0, req.params.id);
  res.json({ success: true });
}

export function deleteSeminar(req: Request, res: Response) {
  getDb().prepare('DELETE FROM seminars WHERE id = ?').run(req.params.id);
  res.json({ success: true });
}

// ──── MAP MARKERS ─────────────────────────────────────────────────────────────
export function getMapMarkers(_req: Request, res: Response) {
  res.json(getDb().prepare('SELECT * FROM map_markers WHERE is_visible = 1 ORDER BY id').all());
}

export function getAllMapMarkers(_req: Request, res: Response) {
  res.json(getDb().prepare('SELECT * FROM map_markers ORDER BY id').all());
}

export function createMapMarker(req: Request, res: Response) {
  const db = getDb();
  const { name_tg, name_ru, name_en, latitude, longitude, marker_type, is_visible, project_id } = req.body;
  const result = db.prepare(`
    INSERT INTO map_markers (name_tg, name_ru, name_en, latitude, longitude, marker_type, is_visible, project_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name_tg, name_ru, name_en, latitude, longitude, marker_type || 'solar', is_visible ? 1 : 0, project_id || null);
  res.status(201).json({ id: result.lastInsertRowid });
}

export function updateMapMarker(req: Request, res: Response) {
  const db = getDb();
  const { name_tg, name_ru, name_en, latitude, longitude, marker_type, is_visible, project_id } = req.body;
  db.prepare(`
    UPDATE map_markers SET name_tg=?, name_ru=?, name_en=?, latitude=?, longitude=?, marker_type=?,
    is_visible=?, project_id=?, updated_at=datetime('now') WHERE id=?
  `).run(name_tg, name_ru, name_en, latitude, longitude, marker_type || 'solar',
    is_visible ? 1 : 0, project_id || null, req.params.id);
  res.json({ success: true });
}

export function deleteMapMarker(req: Request, res: Response) {
  getDb().prepare('DELETE FROM map_markers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
}

// ──── SETTINGS ───────────────────────────────────────────────────────────────
export function getSettings(_req: Request, res: Response) {
  const rows = getDb().prepare('SELECT * FROM settings ORDER BY key').all() as any[];
  const result: Record<string, string> = {};
  rows.forEach(r => { result[r.key] = r.value; });
  res.json(result);
}

export function updateSettings(req: Request, res: Response) {
  const db = getDb();
  const updates = req.body as Record<string, string>;
  const stmt = db.prepare(`UPDATE settings SET value=?, updated_at=datetime('now') WHERE key=?`);
  for (const [key, value] of Object.entries(updates)) {
    stmt.run(value, key);
  }
  res.json({ success: true });
}

// ──── PARTNERS ────────────────────────────────────────────────────────────────
export function getPartners(_req: Request, res: Response) {
  res.json(getDb().prepare('SELECT * FROM partners WHERE is_visible = 1 ORDER BY sort_order').all());
}

export function getAllPartners(_req: Request, res: Response) {
  res.json(getDb().prepare('SELECT * FROM partners ORDER BY sort_order').all());
}

export function createPartner(req: Request, res: Response) {
  const db = getDb();
  const { name, logo_url, website_url, sort_order, is_visible } = req.body;
  const result = db.prepare(
    'INSERT INTO partners (name, logo_url, website_url, sort_order, is_visible) VALUES (?, ?, ?, ?, ?)'
  ).run(name, logo_url || '', website_url || '', sort_order || 0, is_visible ? 1 : 0);
  res.status(201).json({ id: result.lastInsertRowid });
}

export function updatePartner(req: Request, res: Response) {
  const db = getDb();
  const { name, logo_url, website_url, sort_order, is_visible } = req.body;
  db.prepare(`
    UPDATE partners SET name=?, logo_url=?, website_url=?, sort_order=?, is_visible=?,
    updated_at=datetime('now') WHERE id=?
  `).run(name, logo_url || '', website_url || '', sort_order || 0, is_visible ? 1 : 0, req.params.id);
  res.json({ success: true });
}

export function deletePartner(req: Request, res: Response) {
  getDb().prepare('DELETE FROM partners WHERE id = ?').run(req.params.id);
  res.json({ success: true });
}

// ── TIMELINE ──────────────────────────────────────────────────────────────────
export function getTimeline(_req: Request, res: Response) {
  res.json(getDb().prepare('SELECT * FROM timeline ORDER BY sort_order, year').all());
}

export function createTimelineItem(req: Request, res: Response) {
  const db = getDb();
  const { year, title_tg, title_ru, title_en, desc_tg, desc_ru, desc_en, projects_count, sort_order } = req.body;
  const result = db.prepare(`
    INSERT INTO timeline (year, title_tg, title_ru, title_en, desc_tg, desc_ru, desc_en, projects_count, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(year, title_tg || '', title_ru || '', title_en || '', desc_tg || '', desc_ru || '', desc_en || '', projects_count || '', sort_order || 0);
  res.status(201).json({ id: result.lastInsertRowid });
}

export function updateTimelineItem(req: Request, res: Response) {
  const db = getDb();
  const { year, title_tg, title_ru, title_en, desc_tg, desc_ru, desc_en, projects_count, sort_order } = req.body;
  db.prepare(`
    UPDATE timeline SET year=?, title_tg=?, title_ru=?, title_en=?, desc_tg=?, desc_ru=?, desc_en=?,
    projects_count=?, sort_order=?, updated_at=datetime('now') WHERE id=?
  `).run(year, title_tg || '', title_ru || '', title_en || '', desc_tg || '', desc_ru || '', desc_en || '',
    projects_count || '', sort_order || 0, req.params.id);
  res.json({ success: true });
}

export function deleteTimelineItem(req: Request, res: Response) {
  getDb().prepare('DELETE FROM timeline WHERE id = ?').run(req.params.id);
  res.json({ success: true });
}

// ── PAGE BACKGROUNDS ──────────────────────────────────────────────────────────
export function getPageBackgrounds(_req: Request, res: Response) {
  res.json(getDb().prepare('SELECT * FROM page_backgrounds ORDER BY page_key').all());
}

export function updatePageBackground(req: Request, res: Response) {
  const db = getDb();
  const { image_url, video_url, overlay_opacity, page_label } = req.body;
  db.prepare(`
    UPDATE page_backgrounds SET image_url=?, video_url=?, overlay_opacity=?, page_label=?, updated_at=datetime('now')
    WHERE page_key=?
  `).run(image_url || '', video_url || '', overlay_opacity ?? 0.55, page_label || '', req.params.key);
  res.json({ success: true });
}

// ──── UPLOAD ─────────────────────────────────────────────────────────────────
export function uploadFile(req: Request, res: Response) {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
}
