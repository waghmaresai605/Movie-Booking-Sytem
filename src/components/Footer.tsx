import React from 'react';
import { Film, Heart, ShieldCheck, Ticket, FolderGit2 } from 'lucide-react';

interface FooterProps {
  onOpenDriveModal: () => void;
  onOpenMyBookings: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDriveModal, onOpenMyBookings }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-bold">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white">
                Cine<span className="text-rose-500">Verse</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The premier destination for immersive movie booking, laser IMAX screens, Dolby Atmos surround sound, and gourmet cinema concessions.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                v2.4 Cinema-Engine
              </span>
            </div>
          </div>

          {/* Col 2: Experiences */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Premium Formats</h4>
            <ul className="space-y-1.5 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer">IMAX GT Dual 4K Laser</li>
              <li className="hover:text-white transition-colors cursor-pointer">Dolby Cinema & Atmos</li>
              <li className="hover:text-white transition-colors cursor-pointer">4DX Environmental Motion</li>
              <li className="hover:text-white transition-colors cursor-pointer">VIP Recliner Lounges</li>
              <li className="hover:text-white transition-colors cursor-pointer">ScreenX 270-Degree View</li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Help & Tickets</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={onOpenMyBookings} className="hover:text-white transition-colors text-left">
                  My Bookings & QR Passes
                </button>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">100% Refund Cancellation Policy</li>
              <li className="hover:text-white transition-colors cursor-pointer">Wheelchair Accessibility Guide</li>
              <li className="hover:text-white transition-colors cursor-pointer">Gift Cards & Cinema Vouchers</li>
              <li>
                <button onClick={onOpenDriveModal} className="hover:text-emerald-400 text-emerald-500 transition-colors flex items-center gap-1">
                  <FolderGit2 className="w-3.5 h-3.5" /> Drive Project Reference
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Safe booking */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Guaranteed Booking</h4>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" /> Instant Seat Allocation
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Every ticket generated is issued with a certified QR code verified at gate entry.
              </p>
            </div>
            <div className="text-[11px] text-slate-500">
              Accepted: Visa • Mastercard • Apple Pay • Google Pay • UPI
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-slate-500 text-[11px]">
            &copy; {new Date().getFullYear()} CineVerse Entertainment Systems. Built with precision for movie enthusiasts.
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>Powered by CineVerse Cinema Booking Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
