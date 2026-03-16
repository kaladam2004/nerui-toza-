import { Request, Response } from 'express';
import { getDb } from '../database/connection';
import { parseVideoUrl } from '../utils/videoParser';

export function getNews(req: Request, res: Response) {
  const db = getDb();
  const { category, published } = req.query;
  let sql = 'SELECT * FROM news WHERE 1=1';
  const params: any[] = [];
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (published === 'true') { sql += ' AND is_published = 1'; }
  sql += ' ORDER BY published_at DESC, created_at DESC';
  const items = db.prepare(sql).all(...params) as any[];
  // attach gallery images
  const getImages = db.prepare('SELECT * FROM news_images WHERE news_id = ? ORDER BY sort_order');
  res.json(items.map(n => ({ ...n, images: getImages.all(n.id) })));
}

export function getOneNews(req: Request, res: Response) {
  const db = getDb();
  const item = db.prepare('SELECT * FROM news WHERE id = ? OR slug = ?').get(req.params.id, req.params.id) as any;
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  const images = db.prepare('SELECT * FROM news_images WHERE news_id = ? ORDER BY sort_order').all(item.id);
  res.json({ ...item, images });
}

export function createNews(req: Request, res: Response) {
  const db = getDb();
  const { slug, title_tg, title_ru, title_en, body_tg, body_ru, body_en,
    cover_image, video_url, category, is_published, published_at, sort_order } = req.body;

  const parsed = parseVideoUrl(video_url);
  const media_type = cover_image ? (parsed.type !== 'none' ? parsed.type : 'image') : parsed.type;

  const result = db.prepare(`
    INSERT INTO news (slug, title_tg, title_ru, title_en, body_tg, body_ru, body_en,
      media_type, cover_image, video_url, video_embed_url, category, is_published, published_at, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(slug, title_tg, title_ru, title_en, body_tg || '', body_ru || '', body_en || '',
    media_type, cover_image || null, video_url || null, parsed.embedUrl,
    category || 'news', is_published ? 1 : 0, published_at || null, sort_order || 0);

  res.status(201).json({ id: result.lastInsertRowid });
}

export function updateNews(req: Request, res: Response) {
  const db = getDb();
  const { slug, title_tg, title_ru, title_en, body_tg, body_ru, body_en,
    cover_image, video_url, category, is_published, published_at, sort_order } = req.body;

  const parsed = parseVideoUrl(video_url);
  const media_type = cover_image ? (parsed.type !== 'none' ? parsed.type : 'image') : parsed.type;

  db.prepare(`
    UPDATE news SET slug=?, title_tg=?, title_ru=?, title_en=?, body_tg=?, body_ru=?, body_en=?,
    media_type=?, cover_image=?, video_url=?, video_embed_url=?, category=?, is_published=?,
    published_at=?, sort_order=?, updated_at=datetime('now') WHERE id=?
  `).run(slug, title_tg, title_ru, title_en, body_tg || '', body_ru || '', body_en || '',
    media_type, cover_image || null, video_url || null, parsed.embedUrl,
    category || 'news', is_published ? 1 : 0, published_at || null, sort_order || 0, req.params.id);

  res.json({ success: true });
}

export function deleteNews(req: Request, res: Response) {
  getDb().prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  res.json({ success: true });
}

export function publishNews(req: Request, res: Response) {
  const db = getDb();
  db.prepare(`UPDATE news SET is_published=1, published_at=datetime('now'), updated_at=datetime('now') WHERE id=?`).run(req.params.id);
  res.json({ success: true });
}
