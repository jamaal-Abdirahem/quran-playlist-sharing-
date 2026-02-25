import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <div>Please login</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-8">
        <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-emerald-50" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
          <p className="text-slate-500">{user.email}</p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium capitalize">
            {user.role}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-500 py-12">
        User playlists and liked tracks will appear here.
      </div>
    </div>
  );
}
