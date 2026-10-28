import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Calendar, 
  Armchair, 
  Check, 
  Sparkles, 
  UtensilsCrossed, 
  CreditCard, 
  ShieldCheck, 
  Ticket, 
  Printer, 
  Share2, 
  Plus, 
  Minus, 
  Tag, 
  AlertCircle,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  Movie, 
  Theater, 
  Showtime, 
  ConcessionItem, 
  SelectedConcession, 
  Booking, 
  SeatInfo,
  User
} from '../types';
import { 
  getNextDates, 
  generateShowtimesForMovie, 
  generateSeatsLayout, 
  formatCurrency, 
  ROWS_CONFIG 
} from '../utils/bookingUtils';
import { TicketQRCode } from './TicketQRCode';
import { PROMO_CODES } from '../data/mockData';
import { printOrSaveTicket } from '../utils/printUtils';

interface BookingFlowModalProps {
  movie: Movie;
  theaters: Theater[];
  concessionsList: ConcessionItem[];
  onClose: () => void;
  onBookingComplete: (newBooking: Booking) => void;
  initialShowtime?: Showtime | null;
  currentUser?: User | null;
  customShowtimes?: Showtime[];
}

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  movie,
  theaters,
  concessionsList,
  onClose,
  onBookingComplete,
  initialShowtime = null,
  currentUser = null,
  customShowtimes = [],
}) => {
  // Step state: 1: Showtime, 2: Seats, 3: Concessions, 4: Payment, 5: Ticket
  const [currentStep, setCurrentStep] = useState<number>(initialShowtime ? 2 : 1);

  // Step 1: Dates & Showtime
  const dates = useMemo(() => getNextDates(7), []);
  const [selectedDate, setSelectedDate] = useState<string>(dates[0].dateStr);

  const availableShowtimes = useMemo(() => {
    return generateShowtimesForMovie(movie, theaters, selectedDate, customShowtimes);
  }, [movie, theaters, selectedDate, customShowtimes]);

  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(
    initialShowtime || availableShowtimes[0] || null
  );

  // Step 2: Seats
  const seatsLayout = useMemo(() => generateSeatsLayout(), []);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  // Step 3: Concessions
  const [selectedConcessions, setSelectedConcessions] = useState<{ [id: string]: number }>({});

  // Step 4: Checkout & Payment
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Alex Morgan');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'alex.morgan@example.com');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '+1 (555) 234-5678');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'applepay'>('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Step 5: Completed Booking
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Calculate pricing
  const selectedSeatObjects = useMemo(() => {
    return seatsLayout.filter((s) => selectedSeatIds.includes(s.id));
  }, [seatsLayout, selectedSeatIds]);

  const ticketSubtotal = useMemo(() => {
    return selectedSeatObjects.reduce((acc, s) => acc + s.price, 0);
  }, [selectedSeatObjects]);

  const concessionsSubtotal = useMemo(() => {
    return Object.entries(selectedConcessions).reduce((sum, [cId, qty]) => {
      const item = concessionsList.find((c) => c.id === cId);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  }, [selectedConcessions, concessionsList]);

  const convenienceFee = selectedSeatIds.length > 0 ? 2.5 * selectedSeatIds.length : 0;

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    const rule = PROMO_CODES[appliedPromo];
    if (!rule) return 0;

    let disc = 0;
    if (rule.discountPercent) {
      if (appliedPromo === 'MOVIE50') {
        disc = (convenienceFee * rule.discountPercent) / 100;
      } else {
        disc = (ticketSubtotal * rule.discountPercent) / 100;
      }
    } else if (rule.flatDiscount) {
      disc = rule.flatDiscount;
    }
    return Math.min(disc, ticketSubtotal + concessionsSubtotal + convenienceFee);
  }, [appliedPromo, ticketSubtotal, concessionsSubtotal, convenienceFee]);

  const grandTotal = Math.max(0, ticketSubtotal + concessionsSubtotal + convenienceFee - discountAmount);

  // Seat toggle handler
  const handleToggleSeat = (seat: SeatInfo) => {
    if (selectedShowtime?.bookedSeats.includes(seat.id)) return; // Already booked

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 8) {
        alert('You can select a maximum of 8 seats per booking transaction.');
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat.id]);
    }
  };

  // Concession quantity changer
  const handleUpdateConcession = (concessionId: string, delta: number) => {
    setSelectedConcessions((prev) => {
      const current = prev[concessionId] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[concessionId];
        return copy;
      }
      return { ...prev, [concessionId]: updated };
    });
  };

  // Promo code apply
  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (PROMO_CODES[code]) {
      const rule = PROMO_CODES[code];
      if (rule.minTotal && ticketSubtotal + concessionsSubtotal < rule.minTotal) {
        setPromoError(`Requires minimum order of ${formatCurrency(rule.minTotal)}`);
        return;
      }
      setAppliedPromo(code);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try MOVIE50 or BLOCKBUSTER');
    }
  };

  // Complete Payment & Confirm
  const handleProcessCheckout = () => {
    if (!selectedShowtime) return;
    if (selectedSeatIds.length === 0) {
      alert('Please select at least one seat to proceed.');
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      const theater = theaters.find((t) => t.id === selectedShowtime.theaterId) || theaters[0];
      const randomCode = `CV-${Math.floor(10000 + Math.random() * 90000)}-${movie.title.substring(0, 2).toUpperCase()}`;

      const selectedConcessionsData: SelectedConcession[] = Object.entries(selectedConcessions).map(([id, qty]) => {
        const item = concessionsList.find((c) => c.id === id)!;
        return { item, quantity: qty };
      });

      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        bookingCode: randomCode,
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.posterUrl,
        movieBackdrop: movie.backdropUrl,
        theaterId: theater.id,
        theaterName: theater.name,
        theaterAddress: theater.address,
        hallName: selectedShowtime.hallName,
        format: selectedShowtime.format,
        showDate: selectedShowtime.date,
        showTime: selectedShowtime.time,
        seats: selectedSeatIds.sort(),
        seatDetails: selectedSeatObjects.map((s) => ({
          id: s.id,
          tier: s.tier,
          price: s.price,
        })),
        concessions: selectedConcessionsData,
        ticketSubtotal,
        concessionsSubtotal,
        convenienceFee,
        discount: discountAmount,
        promoCodeApplied: appliedPromo || undefined,
        totalAmount: grandTotal,
        paymentMethod: paymentMethod === 'card' ? 'Credit Card (**** 4821)' : paymentMethod === 'applepay' ? 'Apple Pay' : 'UPI Instant',
        paymentStatus: 'paid',
        bookedAt: new Date().toISOString(),
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        status: 'confirmed',
        qrValue: `CINEVERSE-TICKET:${randomCode}|MOVIE:${movie.title}|SEATS:${selectedSeatIds.join(',')}|TIME:${selectedShowtime.date} ${selectedShowtime.time}`,
      };

      setConfirmedBooking(newBooking);
      onBookingComplete(newBooking);
      setCurrentStep(5);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#e11d48', '#38bdf8', '#fbbf24', '#ffffff'],
        });
      } catch (err) {
        // ignore if confetti blocked
      }
    }, 1400);
  };

  const handlePrint = () => {
    if (confirmedBooking) {
      printOrSaveTicket(confirmedBooking);
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header / Progress Indicator */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-10 h-14 object-cover rounded-lg border border-slate-700 hidden sm:block"
            />
            <div>
              <div className="text-xs text-rose-500 font-bold uppercase tracking-wider">
                Booking Step {currentStep} of 4
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white truncate max-w-xs sm:max-w-md">
                {movie.title}
              </h2>
            </div>
          </div>

          {/* Stepper Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold">
            <span className={`px-3 py-1 rounded-full ${currentStep === 1 ? 'bg-rose-600 text-white' : currentStep > 1 ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'}`}>
              1. Showtimes
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className={`px-3 py-1 rounded-full ${currentStep === 2 ? 'bg-rose-600 text-white' : currentStep > 2 ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'}`}>
              2. Seats
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className={`px-3 py-1 rounded-full ${currentStep === 3 ? 'bg-rose-600 text-white' : currentStep > 3 ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'}`}>
              3. Concessions
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className={`px-3 py-1 rounded-full ${currentStep === 4 ? 'bg-rose-600 text-white' : currentStep > 4 ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'}`}>
              4. Payment
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            STEP 1: DATE & THEATER SHOWTIME SELECTOR
        ========================================================================= */}
        {currentStep === 1 && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                1. Select Screening Date
              </h3>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {dates.map((d) => (
                  <button
                    key={d.dateStr}
                    onClick={() => setSelectedDate(d.dateStr)}
                    className={`flex flex-col items-center min-w-[76px] py-3 px-2 rounded-2xl border transition-all cursor-pointer ${
                      selectedDate === d.dateStr
                        ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/40 scale-105'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-[11px] font-semibold">{d.dayName}</span>
                    <span className="text-xl font-black my-0.5">{d.dayNumber}</span>
                    <span className="text-[10px] uppercase font-bold opacity-80">{d.monthName}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                2. Select Cinema Theater & Showtime
              </h3>
              <div className="space-y-4">
                {theaters.map((theater) => {
                  const theaterShows = availableShowtimes.filter((s) => s.theaterId === theater.id);
                  if (theaterShows.length === 0) return null;

                  return (
                    <div
                      key={theater.id}
                      className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-base">{theater.name}</h4>
                            <span className="text-xs text-rose-400 font-medium">({theater.distance})</span>
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {theater.address}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {theater.amenities.slice(0, 3).map((am) => (
                            <span key={am} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                              {am}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Showtimes pills */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        {theaterShows.map((show) => {
                          const isSelected = selectedShowtime?.id === show.id;
                          return (
                            <button
                              key={show.id}
                              onClick={() => {
                                setSelectedShowtime(show);
                                setSelectedSeatIds([]);
                                setCurrentStep(2); // Jump directly to seat matrix!
                              }}
                              className={`flex flex-col items-center px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/40'
                                  : 'bg-slate-900/90 border-slate-700/80 hover:border-rose-500/60 text-slate-200 hover:text-white'
                              }`}
                            >
                              <span className="text-sm font-black">{show.time}</span>
                              <span className={`text-[10px] font-bold mt-0.5 ${isSelected ? 'text-rose-200' : 'text-sky-400'}`}>
                                {show.format}
                              </span>
                              <span className="text-[9px] text-slate-400 mt-0.5">From $14.00</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: INTERACTIVE SEAT SELECTION
        ========================================================================= */}
        {currentStep === 2 && selectedShowtime && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Show info bar */}
            <div className="bg-slate-950/70 px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{selectedShowtime.hallName}</span>
                <span>•</span>
                <span className="text-sky-400 font-semibold">{selectedShowtime.format}</span>
                <span>•</span>
                <span className="text-slate-400">{selectedShowtime.time}, {selectedShowtime.date}</span>
              </div>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
              >
                Change Showtime
              </button>
            </div>

            {/* Cinema Layout Area */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center">
              {/* Cinema Screen Curve */}
              <div className="w-full max-w-2xl mb-8 flex flex-col items-center">
                <div className="w-full h-8 border-t-4 border-sky-400/80 rounded-t-[100%] screen-glow relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 to-transparent rounded-t-[100%]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">
                  All Eyes This Way • Cinema Screen
                </span>
              </div>

              {/* Seating Grid */}
              <div className="space-y-3 min-w-[560px] pb-6">
                {ROWS_CONFIG.map(({ row, tier, price }) => (
                  <div key={row} className="flex items-center justify-center gap-2">
                    {/* Row Letter */}
                    <span className="w-6 text-center text-xs font-bold text-slate-500">{row}</span>

                    {/* Left seats 1-8 */}
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((col) => {
                        const seatId = `${row}-${col}`;
                        const isBooked = selectedShowtime.bookedSeats.includes(seatId);
                        const isSelected = selectedSeatIds.includes(seatId);
                        const isWheelchair = row === 'J' && (col === 1 || col === 2);

                        return (
                          <button
                            key={seatId}
                            disabled={isBooked}
                            onClick={() => handleToggleSeat({ id: seatId, row, col, tier, price })}
                            title={`${seatId} (${tier.toUpperCase()}) - ${formatCurrency(price)}`}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                              isBooked
                                ? 'bg-slate-950 text-slate-700 cursor-not-allowed border border-slate-900 line-through'
                                : isSelected
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/60 scale-110 border border-rose-400'
                                : tier === 'vip'
                                ? 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 hover:scale-105'
                                : tier === 'prime'
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:scale-105'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:scale-105'
                            }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : col}
                          </button>
                        );
                      })}
                    </div>

                    {/* Center Gangway / Aisle */}
                    <div className="w-6 sm:w-8 text-center text-[10px] text-slate-700 select-none">
                      •
                    </div>

                    {/* Right seats 9-16 */}
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 8 }, (_, i) => i + 9).map((col) => {
                        const seatId = `${row}-${col}`;
                        const isBooked = selectedShowtime.bookedSeats.includes(seatId);
                        const isSelected = selectedSeatIds.includes(seatId);

                        return (
                          <button
                            key={seatId}
                            disabled={isBooked}
                            onClick={() => handleToggleSeat({ id: seatId, row, col, tier, price })}
                            title={`${seatId} (${tier.toUpperCase()}) - ${formatCurrency(price)}`}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                              isBooked
                                ? 'bg-slate-950 text-slate-700 cursor-not-allowed border border-slate-900 line-through'
                                : isSelected
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/60 scale-110 border border-rose-400'
                                : tier === 'vip'
                                ? 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 hover:scale-105'
                                : tier === 'prime'
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:scale-105'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:scale-105'
                            }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : col}
                          </button>
                        );
                      })}
                    </div>

                    {/* Row Letter right */}
                    <span className="w-6 text-center text-xs font-bold text-slate-500">{row}</span>
                  </div>
                ))}
              </div>

              {/* Seat Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 py-3 border-t border-slate-800/80 w-full max-w-xl text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700" />
                  <span className="text-slate-400">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-rose-600 border border-rose-400" />
                  <span className="text-white font-medium">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-950 border border-slate-900 line-through text-slate-700" />
                  <span className="text-slate-500">Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/40" />
                  <span className="text-amber-300 font-medium">VIP Recliner ($24)</span>
                </div>
              </div>
            </div>

            {/* Bottom Bar for Seat Step */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-400">
                  {selectedSeatIds.length === 0 ? (
                    'Select your seats above (max 8)'
                  ) : (
                    <span>
                      Seats: <strong className="text-rose-400">{selectedSeatIds.join(', ')}</strong> ({selectedSeatIds.length} tickets)
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold text-white">
                  Total: {formatCurrency(ticketSubtotal)}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700"
                >
                  Back
                </button>
                <button
                  disabled={selectedSeatIds.length === 0}
                  onClick={() => setCurrentStep(3)}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                    selectedSeatIds.length > 0
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Select Snacks & Drinks</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: CONCESSIONS & COMBOS
        ========================================================================= */}
        {currentStep === 3 && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                    Grab Movie Munchies & Beverages
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Pre-order now to skip the theater concession queue!</p>
                </div>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline cursor-pointer"
                >
                  Skip Snacks &rarr;
                </button>
              </div>

              {/* Grid of snacks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {concessionsList.map((item) => {
                  const qty = selectedConcessions[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between p-3.5 hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-2.5">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          {item.tag && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">{item.description}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80">
                        <span className="text-xs font-black text-amber-400">{formatCurrency(item.price)}</span>
                        
                        {qty === 0 ? (
                          <button
                            onClick={() => handleUpdateConcession(item.id, 1)}
                            className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition-all"
                          >
                            + Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                            <button
                              onClick={() => handleUpdateConcession(item.id, -1)}
                              className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-800 text-slate-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-white px-1">{qty}</span>
                            <button
                              onClick={() => handleUpdateConcession(item.id, 1)}
                              className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-800 text-slate-300"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Total with Snacks:</span>
                <div className="text-lg font-bold text-white">
                  {formatCurrency(ticketSubtotal + concessionsSubtotal)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700"
                >
                  Back to Seats
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/40 flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 4: REVIEW & PAYMENT CHECKOUT
        ========================================================================= */}
        {currentStep === 4 && selectedShowtime && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Customer details & payment method */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-3">1. Contact Information for Ticket</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 font-medium block mb-1">Email (Ticket PDF delivery)</label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          required
                          className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-medium block mb-1">Mobile Phone (SMS updates)</label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          required
                          className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div>
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-rose-500" /> Apply Voucher or Promo Code
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. MOVIE50 or BLOCKBUSTER"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none uppercase font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedPromo && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-1.5">
                      <Check className="w-3.5 h-3.5" /> Promo &quot;{appliedPromo}&quot; applied! ({PROMO_CODES[appliedPromo]?.description})
                    </div>
                  )}
                  {promoError && (
                    <div className="text-xs text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {promoError}
                    </div>
                  )}
                </div>

                {/* Payment Selection */}
                <div>
                  <h3 className="text-base font-bold text-white mb-3">2. Select Payment Method</h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-rose-600/20 border-rose-500 text-rose-400 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="text-xs">Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('applepay')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'applepay'
                          ? 'bg-rose-600/20 border-rose-500 text-rose-400 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span className="text-xs">Apple / GPay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'upi'
                          ? 'bg-rose-600/20 border-rose-500 text-rose-400 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-sky-400" />
                      <span className="text-xs">UPI / QR</span>
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">Card Number</label>
                        <input
                          type="text"
                          readOnly
                          value="•••• •••• •••• 4821"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400 font-medium block mb-1">Expiry Date</label>
                          <input
                            type="text"
                            readOnly
                            value="11 / 28"
                            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 font-medium block mb-1">CVV</label>
                          <input
                            type="password"
                            readOnly
                            value="•••"
                            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Simulated 256-bit SSL encrypted checkout</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="lg:col-span-5">
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
                    Booking Summary
                  </h3>

                  <div className="flex items-center gap-3">
                    <img src={movie.posterUrl} alt={movie.title} className="w-12 h-16 object-cover rounded-lg" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{movie.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedShowtime.hallName}</p>
                      <p className="text-xs text-rose-400 font-semibold">{selectedShowtime.format} • {selectedShowtime.time}</p>
                    </div>
                  </div>

                  {/* Itemized pricing */}
                  <div className="space-y-2 text-xs pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Seats ({selectedSeatIds.join(', ')}):</span>
                      <span className="font-semibold text-white">{formatCurrency(ticketSubtotal)}</span>
                    </div>

                    {concessionsSubtotal > 0 && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Cinema Concessions:</span>
                        <span className="font-semibold text-white">{formatCurrency(concessionsSubtotal)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Booking Convenience Fee:</span>
                      <span>{formatCurrency(convenienceFee)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between text-emerald-400 font-bold">
                        <span>Promo Discount ({appliedPromo}):</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-sm">
                      <span className="font-bold text-white">Grand Total:</span>
                      <span className="font-black text-rose-400 text-lg">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Pay button */}
                  <button
                    onClick={handleProcessCheckout}
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-sm shadow-xl shadow-rose-900/50 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    {isProcessingPayment ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Securing Your Tickets...</span>
                      </div>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pay {formatCurrency(grandTotal)} & Confirm</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 5: CONFIRMED BOARDING PASS & TICKET
        ========================================================================= */}
        {currentStep === 5 && confirmedBooking && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col items-center">
            <div className="text-center space-y-1 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Check className="w-3.5 h-3.5" /> Booking Confirmed!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">You&apos;re Going to the Movies!</h2>
              <p className="text-xs text-slate-400">
                Confirmation code sent to {confirmedBooking.customer.email}
              </p>
            </div>

            {/* Boarding Pass Ticket UI */}
            <div 
              id="printable-ticket"
              className="w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              {/* Ticket Top Movie Banner */}
              <div className="relative h-32 w-full overflow-hidden">
                <img
                  src={confirmedBooking.movieBackdrop}
                  alt={confirmedBooking.movieTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">CineVerse E-Ticket</span>
                    <h3 className="text-lg font-black text-white">{confirmedBooking.movieTitle}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold">
                    {confirmedBooking.format}
                  </span>
                </div>
              </div>

              {/* Main Ticket Details Grid */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                <div className="sm:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-bold block">Cinema Theater</span>
                      <strong className="text-white block truncate">{confirmedBooking.theaterName}</strong>
                      <span className="text-slate-400 text-[11px] truncate block">{confirmedBooking.theaterAddress}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-bold block">Auditorium / Hall</span>
                      <strong className="text-rose-400 block">{confirmedBooking.hallName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-bold block">Show Date & Time</span>
                      <strong className="text-white block">{confirmedBooking.showDate}</strong>
                      <span className="text-amber-400 font-bold block">{confirmedBooking.showTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-bold block">Reserved Seats</span>
                      <strong className="text-emerald-400 text-sm font-black block">
                        {confirmedBooking.seats.join(', ')}
                      </strong>
                    </div>
                  </div>

                  {confirmedBooking.concessions.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                      <span className="text-slate-500 font-bold uppercase text-[9px] block">Snacks Ordered</span>
                      <span>
                        {confirmedBooking.concessions.map((c) => `${c.quantity}x ${c.item.name}`).join(' • ')}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Booking Reference</span>
                      <span className="font-mono font-bold text-slate-200">{confirmedBooking.bookingCode}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Amount Paid</span>
                      <span className="font-bold text-white">{formatCurrency(confirmedBooking.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Scannable QR Code */}
                <div className="flex flex-col items-center justify-center p-2 border-t sm:border-t-0 sm:border-l border-slate-800">
                  <TicketQRCode value={confirmedBooking.qrValue} size={130} />
                  <span className="text-[10px] text-slate-400 font-mono mt-2 tracking-wider">
                    SCAN AT ENTRANCE
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF Ticket</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-900/40"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
