import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../database/connection';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

export function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
    | { id: number; username: string; password: string; role: string }
    | undefined;

  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const payload = { id: user.id, username: user.username, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken, user: payload });
}

export function refresh(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as {
      id: number; username: string; role: string;
    };
    const accessToken = jwt.sign(
      { id: payload.id, username: payload.username, role: payload.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
}

export function getMe(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const db = getDb();
  const user = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(userId) as
    | { id: number; username: string; role: string } | undefined;
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(user);
}

export function changeUsername(req: Request, res: Response) {
  const { newUsername, currentPassword } = req.body;
  const userId = (req as any).user?.id;

  if (!newUsername || newUsername.trim().length < 3) {
    res.status(400).json({ error: 'Номи корбар бояд камаш 3 ҳарф бошад' });
    return;
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as
    | { id: number; username: string; password: string } | undefined;

  if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
    res.status(401).json({ error: 'Пароли ҷорӣ нодуруст аст' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(newUsername.trim(), userId);
  if (existing) {
    res.status(409).json({ error: 'Ин номи корбар аллакай мавҷуд аст' });
    return;
  }

  db.prepare('UPDATE users SET username = ?, updated_at = datetime("now") WHERE id = ?').run(newUsername.trim(), userId);
  res.json({ message: 'Username changed successfully' });
}

export function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body;
  const userId = (req as any).user?.id;

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as
    | { id: number; password: string } | undefined;

  if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ?, updated_at = datetime("now") WHERE id = ?').run(hash, userId);
  res.json({ message: 'Password changed successfully' });
}
