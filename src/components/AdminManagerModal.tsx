import React, { useState } from 'react';
import { 
  X, 
  Film, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Lock
} from 'lucide-react';
import { Movie, Booking, MovieGenre, MovieFormat, User } from '../types';
import { formatCurrency } from '../utils/bookingUtils';

interface AdminManagerModalProps {
  movies: Movie[];
  bookings: Booking[];
  onClose: () => void;
  onAddMovie: (movie: Movie) => void;
  onDeleteMovie: (id: string) => void;
  onResetData: () => void;
  currentUser?: User | null;
  onSwitchToAdmin?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const AdminManagerModal: React.FC<AdminManagerModalProps> = ({
  movies,
  bookings,
  onClose,
  onAddMovie,
  onDeleteMovie,
  onResetData,
  currentUser = null,
  onSwitchToAdmin,
  onOpenAuth,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'overview' | 'add-movie' | 'movie-catalog'>('overview');

  // Form states for adding movie
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [duration, setDuration] = useState(140);
  const [rating, setRating] = useState(8.5);
  const [genres, setGenres] = useState<MovieGenre[]>(['Action', 'Sci-Fi']);
  const [formats, setFormats] = useState<MovieFormat[]>(['IMAX 3D', 'Standard 2D']);
  const [director, setDirector] = useState('');
  const [certification, setCertification] = useState<'PG' | 'PG-13' | 'R'>('PG-13');

  // Metrics
  const totalRevenue = bookings.reduce((sum, b) => (b.status === 'confirmed' ? sum + b.totalAmount : sum), 0);
  const totalTicketsSold = bookings.reduce((sum, b) => (b.status === 'confirmed' ? sum + b.seats.length : sum), 0);
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;

  const handleCreateMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMovie: Movie = {
      id: `custom-${Date.now()}`,
      title,
      tagline: tagline || 'Experience the cinema magic.',
      synopsis: synopsis || 'An epic cinematic journey designed for giant screens and immersive surround sound.',
      posterUrl: posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
      backdropUrl: backdropUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      rating,
      voteCount: 1500,
      durationMinutes: duration,
      releaseYear: 2026,
      genres,
      certification,
      languages: ['English'],
      formats,
      director: director || 'Visionary Director',
      status: 'now-showing',
      releaseDateText: 'In Theaters',
      trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
      cast: [
        { name: 'Lead Actor', role: 'Protagonist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      ],
    };

    onAddMovie(newMovie);
    setActiveTab('movie-catalog');
    alert(`Movie "${title}" was successfully added to theater listings!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cinema Manager Dashboard</h2>
              <p className="text-xs text-slate-400">Live theater analytics, scheduling & movie catalog</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isAdmin ? (
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/40">
                <ShieldCheck className="w-7 h-7 text-rose-500" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Role-Based Access Control
                </span>
                <h3 className="text-lg font-black text-white mt-2">
                  Admin Sign-In Required
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Access to the Cinema Manager Dashboard is restricted. Please sign in using an administrator account to view revenue analytics and manage the movie catalog.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left">
                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Session Status</span>
                {currentUser ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-white block">{currentUser.name}</strong>
                      <span className="text-slate-400 text-[11px]">{currentUser.email}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300">
                      {currentUser.role} (Restricted)
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No active session (Guest)</span>
                )}
              </div>

              <div className="space-y-2 pt-2">
                {onSwitchToAdmin && (
                  <button
                    type="button"
                    onClick={onSwitchToAdmin}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
                  >
                    Switch to Admin Account (admin@cineverse.com)
                  </button>
                )}

                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth('login');
                    }}
                    className="w-full py-2 px-3 text-xs text-slate-400 hover:text-white underline block"
                  >
                    Sign In with Admin Credentials
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Tab switch */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Sales & Analytics
          </button>
          <button
            onClick={() => setActiveTab('movie-catalog')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'movie-catalog'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Movie Catalog ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab('add-movie')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'add-movie'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            + Add New Movie
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Gross Box Office</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{formatCurrency(totalRevenue)}</div>
                  <span className="text-[11px] text-emerald-400 font-medium">Real-time simulation</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Tickets Issued</span>
                    <Users className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{totalTicketsSold} seats</div>
                  <span className="text-[11px] text-sky-400 font-medium">{confirmedCount} completed transactions</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Active Screens</span>
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{movies.length} Movies</div>
                  <span className="text-[11px] text-amber-400 font-medium">100% System Health</span>
                </div>
              </div>

              {/* Recent Bookings in Manager view */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Recent Audience Reservations</h3>
                <div className="space-y-2">
                  {bookings.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-4 bg-slate-950 rounded-xl">
                      No customer bookings made yet in this session.
                    </p>
                  ) : (
                    bookings.slice(0, 5).map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-400 font-bold">{b.bookingCode}</span>
                          <span className="font-bold text-white truncate max-w-[140px] sm:max-w-xs">{b.movieTitle}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-400">Seats: {b.seats.join(', ')}</span>
                          <span className="font-bold text-emerald-400">{formatCurrency(b.totalAmount)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={onResetData}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset to Default Movies & Bookings
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MOVIE CATALOG */}
          {activeTab === 'movie-catalog' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">Current Movies in System ({movies.length})</h3>
                <button
                  onClick={() => setActiveTab('add-movie')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Movie
                </button>
              </div>

              {movies.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img src={m.posterUrl} alt={m.title} className="w-10 h-14 object-cover rounded-lg" />
                    <div>
                      <div className="font-bold text-white text-sm">{m.title}</div>
                      <div className="text-xs text-slate-400">{m.genres.join(', ')} • {m.durationMinutes} mins</div>
                      <div className="text-[11px] text-sky-400 mt-0.5">{m.formats.join(' | ')}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMovie(m.id)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                    title="Remove movie"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ADD NEW MOVIE */}
          {activeTab === 'add-movie' && (
            <form onSubmit={handleCreateMovie} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Movie Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inception 2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Your dream has a secret."
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Plot Synopsis</label>
                <textarea
                  rows={2}
                  placeholder="Short movie plot description..."
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Runtime (minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Rating (out of 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Certification</label>
                  <select
                    value={certification}
                    onChange={(e) => setCertification(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="PG">PG</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Poster Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Director</label>
                  <input
                    type="text"
                    placeholder="Director name"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Publish Movie to Theaters
              </button>
            </form>
          )}

        </div>
          </>
        )}
      </div>
    </div>
  );
};
