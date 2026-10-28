export type MovieFormat = 'IMAX 3D' | '4DX' | 'Dolby Cinema' | 'RealD 3D' | 'Standard 2D';

export type MovieGenre = 
  | 'Action' 
  | 'Sci-Fi' 
  | 'Adventure' 
  | 'Drama' 
  | 'Thriller' 
  | 'Animation' 
  | 'Comedy' 
  | 'Horror' 
  | 'Fantasy' 
  | 'Crime';

export interface CastMember {
  name: string;
  role: string;
  avatar: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'customer';
  avatar?: string;
  createdAt: string;
}

export interface MovieReview {
  id: string;
  movieId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
}

export interface Movie {
  id: string;
  title: string;
  tagline: string;
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  rating: number;
  voteCount: number;
  durationMinutes: number;
  releaseYear: number;
  genres: MovieGenre[];
  certification: 'PG' | 'PG-13' | 'R' | 'U/A 13+' | 'U/A 16+' | 'A';
  languages: string[];
  formats: MovieFormat[];
  director: string;
  cast: CastMember[];
  trailerUrl: string; // YouTube embed id or mp4
  featured?: boolean;
  status: 'now-showing' | 'upcoming';
  releaseDateText: string;
}

export interface Theater {
  id: string;
  name: string;
  city: string;
  location: string;
  address: string;
  distance: string;
  formatsSupported: MovieFormat[];
  amenities: string[];
}

export type SeatTier = 'vip' | 'prime' | 'classic';

export interface SeatInfo {
  id: string; // e.g. "A-1"
  row: string; // e.g. "A"
  col: number; // e.g. 1
  tier: SeatTier;
  price: number;
  isWheelchair?: boolean;
}

export interface Showtime {
  id: string;
  movieId: string;
  theaterId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  format: MovieFormat;
  hallName: string;
  prices: {
    vip: number;
    prime: number;
    classic: number;
  };
  bookedSeats: string[]; // seat ids e.g. ["A-5", "B-6"]
}

export interface ConcessionItem {
  id: string;
  name: string;
  category: 'Combos' | 'Popcorn' | 'Snacks' | 'Beverages' | 'Desserts';
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  tag?: string;
  calories?: string;
}

export interface SelectedConcession {
  item: ConcessionItem;
  quantity: number;
}

export interface Booking {
  id: string;
  bookingCode: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  movieBackdrop: string;
  theaterId: string;
  theaterName: string;
  theaterAddress: string;
  hallName: string;
  format: MovieFormat;
  showDate: string;
  showTime: string;
  seats: string[];
  seatDetails: {
    id: string;
    tier: SeatTier;
    price: number;
  }[];
  concessions: SelectedConcession[];
  ticketSubtotal: number;
  concessionsSubtotal: number;
  convenienceFee: number;
  discount: number;
  promoCodeApplied?: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'refunded';
  bookedAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'confirmed' | 'cancelled';
  qrValue: string;
}
