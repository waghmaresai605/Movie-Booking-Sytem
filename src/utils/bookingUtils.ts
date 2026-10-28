import { SeatInfo, Showtime, Movie, Theater, MovieFormat } from '../types';

export const ROWS_CONFIG = [
  { row: 'A', tier: 'vip' as const, price: 24.0 },
  { row: 'B', tier: 'vip' as const, price: 24.0 },
  { row: 'C', tier: 'prime' as const, price: 18.5 },
  { row: 'D', tier: 'prime' as const, price: 18.5 },
  { row: 'E', tier: 'prime' as const, price: 18.5 },
  { row: 'F', tier: 'prime' as const, price: 18.5 },
  { row: 'G', tier: 'classic' as const, price: 14.0 },
  { row: 'H', tier: 'classic' as const, price: 14.0 },
  { row: 'I', tier: 'classic' as const, price: 14.0 },
  { row: 'J', tier: 'classic' as const, price: 14.0 },
];

export const TOTAL_COLS = 16;

export function generateSeatsLayout(): SeatInfo[] {
  const seats: SeatInfo[] = [];

  ROWS_CONFIG.forEach(({ row, tier, price }) => {
    for (let col = 1; col <= TOTAL_COLS; col++) {
      const isWheelchair = row === 'J' && (col === 1 || col === 2 || col === 15 || col === 16);
      seats.push({
        id: `${row}-${col}`,
        row,
        col,
        tier,
        price,
        isWheelchair,
      });
    }
  });

  return seats;
}

// Generate the next 7 days dates starting from today
export function getNextDates(count: number = 7): { dateStr: string; dayName: string; monthName: string; dayNumber: string; isToday: boolean }[] {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNumber = d.getDate().toString();

    dates.push({
      dateStr,
      dayName,
      monthName,
      dayNumber,
      isToday: i === 0,
    });
  }

  return dates;
}

// Preset showtimes
const SHOW_TIMES: { time: string; format: MovieFormat; hall: string }[] = [
  { time: '10:45 AM', format: 'Standard 2D', hall: 'Hall 4 - Laser Digital' },
  { time: '01:15 PM', format: 'Dolby Cinema', hall: 'Hall 2 - Dolby Atmos' },
  { time: '04:30 PM', format: 'IMAX 3D', hall: 'Hall 1 - Grand IMAX Laser' },
  { time: '07:45 PM', format: 'IMAX 3D', hall: 'Hall 1 - Grand IMAX Laser' },
  { time: '10:15 PM', format: '4DX', hall: 'Hall 3 - 4DX Dynamic Motion' },
];

export function generateShowtimesForMovie(
  movie: Movie, 
  theaters: Theater[], 
  selectedDate: string,
  customShowtimes: Showtime[] = []
): Showtime[] {
  const showtimes: Showtime[] = [];

  // First, include any custom showtimes scheduled by Admin for this movie and date
  const matchingCustom = customShowtimes.filter(
    (s) => s.movieId === movie.id && s.date === selectedDate
  );

  matchingCustom.forEach((cs) => {
    showtimes.push(cs);
  });

  // Then add default generated showtimes for theaters that don't have overlapping custom slots
  theaters.forEach((theater, thIndex) => {
    // Generate 3 to 4 showtimes per theater
    SHOW_TIMES.slice(0, 3 + (thIndex % 3)).forEach((slot, sIndex) => {
      // Check if custom showtime already scheduled for this slot & theater
      const alreadyExists = showtimes.some(
        (s) => s.theaterId === theater.id && s.time === slot.time && s.date === selectedDate
      );
      if (alreadyExists) return;

      // Create seed-based deterministic booked seats for realism
      const seed = (thIndex * 17 + sIndex * 31 + selectedDate.length) % 100;
      const booked: string[] = [];

      // Reserve typical popular center seats
      const possibleSeats = ['C-7', 'C-8', 'C-9', 'C-10', 'D-7', 'D-8', 'D-9', 'D-10', 'E-8', 'E-9', 'B-7', 'B-8', 'F-5', 'F-6'];
      possibleSeats.forEach((seat, idx) => {
        if ((seed + idx) % 2 === 0) {
          booked.push(seat);
        }
      });

      showtimes.push({
        id: `show-${movie.id}-${theater.id}-${selectedDate}-${slot.time.replace(/[: ]/g, '')}`,
        movieId: movie.id,
        theaterId: theater.id,
        date: selectedDate,
        time: slot.time,
        format: slot.format,
        hallName: slot.hall,
        prices: {
          vip: 24.0,
          prime: 18.5,
          classic: 14.0,
        },
        bookedSeats: booked,
      });
    });
  });

  return showtimes;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
