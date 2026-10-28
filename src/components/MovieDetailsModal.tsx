import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Clock, 
  Calendar, 
  Play, 
  Ticket, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Sparkles,
  Send
} from 'lucide-react';
import { Movie, MovieReview } from '../types';

interface MovieDetailsModalProps {
  movie: Movie | null;
  onClose: () => void;
  onBookMovie: (movie: Movie) => void;
  onWatchTrailer: (movie: Movie) => void;
  reviews: MovieReview[];
  onAddReview: (review: Omit<MovieReview, 'id' | 'date' | 'likes'>) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  onBookMovie,
  onWatchTrailer,
  reviews,
  onAddReview,
}) => {
  if (!movie) return null;

  const movieReviews = reviews.filter((r) => r.movieId === movie.id);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(9);
  const [authorName, setAuthorName] = useState('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    onAddReview({
      movieId: movie.id,
      userName: authorName,
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      rating: newRating,
      comment: newComment,
    });

    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white flex items-center justify-center border border-slate-700 transition-colors shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* Backdrop Header */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
            <img
              src={movie.backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent" />

            {/* Play trailer floating icon */}
            <button
              onClick={() => onWatchTrailer(movie)}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 px-5 py-3 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-sm shadow-2xl backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Trailer</span>
            </button>

            {/* Title & Basic Meta */}
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500 text-slate-950">
                  {movie.certification}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800/80 text-sky-400 border border-sky-500/30">
                  {movie.releaseYear}
                </span>
                <span className="text-xs text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {movie.title}
              </h2>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Quick stats and genres */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Star className="w-6 h-6 fill-amber-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white flex items-center gap-1.5">
                    {movie.rating.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 10</span>
                  </div>
                  <div className="text-xs text-slate-400">{(movie.voteCount).toLocaleString()} verified ratings</div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {movie.genres.map((g) => (
                  <span key={g} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                    {g}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                {movie.formats.map((fmt) => (
                  <span key={fmt} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950/60 text-rose-300 border border-rose-800/50">
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" /> Storyline
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {movie.synopsis}
              </p>
              <div className="mt-3 text-xs text-slate-400 flex flex-wrap gap-4">
                <div><span className="text-slate-500">Director:</span> <span className="text-white font-medium">{movie.director}</span></div>
                <div><span className="text-slate-500">Languages:</span> <span className="text-white font-medium">{movie.languages.join(', ')}</span></div>
                <div><span className="text-slate-500">Status:</span> <span className="text-emerald-400 font-medium">{movie.releaseDateText}</span></div>
              </div>
            </div>

            {/* Cast & Crew */}
            <div>
              <h3 className="text-base font-bold text-white mb-4">Cast & Characters</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {movie.cast.map((actor) => (
                  <div key={actor.name} className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                    <img
                      src={actor.avatar}
                      alt={actor.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{actor.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{actor.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  Audience Reviews ({movieReviews.length})
                </h3>
              </div>

              {/* Review Input */}
              <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 mb-6 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Leave a Review</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your Name (e.g. John Doe)"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                    className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 outline-none focus:border-rose-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Rating:</span>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 text-xs text-amber-400 font-bold rounded-lg px-3 py-2 outline-none"
                    >
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>★ {n}/10</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    rows={2}
                    placeholder="Write your honest movie thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-3 outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 bottom-3 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-md flex items-center gap-1 shadow"
                  >
                    <Send className="w-3 h-3" /> Post
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {movieReviews.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No reviews yet for this movie. Be the first to share your thoughts!</p>
                ) : (
                  movieReviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={rev.userAvatar} alt={rev.userName} className="w-7 h-7 rounded-full object-cover" />
                          <span className="text-xs font-bold text-white">{rev.userName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{rev.rating}/10</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{rev.date}</span>
                        <div className="flex items-center gap-1 text-slate-400 hover:text-rose-400 cursor-pointer">
                          <ThumbsUp className="w-3 h-3" /> {rev.likes} helpful
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Fixed Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400">Standard & Premium formats available</div>
            <div className="text-sm font-bold text-white">Tickets starting from $14.00</div>
          </div>
          <button
            onClick={() => {
              onClose();
              onBookMovie(movie);
            }}
            className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-900/40 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            <span>Select Showtime & Seats</span>
          </button>
        </div>

      </div>
    </div>
  );
};
