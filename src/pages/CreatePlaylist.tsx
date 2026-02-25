import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Image as ImageIcon } from 'lucide-react';

export default function CreatePlaylist() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/playlists', {
        title,
        description,
        category,
        visibility,
        cover_image: coverImage || undefined,
      });
      navigate(`/playlists/${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Create New Playlist</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                required
                placeholder="My Quran Playlist"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              >
                <option value="">Select Category</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Sleep">Sleep</option>
                <option value="Study">Study</option>
                <option value="Ramadan">Ramadan</option>
                <option value="Juz">Juz</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Public</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Private</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image URL</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden">
              {coverImage ? (
                <img src={coverImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = '')} />
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-xs">Image Preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
            placeholder="Describe your playlist..."
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Playlist'}
          </button>
        </div>
      </form>
    </div>
  );
}
