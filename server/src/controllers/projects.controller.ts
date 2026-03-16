import { Request, Response } from 'express';
import { getDb } from '../database/connection';

export function getProjects(req: Request, res: Response) {
  const db = getDb();
  const { category, featured } = req.query;
  let sql = 'SELECT * FROM projects WHERE 1=1';
  const params: any[] = [];
  if (category && category !== 'all') { sql += ' AND category = ?'; params.push(category); }
  if (featured === 'true') { sql += ' AND is_featured = 1'; }
  sql += ' ORDER BY sort_order ASC, created_at DESC';
  res.json(db.prepare(sql).all(...params));
}

export function getProject(req: Request, res: Response) {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ? OR slug = ?').get(req.params.id, req.params.id);
  if (!project) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(project);
}

export function createProject(req: Request, res: Response) {
  const db = getDb();
  const { slug, category, image_url, location_tg, location_ru, location_en, year,
    title_tg, title_ru, title_en, description_tg, description_ru, description_en,
    is_featured, sort_order } = req.body;
  const result = db.prepare(`
    INSERT INTO projects (slug, category, image_url, location_tg, location_ru, location_en, year,
      title_tg, title_ru, title_en, description_tg, description_ru, description_en, is_featured, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(slug, category, image_url, location_tg, location_ru, location_en, year,
    title_tg, title_ru, title_en, description_tg, description_ru, description_en,
    is_featured ? 1 : 0, sort_order || 0);
  res.status(201).json({ id: result.lastInsertRowid });
}

export function updateProject(req: Request, res: Response) {
  const db = getDb();
  const { slug, category, image_url, location_tg, location_ru, location_en, year,
    title_tg, title_ru, title_en, description_tg, description_ru, description_en,
    is_featured, sort_order } = req.body;
  db.prepare(`
    UPDATE projects SET slug=?, category=?, image_url=?, location_tg=?, location_ru=?, location_en=?,
    year=?, title_tg=?, title_ru=?, title_en=?, description_tg=?, description_ru=?, description_en=?,
    is_featured=?, sort_order=?, updated_at=datetime('now') WHERE id=?
  `).run(slug, category, image_url, location_tg, location_ru, location_en, year,
    title_tg, title_ru, title_en, description_tg, description_ru, description_en,
    is_featured ? 1 : 0, sort_order || 0, req.params.id);
  res.json({ success: true });
}

export function deleteProject(req: Request, res: Response) {
  getDb().prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ success: true });
}
