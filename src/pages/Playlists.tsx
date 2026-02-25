import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Search, Filter, Play, Heart, User } from 'lucide-react';

interface Playlist {
  id: number;
  title: string;
  description: string;
  cover_image: string;
  creator_name: string;
  likes_count: number;
  tracks_count: number;
}

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        
        const res = await api.get(`/playlists?${params.toString()}`);
        setPlaylists(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchPlaylists, 300);
    return () => clearTimeout(timeout);
  }, [search, category]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Explore Playlists</h1>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search playlists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
          >
            <option value="">All Categories</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Sleep">Sleep</option>
            <option value="Study">Study</option>
            <option value="Ramadan">Ramadan</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
          {playlists.map((playlist) => (
            <Link key={playlist.id} to={`/playlists/${playlist.id}`} className="group bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img src={playlist.cover_image} alt={playlist.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-emerald-500 text-white p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    <Play className="h-6 w-6 fill-current" />
                  </div>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 truncate">{playlist.title}</h3>
                <p className="text-sm text-slate-500 truncate mt-1">{playlist.description}</p>
                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-400">
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
          {playlists.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              No playlists found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
