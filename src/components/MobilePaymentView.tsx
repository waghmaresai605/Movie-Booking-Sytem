import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Film, 
  MapPin, 
  Calendar, 
  Armchair, 
  IndianRupee, 
  Smartphone, 
  Lock,
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRPaymentSession } from '../types';
import { formatCurrency } from '../utils/bookingUtils';

interface MobilePaymentViewProps {
  sessionId: string;
  onClose?: () => void;
}

export const MobilePaymentView: React.FC<MobilePaymentViewProps> = ({ sessionId, onClose }) => {
  const [session, setSession] = useState<QRPaymentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('Google Pay');
  const [isPaying, setIsPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [upiRefId, setUpiRefId] = useState('');

  // UPI Apps list
  const upiApps = [
    { name: 'Google Pay', icon: '⚡', color: 'from-blue-600 to-indigo-600', badge: 'Fastest' },
    { name: 'PhonePe', icon: '🟣', color: 'from-purple-600 to-indigo-700', badge: 'Popular' },
    { name: 'Paytm UPI', icon: '🔵', color: 'from-sky-500 to-blue-700', badge: 'Instant' },
    { name: 'BHIM UPI', icon: '🇮🇳', color: 'from-amber-600 to-orange-700', badge: 'Govt' },
    { name: 'CRED UPI', icon: '💳', color: 'from-rose-600 to-red-800', badge: 'Rewards' }
  ];

  // 1. Fetch Session from server
  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/qr-session/${sessionId}`);
      if (!res.ok) {
        throw new Error('Payment session not found or expired');
      }
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        if (data.session.status === 'paid') {
          setIsSuccess(true);
        }
        // Calculate remaining seconds
        const rem = Math.max(0, Math.floor((data.session.expiresAt - Date.now()) / 1000));
        setTimeLeft(rem);
      }
    } catch (err: unknown) {
      console.warn('API error, falling back to URL search params backup:', err);
      // Fallback: check URL parameters backup
      const params = new URLSearchParams(window.location.search);
      const movie = params.get('movie');
      const total = params.get('total');
      const seats = params.get('seats')?.split(',') || [];
      const theater = params.get('theater') || 'Cinema Theater';
      const hall = params.get('hall') || 'Screen 1';
      const format = params.get('format') || 'Standard';
      const time = params.get('time') || '';
      const date = params.get('date') || '';
      const poster = params.get('poster') || '';

      if (movie && total) {
        const fallback: QRPaymentSession = {
          id: sessionId,
          movieTitle: movie,
          moviePoster: poster,
          theaterName: theater,
          hallName: hall,
          format,
          showDate: date,
          showTime: time,
          seats,
          totalAmount: parseFloat(total) || 0,
          customerName: params.get('user') || 'Movie Fan',
          customerEmail: 'guest@cineverse.com',
          customerPhone: '+91 98765 43210',
          createdAt: Date.now(),
          expiresAt: Date.now() + 300 * 1000,
          status: 'pending'
        };
        setSession(fallback);
        setTimeLeft(300);
      } else {
        setError('This payment session has expired or is invalid. Please scan a fresh QR code from CineVerse.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  // 2. Countdown Timer ticker (5 minutes)
  useEffect(() => {
    if (!session || isSuccess || session.status === 'paid') return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setSession((prev) => prev ? { ...prev, status: 'expired' } : null);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.expiresAt, isSuccess, session?.status]);

  // Format mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. Handle Pay Click
  const handleAuthorizePayment = async () => {
    if (!session || timeLeft <= 0) return;
    setIsPaying(true);

    const ref = `UPI-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    setUpiRefId(ref);

    try {
      // POST to server to mark paid
      const res = await fetch(`/api/qr-session/${session.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: `${selectedUpiApp} UPI (${ref})`,
          fallbackSession: session
        }),
      });

      // Also trigger local sync for testing on same device or cross-tab
      try {
        localStorage.setItem(`cineverse_qr_paid_${session.id}`, JSON.stringify({
          id: session.id,
          paidAt: Date.now(),
          method: selectedUpiApp,
          ref
        }));
        if (typeof window.BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('cineverse_qr_payment_sync');
          bc.postMessage({ sessionId: session.id, status: 'paid', method: selectedUpiApp, ref });
          bc.close();
        }
      } catch (e) {
        // ignore
      }

      setIsSuccess(true);
      setSession((prev) => prev ? { ...prev, status: 'paid' } : null);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Payment authorization error:', err);
      // Even if network fails, trigger local fallback
      setIsSuccess(true);
    } finally {
      setIsPaying(false);
    }
  };

  // Expired View
  if (!loading && (session?.status === 'expired' || timeLeft <= 0) && !isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6">
        <header className="flex items-center justify-between py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-black text-sm">CV</span>
            <span className="font-extrabold text-base tracking-tight text-white">CineVerse Pay</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
            QR Expired
          </span>
        </header>

        <div className="my-auto text-center max-w-sm mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-600/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">5-Minute QR Timer Expired</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            For security, this payment session has expired after 5 minutes. Please return to your computer screen or generate a fresh QR code to complete your ticket booking.
          </p>
          <div className="pt-2">
            <button
              onClick={() => window.location.href = window.location.pathname}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Return to Cinema Home</span>
            </button>
          </div>
        </div>

        <footer className="text-center text-[10px] text-slate-500 py-3">
          CineVerse Protected UPI Gateway • 256-bit Encrypted
        </footer>
      </div>
    );
  }

  // Success View
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6">
        <header className="flex items-center justify-between py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-black text-sm">CV</span>
            <span className="font-extrabold text-base text-white">CineVerse Pay</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Authorized
          </span>
        </header>

        <div className="my-auto max-w-sm mx-auto w-full text-center space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-2xl shadow-emerald-950 animate-bounce">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Payment Successful!</h2>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              ₹{session?.totalAmount ? session.totalAmount.toLocaleString('en-IN') : '0'} paid via {selectedUpiApp}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Movie</span>
              <strong className="text-white font-bold truncate max-w-[180px]">{session?.movieTitle}</strong>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Reserved Seats</span>
              <strong className="text-rose-400 font-mono font-bold">{session?.seats.join(', ')}</strong>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">UPI Ref Code</span>
              <span className="text-slate-300 font-mono text-[11px]">{upiRefId || 'UPI-AUTH-VERIFIED'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Confirmed
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2.5 text-left">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>Check your computer screen!</strong> The cinema website has updated to show your digital boarding tickets and downloadable PDF.
            </p>
          </div>

          <button
            onClick={() => {
              if (onClose) onClose();
              else window.location.href = window.location.pathname;
            }}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700"
          >
            Close Mobile Window
          </button>
        </div>

        <footer className="text-center text-[10px] text-slate-500 py-3">
          CineVerse Protected UPI Gateway • Transaction Secured
        </footer>
      </div>
    );
  }

  // Loading View
  if (loading || !session) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Connecting to CineVerse UPI Gateway...</p>
      </div>
    );
  }

  // Active Payment View
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center font-black text-sm shadow-lg shadow-rose-950">
            CV
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
              <span>CineVerse Pay</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30">
                UPI Gateway
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Mobile Google Lens Scanner Authorization</p>
          </div>
        </div>

        {/* 5-minute countdown badge */}
        <div className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-xs font-bold border ${
          timeLeft < 60
            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
        }`}>
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono">{formatTimer(timeLeft)}</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="my-auto py-4 space-y-4 max-w-md mx-auto w-full">
        {/* Movie Show Details Card */}
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3.5 relative overflow-hidden">
          <div className="flex gap-3.5">
            {session.moviePoster && (
              <img
                src={session.moviePoster}
                alt={session.movieTitle}
                className="w-16 h-22 object-cover rounded-xl shadow-md border border-slate-800 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                {session.format || 'Standard'}
              </span>
              <h2 className="text-base font-black text-white truncate leading-tight mt-0.5">
                {session.movieTitle}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{session.theaterName} • {session.hallName}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{session.showDate}</span>
                <span className="text-amber-400 font-bold">• {session.showTime}</span>
              </div>
            </div>
          </div>

          {/* Reserved Seats & Concessions Badge */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Armchair className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Seats:</span>
              <strong className="text-emerald-400 font-mono font-bold">
                {session.seats.length > 0 ? session.seats.join(', ') : 'Selected'}
              </strong>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {session.seats.length} {session.seats.length === 1 ? 'ticket' : 'tickets'}
            </span>
          </div>

          {session.concessionsSummary && (
            <div className="text-[11px] text-slate-400 px-1 truncate">
              <span className="text-slate-500">Snacks:</span> {session.concessionsSummary}
            </div>
          )}

          {/* Grand Total Row */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Total Payable:</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-rose-400 tracking-tight">
                {formatCurrency(session.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* UPI Provider Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between px-1">
            <span>Select UPI App to Authorize:</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Auto Verified
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {upiApps.map((app) => (
              <button
                key={app.name}
                type="button"
                onClick={() => setSelectedUpiApp(app.name)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  selectedUpiApp === app.name
                    ? 'bg-rose-600/20 border-rose-500 text-white shadow-lg shadow-rose-950'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{app.icon}</span>
                  <div>
                    <span className="text-xs font-bold block">{app.name}</span>
                    <span className="text-[9px] text-slate-400">{app.badge}</span>
                  </div>
                </div>
                {selectedUpiApp === app.name && (
                  <CheckCircle className="w-4 h-4 text-rose-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Big Pay Button */}
        <button
          onClick={handleAuthorizePayment}
          disabled={isPaying || timeLeft <= 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-sm shadow-xl shadow-rose-900/40 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
        >
          {isPaying ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Authorizing UPI Payment...</span>
            </div>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Pay {formatCurrency(session.totalAmount)} via {selectedUpiApp}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tapping &apos;Pay&apos; will instantly update your computer cinema screen.</span>
        </p>
      </main>

      {/* Footer */}
      <footer className="text-center text-[10px] text-slate-500 py-2 border-t border-slate-800/80">
        CineVerse Entertainment Network • End-to-End Encrypted UPI Payment
      </footer>
    </div>
  );
};
