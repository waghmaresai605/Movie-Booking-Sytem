import React, { useState } from 'react';
import { Star, Clock, Ticket, Play, Sparkles, Filter, Info } from 'lucide-react';
import { Movie, MovieFormat, MovieGenre } from '../types';

interface MovieListProps {
  movies: Movie[];
  onBookMovie: (movie: Movie) => void;
  onWatchTrailer: (movie: Movie) => void;
  onViewDetails: (movie: Movie) => void;
}

export const MovieList: React.FC<MovieListProps> = ({
  movies,
  onBookMovie,
  onWatchTrailer,
  onViewDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'now-showing' | 'upcoming' | 'imax'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');

  const genres: string[] = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Thriller', 'Animation', 'Fantasy'];
  const formats: string[] = ['All', 'IMAX 3D', '4DX', 'Dolby Cinema', 'Standard 2D'];

  const filteredMovies = movies.filter((movie) => {
    // Tab filter
    if (activeTab === 'now-showing' && movie.status !== 'now-showing') return false;
    if (activeTab === 'upcoming' && movie.status !== 'upcoming') return false;
    if (activeTab === 'imax' && !movie.formats.includes('IMAX 3D')) return false;

    // Genre filter
    if (selectedGenre !== 'All' && !movie.genres.includes(selectedGenre as MovieGenre)) return false;

    // Format filter
    if (selectedFormat !== 'All' && !movie.formats.includes(selectedFormat as MovieFormat)) return false;

    return true;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Blockbusters</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Explore Movies in Theaters
          </h2>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Movies
          </button>
          <button
            onClick={() => setActiveTab('now-showing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'now-showing'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => setActiveTab('imax')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'imax'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            IMAX & 4DX
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'upcoming'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Genre & Format Filter Chips */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 overflow-x-auto">
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-1">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1 pl-1">
            <Filter className="w-3.5 h-3.5" /> Genres:
          </span>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedGenre === genre
                  ? 'bg-slate-200 text-slate-900 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs font-medium text-slate-400">Format:</span>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-rose-500"
          >
            {formats.map((fmt) => (
              <option key={fmt} value={fmt}>
                {fmt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <p className="text-slate-400 text-lg">No movies found matching the selected filters.</p>
          <button
            onClick={() => {
              setSelectedGenre('All');
              setSelectedFormat('All');
              setActiveTab('all');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="group flex flex-col bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/20"
            >
              {/* Poster Container */}
              <div className="relative aspect-[2/3] overflow-hidden bg-slate-950">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Rating Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-amber-400 text-xs font-bold shadow-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{movie.rating.toFixed(1)}</span>
                </div>

                {/* Certification */}
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-bold text-slate-300 border border-slate-700/60">
                  {movie.certification}
                </div>

                {/* Hover Quick Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-2">
                  <button
                    onClick={() => onBookMovie(movie)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{movie.status === 'upcoming' ? 'Pre-Book' : 'Book Tickets'}</span>
                  </button>
                  <button
                    onClick={() => onWatchTrailer(movie)}
                    className="w-full py-2 bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>Trailer</span>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mb-1">
                    <span className="truncate">{movie.genres.slice(0, 2).join(' • ')}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
                    </span>
                  </div>

                  <h3 
                    onClick={() => onViewDetails(movie)}
                    className="font-bold text-white text-base leading-snug line-clamp-1 group-hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    {movie.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {movie.synopsis}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-wrap">
                    {movie.formats.slice(0, 2).map((fmt) => (
                      <span
                        key={fmt}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-sky-400"
                      >
                        {fmt}
                      </span>
                    ))}
                    {movie.formats.length > 2 && (
                      <span className="text-[10px] text-slate-500">+{movie.formats.length - 2}</span>
                    )}
                  </div>

                  <button
                    onClick={() => onViewDetails(movie)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Info</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
