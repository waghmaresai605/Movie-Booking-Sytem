import React, { useState } from 'react';
import { 
  Film, 
  MapPin, 
  Search, 
  Ticket, 
  SlidersHorizontal, 
  FolderGit2, 
  Sparkles,
  ChevronDown,
  X,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Plus,
  Calendar,
  LogIn
} from 'lucide-react';
import { Movie, User } from '../types';

interface NavbarProps {
  currentCity: string;
  onSelectCity: (city: string) => void;
  cities: string[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenMyBookings: () => void;
  bookingCount: number;
  onOpenAdmin: () => void;
  onOpenDriveModal: () => void;
  allMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  activeTab: 'movies' | 'theaters' | 'concessions' | 'admin';
  setActiveTab: (tab: 'movies' | 'theaters' | 'concessions' | 'admin') => void;
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCity,
  onSelectCity,
  cities,
  searchQuery,
  onSearchChange,
  onOpenMyBookings,
  bookingCount,
  onOpenAdmin,
  onOpenDriveModal,
  allMovies,
  onSelectMovie,
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const filteredMovies = searchQuery.trim()
    ? allMovies.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
          m.cast.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Logo & City Selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div 
              onClick={() => {
                setActiveTab('movies');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/40 group-hover:scale-105 transition-transform">
                <Film className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                  Cine<span className="text-rose-500">Verse</span>
                </span>
                <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold block -mt-1">
                  Cinema Booking
                </span>
              </div>
            </div>

            {/* City Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>{currentCity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showCityDropdown && (
                <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Select Your City
                  </div>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        onSelectCity(city);
                        setShowCityDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors ${
                        city === currentCity
                          ? 'bg-rose-500/20 text-rose-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {city}
                      {city === currentCity && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-sm xl:max-w-md relative hidden lg:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search movies, genres, actors, or directors..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowSearchSuggestions(true);
                }}
                onFocus={() => setShowSearchSuggestions(true)}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm text-white placeholder-slate-500 rounded-xl pl-10 pr-9 py-2.5 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showSearchSuggestions && searchQuery.trim().length > 0 && (
              <div 
                className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 max-h-80 overflow-y-auto"
                onMouseLeave={() => setShowSearchSuggestions(false)}
              >
                {filteredMovies.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400">
                    No movies found matching &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredMovies.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => {
                        onSelectMovie(movie);
                        setShowSearchSuggestions(false);
                      }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-10 h-14 object-cover rounded shadow"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{movie.title}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{movie.genres.join(', ')}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-medium">★ {movie.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('movies')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'movies'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setActiveTab('theaters')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'theaters'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Theaters
            </button>
            <button
              onClick={() => setActiveTab('concessions')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'concessions'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Snacks & Bar
            </button>

            {/* Dedicated Admin Dashboard View Tab */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                  : 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-850'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
              {isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
            </button>
          </nav>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Drive Link / Project Info */}
            <button
              onClick={onOpenDriveModal}
              title="Google Drive Project Connection"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-medium transition-all"
            >
              <FolderGit2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">Drive Project</span>
            </button>

            {/* My Tickets */}
            <button
              onClick={onOpenMyBookings}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 hover:shadow-rose-900/50 transition-all relative"
            >
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">My Tickets</span>
              {bookingCount > 0 && (
                <span className="w-5 h-5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center -ml-0.5">
                  {bookingCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Area */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-white font-bold leading-tight truncate max-w-[100px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      {currentUser.role === 'admin' ? (
                        <span className="text-indigo-400">Admin</span>
                      ) : (
                        <span>Customer</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {showUserDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="text-xs font-bold text-white">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        currentUser.role === 'admin'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {currentUser.role === 'admin' ? 'Cinema Administrator' : 'Movie Goer'}
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span>Admin Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenMyBookings();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-rose-400" />
                        <span>My Booked Tickets</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenAuth('login');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-sky-400" />
                        <span>Switch Account / Demo</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2 text-rose-400 hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Signed Out State: Sign In and Register Buttons */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-900/30 transition-all"
                >
                  <span>Register</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Submenu & Search */}
        <div className="pb-3 md:hidden flex flex-col gap-2">
          {/* Mobile Navigation tabs */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('movies')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex-1 text-center ${
                activeTab === 'movies' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setActiveTab('theaters')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex-1 text-center ${
                activeTab === 'theaters' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              Theaters
            </button>
            <button
              onClick={() => setActiveTab('concessions')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex-1 text-center ${
                activeTab === 'concessions' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              Snacks
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex-1 text-center flex items-center justify-center gap-1 ${
                activeTab === 'admin' ? 'bg-indigo-600 text-white' : 'text-indigo-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search movies, genres, actors..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 rounded-lg pl-9 pr-4 py-2 outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
