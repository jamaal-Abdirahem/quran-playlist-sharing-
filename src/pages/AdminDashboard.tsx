import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Users, Music, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: { count: 0 }, playlists: { count: 0 }, pendingReports: { count: 0 } });

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">{stats.users.count}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg">
            <Music className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Playlists</p>
            <p className="text-2xl font-bold text-slate-900">{stats.playlists.count}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending Reports</p>
            <p className="text-2xl font-bold text-slate-900">{stats.pendingReports.count}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center text-slate-500">
        Moderation tools and report management would go here.
      </div>
    </div>
  );
}
