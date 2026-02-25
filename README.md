# Quran Playlist Platform

A full-stack application for creating and sharing Quran playlists.

## Features

- **User Accounts**: Register, Login, Profile management.
- **Playlists**: Create, Edit, Delete, Public/Private visibility.
- **Tracks**: Add Quran tracks with audio URLs.
- **Social**: Like playlists, Comment on playlists.
- **Admin Dashboard**: View platform stats.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express, SQLite (better-sqlite3).
- **Auth**: JWT, bcryptjs.

## Getting Started

1.  **Install Dependencies**: `npm install`
2.  **Run Development Server**: `npm run dev`

## Default Credentials

- **Admin User**: `admin@example.com`
- **Password**: `admin123`

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/playlists`
- `POST /api/playlists`
- `GET /api/playlists/:id`
- `POST /api/tracks`
