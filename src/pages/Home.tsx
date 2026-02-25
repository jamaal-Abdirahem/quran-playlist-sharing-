import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Play, Heart, User } from 'lucide-react';

interface Playlist {
  id: number;
  title: string;
  description: string;
  cover_image: string;
  creator_name: string;
  creator_avatar: string;
  likes_count: number;
  tracks_count: number;
}

export default function Home() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/playlists?sort=likes')
      .then((res) => setPlaylists(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 bg-emerald-50 rounded-3xl">
        <h1 className="text-4xl md:text-6xl font-bold text-emerald-900 tracking-tight">
          Discover the Beauty of the Quran
        </h1>
        <p className="text-lg md:text-xl text-emerald-700 max-w-2xl mx-auto">
          Create, share, and listen to curated playlists of your favorite recitations. 
          Connect with a community of listeners.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl">
            Get Started
          </Link>
          <Link to="/playlists" className="bg-white text-emerald-600 border border-emerald-200 px-8 py-3 rounded-full font-semibold hover:bg-emerald-50 transition-colors">
            Browse Playlists
          </Link>
        </div>
      </section>

      {/* Featured Playlists */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Trending Playlists</h2>
          <Link to="/playlists" className="text-emerald-600 font-medium hover:underline">View all</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 h-80 animate-pulse">
                <div className="h-48 bg-slate-200 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {playlists.slice(0, 4).map((playlist) => (
              <Link key={playlist.id} to={`/playlists/${playlist.id}`} className="group bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="relative aspect-square overflow-hidden">
                  <img src={playlist.cover_image} alt={playlist.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-emerald-500 text-white p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      <Play className="h-6 w-6 fill-current" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 truncate">{playlist.title}</h3>
                  <p className="text-sm text-slate-500 truncate mt-1">{playlist.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{playlist.creator_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{playlist.likes_count}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
