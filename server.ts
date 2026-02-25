import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import db, { initDb } from './src/db';
import { z } from 'zod';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

// Initialize Database
initDb();

app.use(express.json());
app.use(cors());

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---

app.post('/api/auth/register', (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  });

  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues });
  }

  const { name, email, password } = validation.data;

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    
    const stmt = db.prepare('INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name, email, hashedPassword, avatar);
    
    const token = jwt.sign({ id: info.lastInsertRowid, email, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: info.lastInsertRowid, name, email, role: 'user', avatar } });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
});

app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  const user: any = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.sendStatus(404);
  res.json(user);
});

// --- Playlist Routes ---

app.get('/api/playlists', (req, res) => {
  const { search, category, sort } = req.query;
  let query = `
    SELECT p.*, u.name as creator_name, u.avatar as creator_avatar,
    (SELECT COUNT(*) FROM likes WHERE playlist_id = p.id) as likes_count,
    (SELECT COUNT(*) FROM tracks WHERE playlist_id = p.id) as tracks_count
    FROM playlists p
    JOIN users u ON p.created_by = u.id
    WHERE p.visibility = 'public'
  `;
  const params: any[] = [];

  if (search) {
    query += ` AND (p.title LIKE ? OR p.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (category) {
    query += ` AND p.category = ?`;
    params.push(category);
  }

  if (sort === 'likes') {
    query += ` ORDER BY likes_count DESC`;
  } else {
    query += ` ORDER BY p.created_at DESC`;
  }

  const playlists = db.prepare(query).all(...params);
  res.json(playlists);
});

app.get('/api/playlists/:id', (req, res) => {
  const playlist: any = db.prepare(`
    SELECT p.*, u.name as creator_name, u.avatar as creator_avatar,
    (SELECT COUNT(*) FROM likes WHERE playlist_id = p.id) as likes_count
    FROM playlists p
    JOIN users u ON p.created_by = u.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  const tracks = db.prepare('SELECT * FROM tracks WHERE playlist_id = ? ORDER BY order_index ASC').all(req.params.id);
  const comments = db.prepare(`
    SELECT c.*, u.name as user_name, u.avatar as user_avatar 
    FROM comments c 
    JOIN users u ON c.user_id = u.id 
    WHERE c.playlist_id = ? 
    ORDER BY c.created_at DESC
  `).all(req.params.id);

  // Check if current user liked this playlist (if auth header present)
  let isLiked = false;
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const like = db.prepare('SELECT * FROM likes WHERE user_id = ? AND playlist_id = ?').get(decoded.id, req.params.id);
      isLiked = !!like;
    } catch (e) {}
  }

  res.json({ ...playlist, tracks, comments, isLiked });
});

app.post('/api/playlists', authenticateToken, (req: any, res) => {
  const schema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    category: z.string().optional(),
    visibility: z.enum(['public', 'private']).default('public'),
    cover_image: z.string().optional(),
  });

  const validation = schema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: validation.error.issues });

  const { title, description, category, visibility, cover_image } = validation.data;
  
  const stmt = db.prepare(`
    INSERT INTO playlists (title, description, category, visibility, cover_image, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const info = stmt.run(title, description, category, visibility, cover_image || 'https://picsum.photos/seed/quran/400/400', req.user.id);
  res.json({ id: info.lastInsertRowid, ...validation.data });
});

app.delete('/api/playlists/:id', authenticateToken, (req: any, res) => {
  const playlist: any = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  if (playlist.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.prepare('DELETE FROM playlists WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- Track Routes ---

app.post('/api/tracks', authenticateToken, (req: any, res) => {
  const schema = z.object({
    playlist_id: z.number(),
    surah_name: z.string(),
    reciter: z.string(),
    audio_url: z.string().url(),
    duration: z.number().optional(),
  });

  const validation = schema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: validation.error.issues });

  const { playlist_id, surah_name, reciter, audio_url, duration } = validation.data;

  // Verify ownership
  const playlist: any = db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlist_id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  if (playlist.created_by !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

  // Get current max order index
  const maxOrder: any = db.prepare('SELECT MAX(order_index) as max_order FROM tracks WHERE playlist_id = ?').get(playlist_id);
  const nextOrder = (maxOrder.max_order || 0) + 1;

  const stmt = db.prepare(`
    INSERT INTO tracks (playlist_id, surah_name, reciter, audio_url, duration, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(playlist_id, surah_name, reciter, audio_url, duration || 0, nextOrder);
  res.json({ id: info.lastInsertRowid, ...validation.data });
});

app.delete('/api/tracks/:id', authenticateToken, (req: any, res) => {
  const track: any = db.prepare('SELECT * FROM tracks WHERE id = ?').get(req.params.id);
  if (!track) return res.status(404).json({ error: 'Track not found' });

  const playlist: any = db.prepare('SELECT * FROM playlists WHERE id = ?').get(track.playlist_id);
  if (playlist.created_by !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

  db.prepare('DELETE FROM tracks WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- Social Routes ---

app.post('/api/playlists/:id/like', authenticateToken, (req: any, res) => {
  try {
    db.prepare('INSERT INTO likes (user_id, playlist_id) VALUES (?, ?)').run(req.user.id, req.params.id);
    res.json({ success: true, liked: true });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      // Already liked, so unlike
      db.prepare('DELETE FROM likes WHERE user_id = ? AND playlist_id = ?').run(req.user.id, req.params.id);
      res.json({ success: true, liked: false });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.post('/api/playlists/:id/comments', authenticateToken, (req: any, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const stmt = db.prepare('INSERT INTO comments (playlist_id, user_id, text) VALUES (?, ?, ?)');
  const info = stmt.run(req.params.id, req.user.id, text);
  
  const comment = db.prepare(`
    SELECT c.*, u.name as user_name, u.avatar as user_avatar 
    FROM comments c 
    JOIN users u ON c.user_id = u.id 
    WHERE c.id = ?
  `).get(info.lastInsertRowid);

  res.json(comment);
});

// --- Admin Routes ---

app.get('/api/admin/stats', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const playlistCount = db.prepare('SELECT COUNT(*) as count FROM playlists').get();
  const reportCount = db.prepare('SELECT COUNT(*) as count FROM reports WHERE status = "pending"').get();

  res.json({ users: userCount, playlists: playlistCount, pendingReports: reportCount });
});


// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
