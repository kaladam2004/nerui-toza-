import { Request, Response } from 'express';
import { getDb } from '../database/connection';

export function getContacts(req: Request, res: Response) {
  const db = getDb();
  const { unread } = req.query;
  let sql = 'SELECT * FROM contacts';
  if (unread === 'true') sql += ' WHERE is_read = 0';
  sql += ' ORDER BY created_at DESC';
  res.json(db.prepare(sql).all());
}

export function submitContact(req: Request, res: Response) {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: 'Required fields missing' });
    return;
  }
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)'
  ).run(name, email, phone || null, subject, message);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Message sent successfully' });
}

export function markRead(req: Request, res: Response) {
  getDb().prepare('UPDATE contacts SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
}

export function deleteContact(req: Request, res: Response) {
  getDb().prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
}

export function getStats(_req: Request, res: Response) {
  const db = getDb();
  const projects = (db.prepare('SELECT COUNT(*) as c FROM projects').get() as any).c;
  const unreadContacts = (db.prepare('SELECT COUNT(*) as c FROM contacts WHERE is_read=0').get() as any).c;
  const totalContacts = (db.prepare('SELECT COUNT(*) as c FROM contacts').get() as any).c;
  const team = (db.prepare('SELECT COUNT(*) as c FROM team_members').get() as any).c;
  const seminars = (db.prepare('SELECT COUNT(*) as c FROM seminars').get() as any).c;
  const news = (db.prepare('SELECT COUNT(*) as c FROM news WHERE is_published=1').get() as any).c;
  res.json({ projects, unreadContacts, totalContacts, team, seminars, news });
}
