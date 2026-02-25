import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('quran_playlists.db');
db.pragma('journal_mode = WAL');

export function initDb() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Playlists table
  db.exec(`
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      cover_image TEXT,
      category TEXT,
      visibility TEXT DEFAULT 'public',
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Tracks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id INTEGER NOT NULL,
      surah_name TEXT NOT NULL,
      reciter TEXT NOT NULL,
      audio_url TEXT NOT NULL,
      duration INTEGER,
      order_index INTEGER NOT NULL,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
    )
  `);

  // Likes table (Many-to-Many relationship between users and playlists)
  db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      user_id INTEGER NOT NULL,
      playlist_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, playlist_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
    )
  `);

  // Comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Reports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, -- 'playlist', 'comment', 'user'
      reference_id INTEGER NOT NULL,
      reported_by INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'resolved'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reported_by) REFERENCES users(id)
    )
  `);

  // Create a default admin user if not exists
  const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@example.com');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (name, email, password, role, avatar)
      VALUES (?, ?, ?, ?, ?)
    `).run('Admin User', 'admin@example.com', hashedPassword, 'admin', 'https://ui-avatars.com/api/?name=Admin+User');
    console.log('Default admin user created: admin@example.com / admin123');
  }

  // Seed Playlists
  const playlistCount = db.prepare('SELECT COUNT(*) as count FROM playlists').get().count;
  if (playlistCount === 0) {
    const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@example.com');
    if (adminUser) {
      const insertPlaylist = db.prepare(`
        INSERT INTO playlists (title, description, category, visibility, cover_image, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const insertTrack = db.prepare(`
        INSERT INTO tracks (playlist_id, surah_name, reciter, audio_url, duration, order_index)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const p1 = insertPlaylist.run(
        'Morning Azkar & Surahs',
        'Beautiful recitations to start your day with barakah.',
        'Morning',
        'public',
        'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=800&q=80',
        adminUser.id
      );

      insertTrack.run(p1.lastInsertRowid, 'Surah Yasin', 'Mishary Rashid Alafasy', 'https://server8.mp3quran.net/afs/036.mp3', 0, 1);
      insertTrack.run(p1.lastInsertRowid, 'Surah Ar-Rahman', 'Abdul Basit', 'https://server7.mp3quran.net/basit/055.mp3', 0, 2);

      const p2 = insertPlaylist.run(
        'Sleep Protection',
        'Surah Al-Mulk and soothing recitations for sleep.',
        'Sleep',
        'public',
        'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=800&q=80',
        adminUser.id
      );

      insertTrack.run(p2.lastInsertRowid, 'Surah Al-Mulk', 'Saad Al-Ghamdi', 'https://server7.mp3quran.net/s_gmd/067.mp3', 0, 1);
      
      console.log('Seed data created');
    }
  }
}

export default db;
