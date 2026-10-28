import React, { useState } from 'react';
import { 
  X, 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  Trash2, 
  Printer, 
  QrCode, 
  CheckCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { Booking } from '../types';
import { formatCurrency } from '../utils/bookingUtils';
import { TicketQRCode } from './TicketQRCode';
import { printOrSaveTicket } from '../utils/printUtils';

interface MyBookingsModalProps {
  bookings: Booking[];
  onClose: () => void;
  onCancelBooking: (bookingId: string) => void;
  onExploreMovies: () => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  bookings,
  onClose,
  onCancelBooking,
  onExploreMovies,
}) => {
  const [selectedBookingForPass, setSelectedBookingForPass] = useState<Booking | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">My Movie Tickets</h2>
              <p className="text-xs text-slate-400">{bookings.length} reservations found</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bookings List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {bookings.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                <Ticket className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Tickets Booked Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  When you book tickets for any show, your digital entry passes with scannable QR codes will appear right here.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onExploreMovies();
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-transform active:scale-95"
              >
                Browse Now Showing Movies
              </button>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={b.moviePoster}
                    alt={b.movieTitle}
                    className="w-14 h-20 object-cover rounded-xl border border-slate-800 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {b.bookingCode}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        b.status === 'confirmed' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {b.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base leading-snug">{b.movieTitle}</h4>
                    
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                      <span>{b.theaterName}</span>
                      <span>•</span>
                      <span className="text-rose-400 font-semibold">{b.format}</span>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-3 mt-1.5 font-medium">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" /> {b.showDate}
                      </span>
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Clock className="w-3.5 h-3.5" /> {b.showTime}
                      </span>
                      <span>Seats: <strong className="text-white">{b.seats.join(', ')}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                  <button
                    onClick={() => setSelectedBookingForPass(b)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-rose-500" />
                    <span>View Pass</span>
                  </button>

                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => setConfirmCancelId(b.id)}
                      className="p-2 rounded-xl bg-slate-900/60 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 transition-colors"
                      title="Cancel ticket & refund"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cancellation confirmation modal */}
        {confirmCancelId && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Cancel Movie Booking?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                As per cinema cancellation policy, a 100% refund will be credited back to your original payment method. Your seats will be released.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmCancelId(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                >
                  Keep Ticket
                </button>
                <button
                  onClick={() => {
                    onCancelBooking(confirmCancelId);
                    setConfirmCancelId(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Individual Boarding Pass Modal */}
        {selectedBookingForPass && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 relative">
              <button
                onClick={() => setSelectedBookingForPass(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                  CineVerse Boarding Pass
                </span>
                <h3 className="text-xl font-black text-white">{selectedBookingForPass.movieTitle}</h3>
                <p className="text-xs text-slate-400">{selectedBookingForPass.theaterName} • {selectedBookingForPass.hallName}</p>
              </div>

              <div className="flex justify-center py-2">
                <TicketQRCode value={selectedBookingForPass.qrValue} size={150} />
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">DATE & TIME</span>
                  <strong className="text-white">{selectedBookingForPass.showDate} @ {selectedBookingForPass.showTime}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">SEATS</span>
                  <strong className="text-rose-400 font-black">{selectedBookingForPass.seats.join(', ')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">BOOKING REF</span>
                  <strong className="text-white font-mono">{selectedBookingForPass.bookingCode}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">TOTAL PAID</span>
                  <strong className="text-emerald-400">{formatCurrency(selectedBookingForPass.totalAmount)}</strong>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => printOrSaveTicket(selectedBookingForPass)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Ticket
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
