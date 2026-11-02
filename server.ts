import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface QRPaymentSession {
  id: string;
  movieTitle: string;
  moviePoster: string;
  movieBackdrop?: string;
  theaterName: string;
  hallName: string;
  format: string;
  showDate: string;
  showTime: string;
  seats: string[];
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  concessionsSummary?: string;
  convenienceFee?: number;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'paid' | 'expired';
  paidAt?: number;
  paymentMethod?: string;
}

// In-memory cross-device session store
const sessions = new Map<string, QRPaymentSession>();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware for JSON body parsing
  app.use(express.json());

  // CORS headers to ensure mobile scanners can connect smoothly
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. Create or refresh QR payment session
  app.post('/api/qr-session', (req, res) => {
    const {
      id,
      movieTitle,
      moviePoster,
      movieBackdrop,
      theaterName,
      hallName,
      format,
      showDate,
      showTime,
      seats,
      totalAmount,
      customerName,
      customerEmail,
      customerPhone,
      concessionsSummary,
      convenienceFee,
    } = req.body;

    const sessionId = id || `qrp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();
    // 5 minutes expiry limit (300 seconds)
    const expiresAt = now + 5 * 60 * 1000;

    const session: QRPaymentSession = {
      id: sessionId,
      movieTitle: movieTitle || 'Movie Ticket',
      moviePoster: moviePoster || '',
      movieBackdrop: movieBackdrop || '',
      theaterName: theaterName || 'Cinema',
      hallName: hallName || 'Auditorium',
      format: format || 'Standard',
      showDate: showDate || '',
      showTime: showTime || '',
      seats: Array.isArray(seats) ? seats : [],
      totalAmount: Number(totalAmount) || 0,
      customerName: customerName || 'Guest',
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      concessionsSummary: concessionsSummary || '',
      convenienceFee: Number(convenienceFee) || 0,
      createdAt: now,
      expiresAt,
      status: 'pending',
    };

    sessions.set(sessionId, session);
    res.json({ success: true, session });
  });

  // 2. Fetch session details and real-time status
  app.get('/api/qr-session/:id', (req, res) => {
    const sessionId = req.params.id;
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, error: 'Payment session not found' });
    }

    // Auto mark expired if past 5 minutes
    if (session.status === 'pending' && Date.now() > session.expiresAt) {
      session.status = 'expired';
    }

    res.json({ success: true, session });
  });

  // 3. Mobile authorization action (user clicks "Pay" on mobile)
  app.post('/api/qr-session/:id/pay', (req, res) => {
    const sessionId = req.params.id;
    let session = sessions.get(sessionId);

    // If session wasn't in memory (e.g. server restart or query payload backup), restore if provided
    if (!session && req.body.fallbackSession) {
      session = req.body.fallbackSession;
      sessions.set(sessionId, session!);
    }

    if (!session) {
      return res.status(404).json({ success: false, error: 'Payment session not found or invalid' });
    }

    if (Date.now() > session.expiresAt) {
      session.status = 'expired';
      return res.status(400).json({ success: false, error: 'Payment session has expired (5-minute limit exceeded)' });
    }

    session.status = 'paid';
    session.paidAt = Date.now();
    session.paymentMethod = req.body.paymentMethod || 'UPI (Google Pay / PhonePe)';

    res.json({ success: true, session });
  });

  // Housekeeping: remove sessions older than 1 hour
  setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, s] of sessions.entries()) {
      if (s.createdAt < oneHourAgo) {
        sessions.delete(id);
      }
    }
  }, 15 * 60 * 1000);

  // Mount Vite or serve static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineVerse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
