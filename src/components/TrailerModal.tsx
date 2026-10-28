import React from 'react';
import { X, Ticket } from 'lucide-react';
import { Movie } from '../types';

interface TrailerModalProps {
  movie: Movie | null;
  onClose: () => void;
  onBookMovie: (movie: Movie) => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  movie,
  onClose,
  onBookMovie,
}) => {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Official Trailer</span>
            <h3 className="text-base font-bold text-white truncate max-w-md">{movie.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`${movie.trailerUrl}?autoplay=1&rel=0`}
            title={`${movie.title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* Bottom bar with Book button */}
        <div className="p-4 bg-slate-950 flex items-center justify-between">
          <p className="text-xs text-slate-400 line-clamp-1 max-w-md">
            &ldquo;{movie.tagline}&rdquo;
          </p>
          <button
            onClick={() => {
              onClose();
              onBookMovie(movie);
            }}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-900/40 cursor-pointer"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Book Tickets</span>
          </button>
        </div>
      </div>
    </div>
  );
};
