import React from 'react';
import { MapPin, Sparkles, Navigation, Ticket, Star, Phone } from 'lucide-react';
import { Theater, Movie } from '../types';

interface TheatersViewProps {
  theaters: Theater[];
  currentCity: string;
  movies: Movie[];
  onBookMovieAtTheater: (movie: Movie, theater: Theater) => void;
}

export const TheatersView: React.FC<TheatersViewProps> = ({
  theaters,
  currentCity,
  movies,
  onBookMovieAtTheater,
}) => {
  const filteredTheaters = theaters.filter(
    (t) => t.city.toLowerCase() === currentCity.toLowerCase()
  );

  const displayTheaters = filteredTheaters.length > 0 ? filteredTheaters : theaters;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-rose-500 font-semibold text-xs tracking-wider uppercase">
          <Navigation className="w-3.5 h-3.5" />
          <span>Cinemas & Multiplexes</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Theaters in {currentCity}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          State-of-the-art IMAX GT laser, 4DX motion seats, and Dolby Atmos auditoriums.
        </p>
      </div>

      <div className="space-y-6">
        {displayTheaters.map((theater) => (
          <div
            key={theater.id}
            className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-5"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white">{theater.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {theater.distance}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {theater.address} ({theater.location})
                </p>
              </div>

              {/* Formats Supported */}
              <div className="flex items-center gap-2 flex-wrap">
                {theater.formatsSupported.map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-slate-950 text-sky-400 border border-sky-500/30"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            {/* Amenities tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-medium text-slate-400">Amenities:</span>
              {theater.amenities.map((am) => (
                <span
                  key={am}
                  className="px-2.5 py-0.5 rounded-md text-[11px] bg-slate-950 text-slate-300 border border-slate-800"
                >
                  {am}
                </span>
              ))}
            </div>

            {/* Available Movies at this theater */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Now Showing at this Cinema:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {movies.slice(0, 4).map((movie) => (
                  <div
                    key={movie.id}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={movie.posterUrl} alt={movie.title} className="w-9 h-12 object-cover rounded" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{movie.title}</div>
                        <div className="text-[10px] text-amber-400 font-semibold">★ {movie.rating}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onBookMovieAtTheater(movie, theater)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex-shrink-0 cursor-pointer shadow"
                    >
                      Times
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
};
