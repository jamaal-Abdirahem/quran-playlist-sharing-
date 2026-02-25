import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X, Music, PlusCircle } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
                <Music className="h-6 w-6" />
                <span>QuranPlay</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/playlists" className="text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">Discover</Link>
              {user ? (
                <>
                  <Link to="/create-playlist" className="flex items-center gap-1 text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">
                    <PlusCircle className="h-4 w-4" /> Create
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium focus:outline-none">
                      <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                      <span>{user.name}</span>
                    </button>
                    <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white border border-slate-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-1">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Profile</Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Admin Dashboard</Link>
                        )}
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100">
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">Sign in</Link>
                  <Link to="/register" className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-md text-sm font-medium">Sign up</Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
              >
                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/playlists" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50">Discover</Link>
              {user ? (
                <>
                  <Link to="/create-playlist" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50">Create Playlist</Link>
                  <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50">Profile</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50">Admin Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-slate-50">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50">Sign in</Link>
                  <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:bg-emerald-50">Sign up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
