import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../../.env') });

import app from './app';
import { runMigrations } from './database/migrate';
import fs from 'fs';

const PORT = parseInt(process.env.PORT || '3001', 10);

// Ensure uploads directory exists
const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Run DB migrations on startup
runMigrations();

app.listen(PORT, () => {
  console.log(`\n🚀 Nerui Toza Server running on http://localhost:${PORT}`);
  console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   API: http://localhost:${PORT}/api/health\n`);
});
