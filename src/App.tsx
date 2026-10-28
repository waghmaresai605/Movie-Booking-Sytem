import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MovieList } from './components/MovieList';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { BookingFlowModal } from './components/BookingFlowModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { TrailerModal } from './components/TrailerModal';
import { AdminDashboard } from './components/AdminDashboard';
import { DriveProjectModal } from './components/DriveProjectModal';
import { TheatersView } from './components/TheatersView';
import { ConcessionsView } from './components/ConcessionsView';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';

import { 
  INITIAL_MOVIES, 
  INITIAL_THEATERS, 
  INITIAL_CONCESSIONS, 
  INITIAL_CITIES, 
  INITIAL_REVIEWS,
  INITIAL_USERS 
} from './data/mockData';
import { Movie, Theater, ConcessionItem, Booking, MovieReview, Showtime, User } from './types';
import { getNextDates } from './utils/bookingUtils';

export default function App() {
  // Cities
  const [cities] = useState<string[]>(INITIAL_CITIES);
  const [currentCity, setCurrentCity] = useState<string>(() => {
    return localStorage.getItem('cineverse_city') || 'New York';
  });

  // Navigation tab: movies | theaters | concessions | admin
  const [activeTab, setActiveTab] = useState<'movies' | 'theaters' | 'concessions' | 'admin'>('movies');

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Movies Catalog
  const [movies, setMovies] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem('cineverse_movies');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_MOVIES;
  });

  // Theaters & Concessions
  const [theaters] = useState<Theater[]>(INITIAL_THEATERS);
  const [concessions] = useState<ConcessionItem[]>(INITIAL_CONCESSIONS);

  // Authentication & Users
  const [users, setUsers] = useState<(User & { passwordHash?: string })[]>(() => {
    try {
      const saved = localStorage.getItem('cineverse_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cineverse_active_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Custom Showtimes Scheduled by Admin
  const [showtimes, setShowtimes] = useState<Showtime[]>(() => {
    try {
      const saved = localStorage.getItem('cineverse_showtimes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    // Initial pre-seeded showtimes
    const dates = getNextDates(4);
    const initialSlots: Showtime[] = [];
    INITIAL_MOVIES.slice(0, 4).forEach((m, mIdx) => {
      INITIAL_THEATERS.slice(0, 2).forEach((th, tIdx) => {
        dates.slice(0, 3).forEach((d, dIdx) => {
          initialSlots.push({
            id: `seed-show-${m.id}-${th.id}-${d.dateStr}-${dIdx}`,
            movieId: m.id,
            theaterId: th.id,
            date: d.dateStr,
            time: dIdx === 0 ? '07:45 PM' : dIdx === 1 ? '04:30 PM' : '01:15 PM',
            format: m.formats[0] || 'IMAX 3D',
            hallName: 'Hall 1 - Grand IMAX Laser',
            prices: { vip: 24.0, prime: 18.5, classic: 14.0 },
            bookedSeats: ['B-7', 'B-8', 'C-8', 'C-9'],
          });
        });
      });
    });
    return initialSlots;
  });

  // Reviews
  const [reviews, setReviews] = useState<MovieReview[]>(() => {
    try {
      const saved = localStorage.getItem('cineverse_reviews');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_REVIEWS;
  });

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('cineverse_bookings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }

    const demoBooking: Booking = {
      id: 'demo-bk-1',
      bookingCode: 'CV-83921-DU',
      movieId: 'movie-1',
      movieTitle: 'Dune: Part Three - Messiah',
      moviePoster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
      movieBackdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
      theaterId: 'th-1',
      theaterName: 'CineVerse Grand IMAX Laser & 4DX',
      theaterAddress: '234 W 42nd St, New York, NY 10036',
      hallName: 'Hall 1 - Grand IMAX Laser',
      format: 'IMAX 3D',
      showDate: 'Tonight',
      showTime: '07:45 PM',
      seats: ['B-7', 'B-8'],
      seatDetails: [
        { id: 'B-7', tier: 'vip', price: 24.0 },
        { id: 'B-8', tier: 'vip', price: 24.0 },
      ],
      concessions: [
        {
          item: INITIAL_CONCESSIONS[0],
          quantity: 1,
        },
      ],
      ticketSubtotal: 48.0,
      concessionsSubtotal: 9.50,
      convenienceFee: 5.0,
      discount: 2.50,
      promoCodeApplied: 'MOVIE50',
      totalAmount: 60.0,
      paymentMethod: 'Credit Card (**** 4821)',
      paymentStatus: 'paid',
      bookedAt: new Date().toISOString(),
      customer: {
        name: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        phone: '+1 (555) 234-5678',
      },
      status: 'confirmed',
      qrValue: 'CINEVERSE-TICKET:CV-83921-DU|MOVIE:Dune Part Three|SEATS:B-7,B-8|TIME:Today 07:45 PM',
    };

    return [demoBooking];
  });

  // Modal states
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState<Movie | null>(null);
  const [selectedMovieForBooking, setSelectedMovieForBooking] = useState<Movie | null>(null);
  const [initialShowtimeForBooking, setInitialShowtimeForBooking] = useState<Showtime | null>(null);
  const [selectedMovieForTrailer, setSelectedMovieForTrailer] = useState<Movie | null>(null);
  
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('cineverse_city', currentCity);
  }, [currentCity]);

  useEffect(() => {
    localStorage.setItem('cineverse_movies', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('cineverse_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('cineverse_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('cineverse_showtimes', JSON.stringify(showtimes));
  }, [showtimes]);

  useEffect(() => {
    localStorage.setItem('cineverse_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cineverse_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cineverse_active_user');
    }
  }, [currentUser]);

  // Auth Handlers
  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleRegisterUser = (newUser: User & { passwordHash?: string }) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const handleSwitchToAdmin = () => {
    const adminUser = users.find((u) => u.role === 'admin') || INITIAL_USERS[0];
    setCurrentUser(adminUser);
    setActiveTab('admin');
  };

  // Movie & Showtime Handlers
  const handleSelectCity = (city: string) => {
    setCurrentCity(city);
  };

  const handleBookMovie = (movie: Movie, initialShow?: Showtime) => {
    setSelectedMovieForBooking(movie);
    setInitialShowtimeForBooking(initialShow || null);
  };

  const handleWatchTrailer = (movie: Movie) => {
    setSelectedMovieForTrailer(movie);
  };

  const handleViewDetails = (movie: Movie) => {
    setSelectedMovieForDetails(movie);
  };

  const handleBookingComplete = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const, paymentStatus: 'refunded' as const } : b))
    );
  };

  const handleAddReview = (newRevData: Omit<MovieReview, 'id' | 'date' | 'likes'>) => {
    const newRev: MovieReview = {
      ...newRevData,
      id: `rev-${Date.now()}`,
      date: 'Just now',
      likes: 1,
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  const handleAddMovie = (newMovie: Movie) => {
    setMovies((prev) => [newMovie, ...prev]);
  };

  const handleDeleteMovie = (id: string) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddShowtime = (newShow: Showtime) => {
    setShowtimes((prev) => [newShow, ...prev]);
  };

  const handleDeleteShowtime = (id: string) => {
    setShowtimes((prev) => prev.filter((s) => s.id !== id));
  };

  const handleResetData = () => {
    setMovies(INITIAL_MOVIES);
    setReviews(INITIAL_REVIEWS);
    localStorage.removeItem('cineverse_movies');
    localStorage.removeItem('cineverse_reviews');
    localStorage.removeItem('cineverse_showtimes');
    alert('System catalog & showtimes reset to default initial state!');
  };

  const handleImportCustomMovies = (customList: Movie[]) => {
    setMovies(customList);
    localStorage.setItem('cineverse_movies', JSON.stringify(customList));
  };

  // Search filtered movies
  const searchedMovies = searchQuery.trim()
    ? movies.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
          m.cast.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          m.director.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : movies;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentCity={currentCity}
        onSelectCity={handleSelectCity}
        cities={cities}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        bookingCount={bookings.filter((b) => b.status === 'confirmed').length}
        onOpenAdmin={() => setActiveTab('admin')}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        allMovies={movies}
        onSelectMovie={handleViewDetails}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {/* TAB 1: MOVIES CATALOG */}
        {activeTab === 'movies' && (
          <>
            {/* Hero Carousel */}
            {!searchQuery && (
              <HeroBanner
                movies={movies}
                onBookMovie={handleBookMovie}
                onWatchTrailer={handleWatchTrailer}
                onViewDetails={handleViewDetails}
              />
            )}

            {/* Movies Catalog Grid */}
            <MovieList
              movies={searchedMovies}
              onBookMovie={handleBookMovie}
              onWatchTrailer={handleWatchTrailer}
              onViewDetails={handleViewDetails}
            />
          </>
        )}

        {/* TAB 2: THEATERS VIEW */}
        {activeTab === 'theaters' && (
          <TheatersView
            theaters={theaters}
            currentCity={currentCity}
            movies={movies}
            onBookMovieAtTheater={(movie) => {
              handleBookMovie(movie);
            }}
          />
        )}

        {/* TAB 3: CONCESSIONS VIEW */}
        {activeTab === 'concessions' && (
          <ConcessionsView
            concessions={concessions}
            onStartBookingWithSnacks={() => {
              handleBookMovie(movies[0]);
            }}
          />
        )}

        {/* TAB 4: DEDICATED ADMIN DASHBOARD (Includes Add Movie & Schedule Show Pages) */}
        {activeTab === 'admin' && (
          <AdminDashboard
            movies={movies}
            theaters={theaters}
            bookings={bookings}
            showtimes={showtimes}
            currentUser={currentUser}
            onAddMovie={handleAddMovie}
            onDeleteMovie={handleDeleteMovie}
            onAddShowtime={handleAddShowtime}
            onDeleteShowtime={handleDeleteShowtime}
            onResetData={handleResetData}
            onSwitchToAdmin={handleSwitchToAdmin}
            onOpenAuth={handleOpenAuth}
            onLoginSuccess={handleLoginSuccess}
            existingUsers={users}
            onExitAdmin={() => setActiveTab('movies')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
      />

      {/* ================= MODALS ================= */}

      {/* Registration & Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onLoginSuccess={handleLoginSuccess}
        existingUsers={users}
        onRegisterUser={handleRegisterUser}
      />

      {/* Movie Details Modal */}
      {selectedMovieForDetails && (
        <MovieDetailsModal
          movie={selectedMovieForDetails}
          onClose={() => setSelectedMovieForDetails(null)}
          onBookMovie={(movie) => {
            setSelectedMovieForDetails(null);
            handleBookMovie(movie);
          }}
          onWatchTrailer={handleWatchTrailer}
          reviews={reviews}
          onAddReview={handleAddReview}
        />
      )}

      {/* Complete Booking Flow Modal */}
      {selectedMovieForBooking && (
        <BookingFlowModal
          movie={selectedMovieForBooking}
          theaters={theaters.filter((t) => t.city.toLowerCase() === currentCity.toLowerCase()).length > 0
            ? theaters.filter((t) => t.city.toLowerCase() === currentCity.toLowerCase())
            : theaters
          }
          concessionsList={concessions}
          initialShowtime={initialShowtimeForBooking}
          currentUser={currentUser}
          customShowtimes={showtimes}
          onClose={() => {
            setSelectedMovieForBooking(null);
            setInitialShowtimeForBooking(null);
          }}
          onBookingComplete={handleBookingComplete}
        />
      )}

      {/* My Bookings / Tickets Wallet Modal */}
      {isMyBookingsOpen && (
        <MyBookingsModal
          bookings={bookings}
          onClose={() => setIsMyBookingsOpen(false)}
          onCancelBooking={handleCancelBooking}
          onExploreMovies={() => {
            setIsMyBookingsOpen(false);
            setActiveTab('movies');
          }}
        />
      )}

      {/* Trailer Video Modal */}
      {selectedMovieForTrailer && (
        <TrailerModal
          movie={selectedMovieForTrailer}
          onClose={() => setSelectedMovieForTrailer(null)}
          onBookMovie={(movie) => {
            setSelectedMovieForTrailer(null);
            handleBookMovie(movie);
          }}
        />
      )}

      {/* Admin Modal Overlay (if launched directly via modal trigger) */}
      {isAdminModalOpen && (
        <AdminDashboard
          isModal
          movies={movies}
          theaters={theaters}
          bookings={bookings}
          showtimes={showtimes}
          currentUser={currentUser}
          onAddMovie={handleAddMovie}
          onDeleteMovie={handleDeleteMovie}
          onAddShowtime={handleAddShowtime}
          onDeleteShowtime={handleDeleteShowtime}
          onResetData={handleResetData}
          onClose={() => setIsAdminModalOpen(false)}
          onSwitchToAdmin={handleSwitchToAdmin}
          onOpenAuth={handleOpenAuth}
          onLoginSuccess={handleLoginSuccess}
          existingUsers={users}
          onExitAdmin={() => setIsAdminModalOpen(false)}
        />
      )}

      {/* Drive Project Connection & JSON Sync Modal */}
      {isDriveModalOpen && (
        <DriveProjectModal
          onClose={() => setIsDriveModalOpen(false)}
          movies={movies}
          theaters={theaters}
          onImportCustomMovies={handleImportCustomMovies}
        />
      )}
    </div>
  );
}
