import React, { useState, useEffect } from 'react';
import { Play, Ticket, Star, Clock, Calendar, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types';

interface HeroBannerProps {
  movies: Movie[];
  onBookMovie: (movie: Movie) => void;
  onWatchTrailer: (movie: Movie) => void;
  onViewDetails: (movie: Movie) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movies,
  onBookMovie,
  onWatchTrailer,
  onViewDetails,
}) => {
  const featuredMovies = movies.filter((m) => m.featured || m.rating >= 9.0).slice(0, 4);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate every 7 seconds
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [featuredMovies.length]);

  if (featuredMovies.length === 0) return null;

  const currentMovie = featuredMovies[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  return (
    <div className="relative w-full h-[520px] md:h-[600px] overflow-hidden bg-slate-950 select-none group">
      {/* Background Image with Cinematic Gradients */}
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
        <img
          key={currentMovie.id}
          src={currentMovie.backdropUrl}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/30 to-slate-950/90" />
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl space-y-4">
          
          {/* Tagline & Badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600/90 text-white shadow-lg shadow-rose-900/40">
              <Sparkles className="w-3.5 h-3.5" /> Spotlight Premiere
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-800/80 text-amber-400 border border-amber-500/30">
              {currentMovie.certification}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{Math.floor(currentMovie.durationMinutes / 60)}h {currentMovie.durationMinutes % 60}m</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] text-balance">
            {currentMovie.title}
          </h1>

          {/* Tagline */}
          <p className="text-sm sm:text-base font-medium text-rose-300/90 italic">
            &ldquo;{currentMovie.tagline}&rdquo;
          </p>

          {/* Synopsis */}
          <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-xl">
            {currentMovie.synopsis}
          </p>

          {/* Meta & Formats */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/60 px-3 py-1.5 rounded-lg text-amber-400 text-sm font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{currentMovie.rating.toFixed(1)}</span>
              <span className="text-slate-400 text-xs font-normal">({(currentMovie.voteCount / 1000).toFixed(1)}k)</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {currentMovie.formats.map((fmt) => (
                <span
                  key={fmt}
                  className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-slate-900/90 text-sky-400 border border-sky-500/30"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3.5 pt-3">
            <button
              onClick={() => onBookMovie(currentMovie)}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-xl shadow-rose-900/50 hover:shadow-rose-900/70 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Tickets</span>
            </button>

            <button
              onClick={() => onWatchTrailer(currentMovie)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700/80 hover:border-slate-500 transition-all cursor-pointer backdrop-blur-sm"
            >
              <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Trailer</span>
            </button>

            <button
              onClick={() => onViewDetails(currentMovie)}
              className="text-xs font-medium text-slate-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer ml-1"
            >
              Cast & Details
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 backdrop-blur-sm"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 backdrop-blur-sm"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Carousel Dots */}
      <div className="absolute bottom-6 right-6 md:right-12 flex items-center gap-2 z-20">
        {featuredMovies.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-rose-500' : 'w-2 bg-slate-600/70 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
