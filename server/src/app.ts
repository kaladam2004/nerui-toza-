import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import multer from 'multer';
import { errorHandler } from './middleware/errorHandler';
import { requireAuth } from './middleware/auth';
import * as authCtrl from './controllers/auth.controller';
import * as projectsCtrl from './controllers/projects.controller';
import * as newsCtrl from './controllers/news.controller';
import * as contactsCtrl from './controllers/contacts.controller';
import * as genericCtrl from './controllers/generic.controller';

const app = express();

// ── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(compression() as any);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Static files (uploads) ───────────────────────────────────────────────────
const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// ── Multer setup ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  },
});

// ── Rate Limiters ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many login attempts' } });
const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many submissions' } });

// ── AUTH ROUTES ───────────────────────────────────────────────────────────────
app.post('/api/auth/login', loginLimiter, authCtrl.login);
app.post('/api/auth/refresh', authCtrl.refresh);
app.post('/api/auth/logout', authCtrl.logout);
app.put('/api/auth/password', requireAuth, authCtrl.changePassword);
app.put('/api/auth/username', requireAuth, authCtrl.changeUsername);
app.get('/api/auth/me', requireAuth, authCtrl.getMe);

// ── PUBLIC ROUTES ─────────────────────────────────────────────────────────────
app.get('/api/projects', projectsCtrl.getProjects);
app.get('/api/projects/:id', projectsCtrl.getProject);
app.get('/api/services', genericCtrl.getServices);
app.get('/api/team', genericCtrl.getTeam);
app.get('/api/seminars', genericCtrl.getSeminars);
app.get('/api/map-markers', genericCtrl.getMapMarkers);
app.get('/api/settings', genericCtrl.getSettings);
app.get('/api/news', newsCtrl.getNews);
app.get('/api/news/:id', newsCtrl.getOneNews);
app.post('/api/contacts', contactLimiter, contactsCtrl.submitContact);

// ── ADMIN ROUTES (protected) ──────────────────────────────────────────────────
app.get('/api/admin/stats', requireAuth, contactsCtrl.getStats);
app.get('/api/admin/contacts', requireAuth, contactsCtrl.getContacts);
app.put('/api/admin/contacts/:id/read', requireAuth, contactsCtrl.markRead);
app.delete('/api/admin/contacts/:id', requireAuth, contactsCtrl.deleteContact);

app.post('/api/admin/projects', requireAuth, projectsCtrl.createProject);
app.put('/api/admin/projects/:id', requireAuth, projectsCtrl.updateProject);
app.delete('/api/admin/projects/:id', requireAuth, projectsCtrl.deleteProject);

app.post('/api/admin/news', requireAuth, newsCtrl.createNews);
app.put('/api/admin/news/:id', requireAuth, newsCtrl.updateNews);
app.delete('/api/admin/news/:id', requireAuth, newsCtrl.deleteNews);
app.put('/api/admin/news/:id/publish', requireAuth, newsCtrl.publishNews);

app.post('/api/admin/services', requireAuth, genericCtrl.createService);
app.put('/api/admin/services/:id', requireAuth, genericCtrl.updateService);
app.delete('/api/admin/services/:id', requireAuth, genericCtrl.deleteService);

app.post('/api/admin/team', requireAuth, genericCtrl.createTeamMember);
app.put('/api/admin/team/:id', requireAuth, genericCtrl.updateTeamMember);
app.delete('/api/admin/team/:id', requireAuth, genericCtrl.deleteTeamMember);

app.post('/api/admin/seminars', requireAuth, genericCtrl.createSeminar);
app.put('/api/admin/seminars/:id', requireAuth, genericCtrl.updateSeminar);
app.delete('/api/admin/seminars/:id', requireAuth, genericCtrl.deleteSeminar);

app.get('/api/admin/map-markers', requireAuth, genericCtrl.getAllMapMarkers);
app.post('/api/admin/map-markers', requireAuth, genericCtrl.createMapMarker);
app.put('/api/admin/map-markers/:id', requireAuth, genericCtrl.updateMapMarker);
app.delete('/api/admin/map-markers/:id', requireAuth, genericCtrl.deleteMapMarker);

app.put('/api/admin/settings', requireAuth, genericCtrl.updateSettings);

app.get('/api/partners', genericCtrl.getPartners);
app.get('/api/admin/partners', requireAuth, genericCtrl.getAllPartners);
app.post('/api/admin/partners', requireAuth, genericCtrl.createPartner);
app.put('/api/admin/partners/:id', requireAuth, genericCtrl.updatePartner);
app.delete('/api/admin/partners/:id', requireAuth, genericCtrl.deletePartner);

app.get('/api/timeline', genericCtrl.getTimeline);
app.post('/api/admin/timeline', requireAuth, genericCtrl.createTimelineItem);
app.put('/api/admin/timeline/:id', requireAuth, genericCtrl.updateTimelineItem);
app.delete('/api/admin/timeline/:id', requireAuth, genericCtrl.deleteTimelineItem);

app.get('/api/page-backgrounds', genericCtrl.getPageBackgrounds);
app.put('/api/admin/page-backgrounds/:key', requireAuth, genericCtrl.updatePageBackground);

app.post('/api/admin/upload', requireAuth, upload.single('file'), genericCtrl.uploadFile);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Serve React app in production ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(errorHandler);

export default app;
