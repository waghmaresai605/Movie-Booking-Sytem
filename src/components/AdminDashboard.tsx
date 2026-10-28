import React, { useState } from 'react';
import { 
  Film, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  Tv, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Sparkles, 
  RotateCcw, 
  QrCode, 
  ArrowRight, 
  X,
  Play,
  Layers,
  ChevronRight,
  ExternalLink,
  Sliders,
  Eye
} from 'lucide-react';
import { Movie, Theater, Booking, Showtime, MovieGenre, MovieFormat, User } from '../types';
import { formatCurrency, getNextDates } from '../utils/bookingUtils';

interface AdminDashboardProps {
  movies: Movie[];
  theaters: Theater[];
  bookings: Booking[];
  showtimes: Showtime[];
  currentUser: User | null;
  onAddMovie: (movie: Movie) => void;
  onDeleteMovie: (id: string) => void;
  onAddShowtime: (showtime: Showtime) => void;
  onDeleteShowtime: (id: string) => void;
  onResetData: () => void;
  onClose?: () => void;
  isModal?: boolean;
  onSwitchToAdmin?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onLoginSuccess?: (user: User) => void;
  existingUsers?: (User & { passwordHash?: string })[];
  onExitAdmin?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  movies,
  theaters,
  bookings,
  showtimes,
  currentUser,
  onAddMovie,
  onDeleteMovie,
  onAddShowtime,
  onDeleteShowtime,
  onResetData,
  onClose,
  isModal = false,
  onSwitchToAdmin,
  onOpenAuth,
  onLoginSuccess,
  existingUsers,
  onExitAdmin,
}) => {
  // Navigation sub-tabs within the Admin Dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'add-movie' | 'schedule-show' | 'movie-catalog' | 'bookings'>('overview');

  // RBAC Direct Admin Login Form State
  const [adminInputEmail, setAdminInputEmail] = useState('admin@cineverse.com');
  const [adminInputPassword, setAdminInputPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleDirectAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const trimmed = adminInputEmail.trim().toLowerCase();

    const userFound = existingUsers?.find((u) => u.email.toLowerCase() === trimmed);
    if (userFound) {
      if (userFound.role !== 'admin') {
        setAuthError('Access Denied: This account is a Customer account. Only Administrator accounts can access the Cinema Manager Dashboard.');
        return;
      }
      if (userFound.passwordHash && adminInputPassword !== userFound.passwordHash) {
        setAuthError('Incorrect administrator password. Please try again.');
        return;
      }
      if (onLoginSuccess) {
        onLoginSuccess(userFound);
        return;
      }
    } else if (trimmed === 'admin@cineverse.com') {
      if (adminInputPassword && adminInputPassword !== 'admin123') {
        setAuthError('Incorrect administrator password. Try admin123');
        return;
      }
      if (onSwitchToAdmin) {
        onSwitchToAdmin();
        return;
      }
    } else {
      setAuthError('No administrator account found with this email. Try admin@cineverse.com');
      return;
    }

    if (onSwitchToAdmin) {
      onSwitchToAdmin();
    }
  };

  // ================= ADD MOVIE FORM STATE =================
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [newPosterUrl, setNewPosterUrl] = useState('');
  const [newBackdropUrl, setNewBackdropUrl] = useState('');
  const [newDuration, setNewDuration] = useState(148);
  const [newRating, setNewRating] = useState(8.8);
  const [newReleaseYear, setNewReleaseYear] = useState(2026);
  const [newCertification, setNewCertification] = useState<'PG' | 'PG-13' | 'R' | 'U/A 13+' | 'U/A 16+' | 'A'>('PG-13');
  const [newDirector, setNewDirector] = useState('');
  const [newStatus, setNewStatus] = useState<'now-showing' | 'upcoming'>('now-showing');
  const [newTrailerUrl, setNewTrailerUrl] = useState('https://www.youtube.com/embed/Way9Dexny3w');
  const [newGenres, setNewGenres] = useState<MovieGenre[]>(['Sci-Fi', 'Action']);
  const [newFormats, setNewFormats] = useState<MovieFormat[]>(['IMAX 3D', 'Dolby Cinema', 'Standard 2D']);
  const [newLanguages, setNewLanguages] = useState<string[]>(['English', 'Spanish']);
  const [newFeatured, setNewFeatured] = useState(false);
  const [movieSuccessFeedback, setMovieSuccessFeedback] = useState('');

  // Cast members list
  const [castList, setCastList] = useState<{ name: string; role: string; avatar: string }[]>([
    { name: 'Lead Performer', role: 'Main Protagonist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  ]);
  const [newCastName, setNewCastName] = useState('');
  const [newCastRole, setNewCastRole] = useState('');

  // ================= SCHEDULE SHOW FORM STATE =================
  const dateOptions = getNextDates(14);
  const [schedTheaterId, setSchedTheaterId] = useState<string>(theaters[0]?.id || 'th-1');
  const [schedMovieId, setSchedMovieId] = useState<string>(movies[0]?.id || 'movie-1');
  const [schedDate, setSchedDate] = useState<string>(dateOptions[0].dateStr);
  const [schedTime, setSchedTime] = useState<string>('07:30 PM');
  const [schedFormat, setSchedFormat] = useState<MovieFormat>('IMAX 3D');
  const [schedHall, setSchedHall] = useState<string>('Hall 1 - Grand IMAX Laser');
  const [priceVip, setPriceVip] = useState<number>(24.0);
  const [pricePrime, setPricePrime] = useState<number>(18.5);
  const [priceClassic, setPriceClassic] = useState<number>(14.0);
  const [preBookedCount, setPreBookedCount] = useState<number>(4);
  const [showScheduleSuccess, setShowScheduleSuccess] = useState('');

  // Schedule filtering in management view
  const [scheduleFilterTheater, setScheduleFilterTheater] = useState<string>('all');
  const [scheduleFilterMovie, setScheduleFilterMovie] = useState<string>('all');
  const [scheduleFilterDate, setScheduleFilterDate] = useState<string>('all');

  // Bookings / Ticket inspector search
  const [bookingSearch, setBookingSearch] = useState('');
  const [verifiedBookingCode, setVerifiedBookingCode] = useState<string | null>(null);

  // Available genre chips
  const ALL_GENRES: MovieGenre[] = [
    'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Thriller', 'Animation', 'Comedy', 'Horror', 'Fantasy', 'Crime'
  ];

  // Available format chips
  const ALL_FORMATS: MovieFormat[] = [
    'IMAX 3D', 'Dolby Cinema', '4DX', 'RealD 3D', 'Standard 2D'
  ];

  // Preset movie templates for 1-click populating
  const PRESET_TEMPLATES = [
    {
      title: 'Tron: Ares - Cyber Renaissance',
      tagline: 'The grid is no longer digital.',
      synopsis: 'A highly sophisticated Program named Ares is dispatched from the digital grid into the human world on a dangerous mission, marking humankind\'s first encounter with artificial intelligence beings.',
      posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
      duration: 135,
      rating: 9.1,
      certification: 'PG-13' as const,
      director: 'Joachim Rønning',
      genres: ['Sci-Fi' as MovieGenre, 'Action' as MovieGenre, 'Adventure' as MovieGenre],
      formats: ['IMAX 3D' as MovieFormat, '4DX' as MovieFormat, 'Dolby Cinema' as MovieFormat],
      trailerUrl: 'https://www.youtube.com/embed/LembwKDo1Dk',
    },
    {
      title: 'Oppenheimer - 70mm Special Roadshow',
      tagline: 'The story of the man who moved the earth.',
      synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb, specially curated in native 70mm large-format projection.',
      posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1600&auto=format&fit=crop',
      duration: 180,
      rating: 9.6,
      certification: 'R' as const,
      director: 'Christopher Nolan',
      genres: ['Drama' as MovieGenre, 'Thriller' as MovieGenre],
      formats: ['IMAX 3D' as MovieFormat, 'Dolby Cinema' as MovieFormat],
      trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
    },
    {
      title: 'Neon Odyssey: Tokyo Express',
      tagline: 'Speed through the rain-soaked shadows.',
      synopsis: 'High-octane cyberpunk thriller set aboard a supersonic bullet train hijacked by cybernetically enhanced operatives carrying a quantum energy device across Japan.',
      posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1600&auto=format&fit=crop',
      duration: 128,
      rating: 8.9,
      certification: 'R' as const,
      director: 'Chad Stahelski',
      genres: ['Action' as MovieGenre, 'Thriller' as MovieGenre, 'Crime' as MovieGenre],
      formats: ['4DX' as MovieFormat, 'Dolby Cinema' as MovieFormat, 'Standard 2D' as MovieFormat],
      trailerUrl: 'https://www.youtube.com/embed/4rgYUipGJNo',
    },
  ];

  const handleApplyTemplate = (tmpl: typeof PRESET_TEMPLATES[0]) => {
    setNewTitle(tmpl.title);
    setNewTagline(tmpl.tagline);
    setNewSynopsis(tmpl.synopsis);
    setNewPosterUrl(tmpl.posterUrl);
    setNewBackdropUrl(tmpl.backdropUrl);
    setNewDuration(tmpl.duration);
    setNewRating(tmpl.rating);
    setNewCertification(tmpl.certification);
    setNewDirector(tmpl.director);
    setNewGenres(tmpl.genres);
    setNewFormats(tmpl.formats);
    setNewTrailerUrl(tmpl.trailerUrl);
  };

  // Genre toggle
  const toggleGenre = (genre: MovieGenre) => {
    if (newGenres.includes(genre)) {
      if (newGenres.length > 1) {
        setNewGenres(newGenres.filter((g) => g !== genre));
      }
    } else {
      setNewGenres([...newGenres, genre]);
    }
  };

  // Format toggle
  const toggleFormat = (format: MovieFormat) => {
    if (newFormats.includes(format)) {
      if (newFormats.length > 1) {
        setNewFormats(newFormats.filter((f) => f !== format));
      }
    } else {
      setNewFormats([...newFormats, format]);
    }
  };

  // Add Cast Member
  const handleAddCastMember = () => {
    if (!newCastName.trim()) return;
    setCastList([
      ...castList,
      {
        name: newCastName.trim(),
        role: newCastRole.trim() || 'Supporting Cast',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    ]);
    setNewCastName('');
    setNewCastRole('');
  };

  // Remove Cast Member
  const handleRemoveCastMember = (idx: number) => {
    setCastList(castList.filter((_, i) => i !== idx));
  };

  // ================= HANDLE ADD MOVIE =================
  const handleCreateMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Please enter a movie title.');
      return;
    }

    const createdMovie: Movie = {
      id: `movie-admin-${Date.now()}`,
      title: newTitle.trim(),
      tagline: newTagline.trim() || 'Experience the cinema magic in premium large formats.',
      synopsis: newSynopsis.trim() || 'An epic blockbuster crafted specifically for giant screens and immersive surround sound.',
      posterUrl: newPosterUrl.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
      backdropUrl: newBackdropUrl.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      rating: Number(newRating),
      voteCount: 1200,
      durationMinutes: Number(newDuration),
      releaseYear: Number(newReleaseYear),
      genres: newGenres,
      certification: newCertification,
      languages: newLanguages,
      formats: newFormats,
      director: newDirector.trim() || 'Visionary Director',
      status: newStatus,
      releaseDateText: newStatus === 'now-showing' ? 'Now Showing' : 'Coming Soon',
      trailerUrl: newTrailerUrl.trim() || 'https://www.youtube.com/embed/Way9Dexny3w',
      featured: newFeatured,
      cast: castList.length > 0 ? castList : [
        { name: 'Lead Star', role: 'Main Role', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' }
      ],
    };

    onAddMovie(createdMovie);
    setMovieSuccessFeedback(`Movie "${createdMovie.title}" was successfully created and published!`);
    
    // Reset inputs
    setNewTitle('');
    setNewTagline('');
    setNewSynopsis('');
    setNewPosterUrl('');
    setNewBackdropUrl('');

    setTimeout(() => {
      setMovieSuccessFeedback('');
      setActiveTab('movie-catalog');
    }, 1500);
  };

  // ================= HANDLE SCHEDULE SHOW =================
  const handleCreateShowtime = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTheater = theaters.find((t) => t.id === schedTheaterId);
    const selectedMovie = movies.find((m) => m.id === schedMovieId);

    if (!selectedTheater || !selectedMovie) {
      alert('Please select a valid theater and movie.');
      return;
    }

    // Generate seed booked seats if preBookedCount > 0
    const bookedSeats: string[] = [];
    const seedPool = ['C-7', 'C-8', 'C-9', 'C-10', 'D-7', 'D-8', 'D-9', 'B-7', 'B-8'];
    for (let i = 0; i < Math.min(preBookedCount, seedPool.length); i++) {
      bookedSeats.push(seedPool[i]);
    }

    const newShow: Showtime = {
      id: `show-${schedMovieId}-${schedTheaterId}-${schedDate}-${schedTime.replace(/[: ]/g, '')}-${Date.now().toString().slice(-4)}`,
      movieId: schedMovieId,
      theaterId: schedTheaterId,
      date: schedDate,
      time: schedTime,
      format: schedFormat,
      hallName: schedHall,
      prices: {
        vip: Number(priceVip),
        prime: Number(pricePrime),
        classic: Number(priceClassic),
      },
      bookedSeats,
    };

    onAddShowtime(newShow);
    setShowScheduleSuccess(`Show successfully scheduled for "${selectedMovie.title}" on ${schedDate} at ${schedTime} in ${selectedTheater.name}!`);

    setTimeout(() => {
      setShowScheduleSuccess('');
    }, 3500);
  };

  // Analytics Calculations
  const totalRevenue = bookings.reduce((sum, b) => (b.status === 'confirmed' ? sum + b.totalAmount : sum), 0);
  const totalTicketsSold = bookings.reduce((sum, b) => (b.status === 'confirmed' ? sum + b.seats.length : sum), 0);
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');

  // Filtered showtimes
  const filteredShowtimes = showtimes.filter((s) => {
    if (scheduleFilterTheater !== 'all' && s.theaterId !== scheduleFilterTheater) return false;
    if (scheduleFilterMovie !== 'all' && s.movieId !== scheduleFilterMovie) return false;
    if (scheduleFilterDate !== 'all' && s.date !== scheduleFilterDate) return false;
    return true;
  });

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    if (!bookingSearch.trim()) return true;
    const q = bookingSearch.toLowerCase();
    return (
      b.bookingCode.toLowerCase().includes(q) ||
      b.movieTitle.toLowerCase().includes(q) ||
      b.customer.name.toLowerCase().includes(q) ||
      b.customer.email.toLowerCase().includes(q)
    );
  });

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className={isModal ? "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
      <div className={isModal ? "relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col" : "w-full bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"}>
        
        {/* Top Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-950/40">
              <Film className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Cinema Manager Dashboard
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Admin Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Executive control panel for movie catalog, multi-screen scheduling, ticket inspection & box office analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-white font-medium">{currentUser.name}</span>
                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded">
                  {currentUser.role}
                </span>
              </div>
            )}

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors"
                title="Close Dashboard"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {!isAdmin ? (
          /* ========================================================
             RBAC ACCESS RESTRICTED GATE (When not authenticated as Admin)
          ======================================================== */
          <div className="flex-1 p-6 sm:p-12 flex items-center justify-center">
            <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/40">
                <ShieldCheck className="w-8 h-8 text-rose-500" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Role-Based Access Control (RBAC)
                </span>
                <h2 className="text-xl font-black text-white mt-2">
                  Admin Authentication Required
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Access to the Cinema Manager Dashboard is restricted. Role-based access control requires an active Administrator session to view box office analytics, schedule auditoriums, or manage the movie catalog.
                </p>
              </div>

              {/* Current Session Indicator */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left">
                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Current Session Status</span>
                {currentUser ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-white block">{currentUser.name}</strong>
                      <span className="text-slate-400 text-[11px]">{currentUser.email}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {currentUser.role} (Restricted)
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No active session (Guest / Unauthenticated)</span>
                )}
              </div>

              {/* Error banner */}
              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Direct Admin Authentication Form */}
              <form onSubmit={handleDirectAdminLogin} className="space-y-3 pt-1 text-left">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    required
                    value={adminInputEmail}
                    onChange={(e) => setAdminInputEmail(e.target.value)}
                    placeholder="admin@cineverse.com"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAdminInputPassword('admin123')}
                      className="text-[10px] text-rose-400 hover:text-rose-300 underline"
                    >
                      Fill Demo Pass
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={adminInputPassword}
                    onChange={(e) => setAdminInputPassword(e.target.value)}
                    placeholder="Enter admin password (e.g. admin123)"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
                >
                  Verify & Unlock Dashboard
                </button>
              </form>

              {/* Quick One-Click Switch & Return options */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                {onSwitchToAdmin && (
                  <button
                    type="button"
                    onClick={onSwitchToAdmin}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-indigo-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Quick Switch to Admin Profile (admin@cineverse.com)</span>
                  </button>
                )}

                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="w-full py-1 text-[11px] text-slate-400 hover:text-white underline block"
                  >
                    Open Full Sign In Dialog
                  </button>
                )}

                {onExitAdmin && (
                  <button
                    type="button"
                    onClick={onExitAdmin}
                    className="w-full py-2 px-3 text-slate-400 hover:text-white text-xs transition-colors block"
                  >
                    ← Return to Movies Catalog
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             FULL ADMIN DASHBOARD (Only rendered when isAdmin === true)
          ======================================================== */
          <>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-800 bg-slate-950/70 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Overview & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('add-movie')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'add-movie'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Admin - Add Movie</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule-show')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'schedule-show'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Admin - Schedule Show</span>
          </button>

          <button
            onClick={() => setActiveTab('movie-catalog')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'movie-catalog'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Film className="w-4 h-4 text-rose-400" />
            <span>Movie Catalog ({movies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Ticket & Bookings Inspector ({bookings.length})</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ========================================================
              TAB 1: OVERVIEW & ANALYTICS
          ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span className="font-semibold uppercase tracking-wider">Gross Box Office</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-white">{formatCurrency(totalRevenue)}</div>
                  <div className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Real-time confirmed revenue</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span className="font-semibold uppercase tracking-wider">Tickets Issued</span>
                    <Users className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-3xl font-black text-white">{totalTicketsSold} <span className="text-base text-slate-400 font-normal">seats</span></div>
                  <div className="text-xs text-sky-400 mt-2 font-medium">
                    {confirmedBookings.length} completed customer orders
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span className="font-semibold uppercase tracking-wider">Active Screens</span>
                    <Tv className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-3xl font-black text-white">{theaters.length * 4} <span className="text-base text-slate-400 font-normal">auditoriums</span></div>
                  <div className="text-xs text-indigo-400 mt-2 font-medium">
                    {theaters.length} Multiplexes online
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span className="font-semibold uppercase tracking-wider">Movies in Catalog</span>
                    <Film className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-3xl font-black text-white">{movies.length} <span className="text-base text-slate-400 font-normal">titles</span></div>
                  <div className="text-xs text-rose-400 mt-2 font-medium">
                    {movies.filter((m) => m.status === 'now-showing').length} currently in theaters
                  </div>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Administrator Quick Actions</h3>
                  <p className="text-xs text-slate-400">Jump directly into scheduling auditoriums or publishing new releases</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('add-movie')}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Movie</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('schedule-show')}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Showtimes</span>
                  </button>
                </div>
              </div>

              {/* Recent Transactions List */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Recent Box Office Transactions</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                      {bookings.length}
                    </span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>View all orders</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {bookings.slice(0, 5).map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img src={b.moviePoster} alt="" className="w-9 h-12 rounded object-cover" />
                        <div>
                          <div className="font-bold text-white">{b.movieTitle}</div>
                          <div className="text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-indigo-400 font-semibold">{b.bookingCode}</span>
                            <span>•</span>
                            <span>{b.customer.name}</span>
                            <span>•</span>
                            <span>{b.seats.length} seats ({b.seats.join(', ')})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                        <div className="text-right">
                          <div className="font-black text-emerald-400 text-sm">{formatCurrency(b.totalAmount)}</div>
                          <div className="text-[10px] text-slate-500">{b.paymentMethod}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          b.status === 'confirmed' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Reset Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onResetData}
                  className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-2 border border-slate-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Catalog & Bookings to Defaults</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: ADMIN - ADD MOVIE PAGE (Explicitly requested)
          ======================================================== */}
          {activeTab === 'add-movie' && (
            <div className="space-y-6">
              {/* Feedback Alert */}
              {movieSuccessFeedback && (
                <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>{movieSuccessFeedback}</span>
                </div>
              )}

              {/* Header with Preset Templates for easy testing */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Cinema Title Creation Studio</span>
                  </div>
                  <h2 className="text-lg font-black text-white">Admin - Add Movie Page</h2>
                  <p className="text-xs text-slate-400">
                    Publish new releases to CineVerse with custom format screenings, trailer links, and cast profiles
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Load Template:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {PRESET_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-[11px] font-semibold border border-slate-700 transition-colors"
                      >
                        {tmpl.title.split(':')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Layout: Form on Left, Live Card Preview on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* FORM (2 cols) */}
                <form onSubmit={handleCreateMovie} className="lg:col-span-2 space-y-5 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  
                  {/* Title & Tagline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Movie Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Interstellar 2: Beyond Event Horizon"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={newTagline}
                        onChange={(e) => setNewTagline(e.target.value)}
                        placeholder="e.g. Beyond time. Beyond gravity."
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Synopsis */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Plot Synopsis / Story Overview
                    </label>
                    <textarea
                      rows={3}
                      value={newSynopsis}
                      onChange={(e) => setNewSynopsis(e.target.value)}
                      placeholder="Detailed movie summary for cinema audience..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  {/* Images: Poster & Backdrop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Poster Image URL
                      </label>
                      <input
                        type="url"
                        value={newPosterUrl}
                        onChange={(e) => setNewPosterUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Backdrop Banner URL
                      </label>
                      <input
                        type="url"
                        value={newBackdropUrl}
                        onChange={(e) => setNewBackdropUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Numerical & Specs: Duration, Rating, Year, Certification */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Duration (mins)
                      </label>
                      <input
                        type="number"
                        min="30"
                        max="360"
                        value={newDuration}
                        onChange={(e) => setNewDuration(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Rating (1-10)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="10"
                        value={newRating}
                        onChange={(e) => setNewRating(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Release Year
                      </label>
                      <input
                        type="number"
                        value={newReleaseYear}
                        onChange={(e) => setNewReleaseYear(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Certification
                      </label>
                      <select
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="PG">PG</option>
                        <option value="PG-13">PG-13</option>
                        <option value="R">R</option>
                        <option value="U/A 13+">U/A 13+</option>
                        <option value="U/A 16+">U/A 16+</option>
                        <option value="A">A (Adults Only)</option>
                      </select>
                    </div>
                  </div>

                  {/* Director & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Director Name
                      </label>
                      <input
                        type="text"
                        value={newDirector}
                        onChange={(e) => setNewDirector(e.target.value)}
                        placeholder="e.g. Denis Villeneuve"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Release Status
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewStatus('now-showing')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            newStatus === 'now-showing'
                              ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          Now Showing
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewStatus('upcoming')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            newStatus === 'upcoming'
                              ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          Upcoming Soon
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Genres Selection Chips */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Genres (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_GENRES.map((g) => {
                        const isSelected = newGenres.includes(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => toggleGenre(g)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Formats Selection Chips */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Screening Formats Supported
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_FORMATS.map((fmt) => {
                        const isSelected = newFormats.includes(fmt);
                        return (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => toggleFormat(fmt)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border transition-all ${
                              isSelected
                                ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {fmt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Trailer URL */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      YouTube Trailer Embed URL
                    </label>
                    <input
                      type="url"
                      value={newTrailerUrl}
                      onChange={(e) => setNewTrailerUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  {/* Cast Members Editor */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Cast & Characters
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newCastName}
                        onChange={(e) => setNewCastName(e.target.value)}
                        placeholder="Actor / Actress name"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        value={newCastRole}
                        onChange={(e) => setNewCastRole(e.target.value)}
                        placeholder="Character name"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCastMember}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {castList.map((c, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                        >
                          <img src={c.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                          <span className="font-semibold text-white">{c.name}</span>
                          <span className="text-slate-400">as {c.role}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCastMember(idx)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Featured checkbox */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="featCheck"
                      checked={newFeatured}
                      onChange={(e) => setNewFeatured(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 bg-slate-900 focus:ring-0"
                    />
                    <label htmlFor="featCheck" className="text-xs text-slate-300 select-none cursor-pointer">
                      Feature on Home Banner Carousel
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Movie to CineVerse Catalog</span>
                  </button>
                </form>

                {/* LIVE PREVIEW CARD (1 col) */}
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Live Cinema Card Preview</span>
                  </div>

                  <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
                    <div className="relative aspect-[2/3] w-full bg-slate-900">
                      <img
                        src={newPosterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80'}
                        alt="Poster preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 backdrop-blur text-white border border-slate-700">
                          {newCertification}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/90 text-slate-950 shadow">
                          ★ {newRating}
                        </span>
                      </div>

                      {/* Bottom Info */}
                      <div className="absolute bottom-3 left-3 right-3 space-y-1">
                        <div className="text-base font-black text-white leading-tight">
                          {newTitle || 'Movie Title Preview'}
                        </div>
                        <div className="text-[11px] text-slate-300 line-clamp-1 italic">
                          {newTagline || 'Tagline will appear here'}
                        </div>
                        <div className="text-[10px] text-indigo-400 font-semibold">
                          {newGenres.join(' • ')} • {newDuration}m
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">Status:</span>
                      <span className="font-bold text-white capitalize">{newStatus.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: ADMIN - SCHEDULE SHOW PAGE (Explicitly requested)
          ======================================================== */}
          {activeTab === 'schedule-show' && (
            <div className="space-y-6">
              {/* Feedback Alert */}
              {showScheduleSuccess && (
                <div className="p-4 rounded-2xl bg-sky-950/50 border border-sky-700 text-sky-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0" />
                  <span>{showScheduleSuccess}</span>
                </div>
              )}

              {/* Header */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-950 to-slate-950 border border-sky-900/40">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Auditorium Timetable & Slot Allocator</span>
                </div>
                <h2 className="text-lg font-black text-white">Admin - Schedule Show Page</h2>
                <p className="text-xs text-slate-400">
                  Assign movies to cinema auditoriums, configure showtimes, format projection technologies and tiered ticket pricing
                </p>
              </div>

              {/* Schedule Creation Card */}
              <form onSubmit={handleCreateShowtime} className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-sky-400" />
                  <span>Schedule a New Showtime Slot</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Select Theater */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      1. Select Multiplex / Theater *
                    </label>
                    <select
                      value={schedTheaterId}
                      onChange={(e) => setSchedTheaterId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                    >
                      {theaters.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Hall / Screen */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      2. Select Screen / Hall *
                    </label>
                    <select
                      value={schedHall}
                      onChange={(e) => setSchedHall(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                    >
                      <option value="Hall 1 - Grand IMAX Laser">Hall 1 - Grand IMAX Laser</option>
                      <option value="Hall 2 - Dolby Atmos Premier">Hall 2 - Dolby Atmos Premier</option>
                      <option value="Hall 3 - 4DX Dynamic Motion">Hall 3 - 4DX Dynamic Motion</option>
                      <option value="Hall 4 - Laser Digital 4K">Hall 4 - Laser Digital 4K</option>
                      <option value="VIP Suite 1 - Private Lounges">VIP Suite 1 - Private Lounges</option>
                    </select>
                  </div>

                  {/* Select Movie */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      3. Select Movie *
                    </label>
                    <select
                      value={schedMovieId}
                      onChange={(e) => setSchedMovieId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                    >
                      {movies.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title} ({m.certification})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Select Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      4. Date *
                    </label>
                    <select
                      value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                    >
                      {dateOptions.map((d) => (
                        <option key={d.dateStr} value={d.dateStr}>
                          {d.dayName}, {d.monthName} {d.dayNumber} ({d.dateStr})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Showtime */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      5. Showtime Slot *
                    </label>
                    <div className="flex gap-1.5 flex-wrap mb-1.5">
                      {['10:00 AM', '01:15 PM', '04:30 PM', '07:30 PM', '10:15 PM'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSchedTime(t)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                            schedTime === t
                              ? 'bg-sky-600 text-white border-sky-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                      placeholder="e.g. 08:45 PM"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  {/* Projection Format */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      6. Projection Format *
                    </label>
                    <select
                      value={schedFormat}
                      onChange={(e) => setSchedFormat(e.target.value as MovieFormat)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                    >
                      <option value="IMAX 3D">IMAX 3D</option>
                      <option value="Dolby Cinema">Dolby Cinema</option>
                      <option value="4DX">4DX Motion</option>
                      <option value="RealD 3D">RealD 3D</option>
                      <option value="Standard 2D">Standard 2D</option>
                    </select>
                  </div>
                </div>

                {/* Pricing Tiers & Simulation */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    7. Ticket Pricing Matrix & Seat Simulation
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[11px] text-amber-400 font-semibold block mb-1">VIP Recliner ($)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={priceVip}
                        onChange={(e) => setPriceVip(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-sky-400 font-semibold block mb-1">Prime Rows ($)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={pricePrime}
                        onChange={(e) => setPricePrime(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold block mb-1">Classic ($)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={priceClassic}
                        onChange={(e) => setPriceClassic(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold block mb-1">Pre-booked Seats</span>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={preBookedCount}
                        onChange={(e) => setPreBookedCount(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Publish Scheduled Showtime to Multiplex</span>
                </button>
              </form>

              {/* Scheduled Showtimes Explorer / Manager */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">Active Showtime Schedules ({filteredShowtimes.length})</h3>
                    <p className="text-xs text-slate-400">Manage or remove published shows across all multiplex auditoriums</p>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={scheduleFilterTheater}
                      onChange={(e) => setScheduleFilterTheater(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none"
                    >
                      <option value="all">All Theaters</option>
                      {theaters.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>

                    <select
                      value={scheduleFilterMovie}
                      onChange={(e) => setScheduleFilterMovie(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none"
                    >
                      <option value="all">All Movies</option>
                      {movies.map((m) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredShowtimes.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="text-xs text-slate-400 font-semibold">No scheduled shows match the selected filters.</div>
                    <button
                      onClick={() => {
                        setScheduleFilterTheater('all');
                        setScheduleFilterMovie('all');
                        setScheduleFilterDate('all');
                      }}
                      className="text-xs text-sky-400 hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredShowtimes.map((s) => {
                      const m = movies.find((mov) => mov.id === s.movieId);
                      const t = theaters.find((th) => th.id === s.theaterId);
                      return (
                        <div
                          key={s.id}
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-3">
                            {m && (
                              <img src={m.posterUrl} alt="" className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
                            )}
                            <div className="space-y-1">
                              <div className="font-bold text-white text-sm line-clamp-1">{m?.title || 'Unknown Movie'}</div>
                              <div className="text-slate-400 font-medium flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-sky-400" />
                                <span className="text-white font-bold">{s.time}</span>
                                <span>•</span>
                                <span>{s.date}</span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {t?.name} ({s.hallName})
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800/60 uppercase">
                                  {s.format}
                                </span>
                                <span className="text-[11px] text-amber-400 font-semibold">
                                  VIP: ${s.prices.vip}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  Classic: ${s.prices.classic}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (confirm('Cancel this scheduled showtime?')) {
                                onDeleteShowtime(s.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                            title="Cancel showtime"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: MOVIE CATALOG MANAGEMENT
          ======================================================== */}
          {activeTab === 'movie-catalog' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Full Cinema Movie Catalog ({movies.length})</h3>
                  <p className="text-xs text-slate-400">Manage currently running and upcoming movies in CineVerse</p>
                </div>
                <button
                  onClick={() => setActiveTab('add-movie')}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Movie</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {movies.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={m.posterUrl} alt={m.title} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">{m.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {m.genres.join(', ')} • {m.durationMinutes} mins • {m.certification}
                        </div>
                        <div className="text-[11px] text-sky-400 mt-0.5 font-medium">
                          {m.formats.join(' | ')}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 capitalize flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'now-showing' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                          <span>{m.status.replace('-', ' ')}</span>
                          {m.featured && <span className="text-rose-400 font-bold">• Featured</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Remove "${m.title}" from cinema catalog?`)) {
                          onDeleteMovie(m.id);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors flex-shrink-0"
                      title="Delete movie"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: BOOKINGS & TICKET QR INSPECTOR
          ======================================================== */}
          {activeTab === 'bookings' && (
            <div className="space-y-5">
              {/* Ticket Verifier Box */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Boarding Ticket QR & Code Validator</h3>
                  </div>
                  <span className="text-xs text-slate-400">At-gate usher verification</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Enter Booking Code (e.g. CV-83921-DU) or customer name..."
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                  />
                  {bookingSearch && (
                    <button
                      onClick={() => setBookingSearch('')}
                      className="px-3 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs border border-slate-800"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {verifiedBookingCode && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
                    <span>Ticket <strong>{verifiedBookingCode}</strong> checked-in and verified successfully!</span>
                    <button
                      onClick={() => setVerifiedBookingCode(null)}
                      className="text-emerald-400 underline font-bold"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>

              {/* Transactions Table / Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Transactions ({filteredBookings.length})
                </h4>

                {filteredBookings.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                    No bookings found matching query.
                  </div>
                ) : (
                  filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <img src={b.moviePoster} alt="" className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-400 text-sm">{b.bookingCode}</span>
                            <span className="font-black text-white">{b.movieTitle}</span>
                          </div>
                          <div className="text-slate-400 mt-1">
                            {b.theaterName} • {b.hallName} ({b.format})
                          </div>
                          <div className="text-slate-400 mt-0.5">
                            Showtime: <strong className="text-slate-300">{b.showDate} at {b.showTime}</strong> • Seats: <strong className="text-slate-200">{b.seats.join(', ')}</strong>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Audience: {b.customer.name} ({b.customer.email})
                          </div>
                        </div>
                      </div>

                      <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                        <div className="text-right">
                          <div className="text-base font-black text-emerald-400">{formatCurrency(b.totalAmount)}</div>
                          <div className="text-[10px] text-slate-500 uppercase">{b.paymentStatus} • {b.status}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setVerifiedBookingCode(b.bookingCode);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-bold transition-all"
                          >
                            Verify & Admit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </>
    )}

      </div>
    </div>
  );
};
