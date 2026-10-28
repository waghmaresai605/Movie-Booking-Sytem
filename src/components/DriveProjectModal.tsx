import React, { useState } from 'react';
import { 
  X, 
  FolderGit2, 
  ExternalLink, 
  CheckCircle, 
  FileText, 
  Upload, 
  Download, 
  Layers, 
  ShieldCheck, 
  Code2,
  Copy,
  Check
} from 'lucide-react';
import { Movie, Theater } from '../types';

interface DriveProjectModalProps {
  onClose: () => void;
  movies: Movie[];
  theaters: Theater[];
  onImportCustomMovies: (movies: Movie[]) => void;
}

export const DriveProjectModal: React.FC<DriveProjectModalProps> = ({
  onClose,
  movies,
  theaters,
  onImportCustomMovies,
}) => {
  const driveUrl = 'https://drive.google.com/drive/folders/1jT1cCBxKXhR0C5QPiMwg2QoKsMqrCRpx';
  const [jsonInput, setJsonInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(driveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportData = () => {
    const data = {
      project: 'CineVerse Movie Booking System',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      movies,
      theaters,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cineverse-movie-booking-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const list = Array.isArray(parsed) ? parsed : parsed.movies;
      if (Array.isArray(list) && list.length > 0) {
        onImportCustomMovies(list);
        setImportStatus(`Successfully loaded ${list.length} movies from your project file!`);
        setJsonInput('');
      } else {
        setImportStatus('JSON should contain an array of movies or a { "movies": [...] } object.');
      }
    } catch (e: any) {
      setImportStatus(`Invalid JSON syntax: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Google Drive Project Integration</h2>
              <p className="text-xs text-slate-400">Sync with your Movie Booking System repository</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Drive Link Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Target Project Folder
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                Connected
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-300 truncate">{driveUrl}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
                  title="Copy Link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
                  title="Open in Drive"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              This application has been structured around your full-stack cinema ticket booking requirements: real-time curved cinema seating matrices, multiplex showtimes, food & beverage add-ons, digital QR passes, and theater management.
            </p>
          </div>

          {/* Implemented Features Checklist */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-400" /> Complete System Features Built:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Curved Cinema Screen Seating</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Multi-Tier Pricing (VIP/Prime/Classic)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">7-Day Showtimes & Multiplex Filter</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Concession Combos & Popcorn Cart</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Scannable QR Digital Boarding Pass</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Voucher / Promo Code Discount Engine</span>
              </div>
            </div>
          </div>

          {/* Data Import / Export */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-amber-400" /> Import Custom Movie JSON
              </span>
              <button
                onClick={handleExportData}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export Data JSON
              </button>
            </div>

            <textarea
              rows={3}
              placeholder='Paste JSON movie array to load custom data from your drive project, e.g.: [{"id": "m1", "title": "My Movie", ...}]'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white outline-none font-mono"
            />

            {importStatus && (
              <p className={`text-xs ${importStatus.includes('Successfully') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {importStatus}
              </p>
            )}

            {jsonInput.trim() && (
              <button
                onClick={handleImportJson}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Import Into Cinema Catalog
              </button>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
