import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, Heart, MessageSquare, Trash2, Plus, Share2, Clock, AlertTriangle } from 'lucide-react';

interface Track {
  id: number;
  surah_name: string;
  reciter: string;
  audio_url: string;
  duration: number;
  order_index: number;
}

interface Comment {
  id: number;
  text: string;
  user_name: string;
  user_avatar: string;
  created_at: string;
}

interface PlaylistDetail {
  id: number;
  title: string;
  description: string;
  cover_image: string;
  creator_name: string;
  creator_avatar: string;
  created_by: number;
  likes_count: number;
  isLiked: boolean;
  tracks: Track[];
  comments: Comment[];
}

export default function PlaylistDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());
  const [commentText, setCommentText] = useState('');
  const [showAddTrack, setShowAddTrack] = useState(false);
  
  // Add Track Form State
  const [newTrack, setNewTrack] = useState({ surah_name: '', reciter: '', audio_url: '' });

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  useEffect(() => {
    if (currentTrack) {
      audio.src = currentTrack.audio_url;
      audio.play().catch(e => console.error("Audio play failed", e));
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentTrack]);

  useEffect(() => {
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audio]);

  const fetchPlaylist = async () => {
    try {
      const res = await api.get(`/playlists/${id}`);
      setPlaylist(res.data);
    } catch (err) {
      console.error(err);
      navigate('/playlists');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
    }
  };

  const handleLike = async () => {
    if (!user) return navigate('/login');
    try {
      const res = await api.post(`/playlists/${id}/like`);
      setPlaylist(prev => prev ? {
        ...prev,
        isLiked: res.data.liked,
        likes_count: res.data.liked ? prev.likes_count + 1 : prev.likes_count - 1
      } : null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      const res = await api.post(`/playlists/${id}/comments`, { text: commentText });
      setPlaylist(prev => prev ? { ...prev, comments: [res.data, ...prev.comments] } : null);
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/tracks', { ...newTrack, playlist_id: Number(id) });
      setPlaylist(prev => prev ? { ...prev, tracks: [...prev.tracks, res.data] } : null);
      setShowAddTrack(false);
      setNewTrack({ surah_name: '', reciter: '', audio_url: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add track');
    }
  };

  const handleDeleteTrack = async (trackId: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/tracks/${trackId}`);
      setPlaylist(prev => prev ? { ...prev, tracks: prev.tracks.filter(t => t.id !== trackId) } : null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirm('Delete this playlist? This cannot be undone.')) return;
    try {
      await api.delete(`/playlists/${id}`);
      navigate('/playlists');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !playlist) return <div className="text-center py-12">Loading...</div>;

  const isOwner = user?.id === playlist.created_by;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <img src={playlist.cover_image} alt={playlist.title} className="w-full md:w-64 h-64 object-cover rounded-2xl shadow-lg" />
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-slate-900">{playlist.title}</h1>
            {isOwner && (
              <button onClick={handleDeletePlaylist} className="text-red-500 hover:text-red-700 p-2">
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
          <p className="text-lg text-slate-600">{playlist.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <img src={playlist.creator_avatar} alt={playlist.creator_name} className="w-6 h-6 rounded-full" />
              <span>{playlist.creator_name}</span>
            </div>
            <span>•</span>
            <span>{playlist.tracks.length} tracks</span>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={() => playlist.tracks.length > 0 && togglePlay(playlist.tracks[0])}
              className="bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
              {isPlaying ? 'Pause' : 'Play All'}
            </button>
            <button 
              onClick={handleLike}
              className={`p-3 rounded-full border transition-colors ${playlist.isLiked ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'}`}
            >
              <Heart className={`h-6 w-6 ${playlist.isLiked ? 'fill-current' : ''}`} />
            </button>
            <button className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors" title="Report">
              <AlertTriangle className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Tracks</h2>
          {isOwner && (
            <button 
              onClick={() => setShowAddTrack(!showAddTrack)}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Track
            </button>
          )}
        </div>

        {showAddTrack && (
          <form onSubmit={handleAddTrack} className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Surah Name</label>
              <input 
                type="text" 
                value={newTrack.surah_name} 
                onChange={e => setNewTrack({...newTrack, surah_name: e.target.value})}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Reciter</label>
              <input 
                type="text" 
                value={newTrack.reciter} 
                onChange={e => setNewTrack({...newTrack, reciter: e.target.value})}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Audio URL (MP3)</label>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  value={newTrack.audio_url} 
                  onChange={e => setNewTrack({...newTrack, audio_url: e.target.value})}
                  className="flex-1 px-3 py-2 rounded border border-slate-300 text-sm"
                  required
                  placeholder="https://example.com/audio.mp3"
                />
                <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-emerald-700">Add</button>
              </div>
            </div>
          </form>
        )}

        <div className="divide-y divide-slate-100">
          {playlist.tracks.map((track, index) => (
            <div 
              key={track.id} 
              className={`p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors ${currentTrack?.id === track.id ? 'bg-emerald-50/50' : ''}`}
            >
              <span className="text-slate-400 w-6 text-center font-mono text-sm">{index + 1}</span>
              <button 
                onClick={() => togglePlay(track)}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
              >
                {currentTrack?.id === track.id && isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium truncate ${currentTrack?.id === track.id ? 'text-emerald-700' : 'text-slate-900'}`}>{track.surah_name}</h3>
                <p className="text-sm text-slate-500 truncate">{track.reciter}</p>
              </div>
              <div className="text-sm text-slate-400 font-mono hidden sm:block">
                {/* Duration placeholder since we don't have real duration without metadata */}
                --:--
              </div>
              {isOwner && (
                <button onClick={() => handleDeleteTrack(track.id)} className="text-slate-400 hover:text-red-500 p-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {playlist.tracks.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No tracks yet. {isOwner ? 'Add some tracks above!' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Comments ({playlist.comments.length})
        </h2>
        
        {user ? (
          <form onSubmit={handleComment} className="flex gap-4">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <button 
                  type="submit" 
                  disabled={!commentText.trim()}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl text-center text-slate-600">
            <Link to="/login" className="text-emerald-600 font-medium hover:underline">Sign in</Link> to leave a comment.
          </div>
        )}

        <div className="space-y-4">
          {playlist.comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <img src={comment.user_avatar} alt={comment.user_name} className="w-10 h-10 rounded-full" />
              <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-900">{comment.user_name}</h4>
                  <span className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-700">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
