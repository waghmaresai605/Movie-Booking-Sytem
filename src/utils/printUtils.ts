import { Booking } from '../types';
import { formatCurrency } from './bookingUtils';

export function generateQrSvgString(value: string, size = 130): string {
  const gridSize = 25;
  const matrix: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

  const drawCorner = (startR: number, startC: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[startR + r][startC + c] = true;
        }
      }
    }
  };

  drawCorner(0, 0);
  drawCorner(0, gridSize - 7);
  drawCorner(gridSize - 7, 0);

  for (let i = 8; i < gridSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 1; r < gridSize - 1; r++) {
    for (let c = 1; c < gridSize - 1; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= gridSize - 8) || (r >= gridSize - 8 && c < 8)) {
        continue;
      }
      const cellHash = Math.sin((r * 31 + c * 17) ^ hash) * 10000;
      matrix[r][c] = cellHash - Math.floor(cellHash) > 0.45;
    }
  }

  const cellSize = size / gridSize;
  let rects = '';
  matrix.forEach((row, r) => {
    row.forEach((filled, c) => {
      if (filled) {
        rects += `<rect x="${(c * cellSize).toFixed(2)}" y="${(r * cellSize).toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="#0f172a"/>`;
      }
    });
  });

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="display:block;">${rects}</svg>`;
}

export function buildTicketHtml(booking: Booking): string {
  const qrSvg = generateQrSvgString(booking.qrValue || booking.bookingCode, 130);
  const snacksText = booking.concessions && booking.concessions.length > 0
    ? booking.concessions.map((c) => `${c.quantity}x ${c.item.name}`).join(' • ')
    : 'None';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CineVerse Ticket - ${booking.bookingCode}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0b0f19;
      color: #f1f5f9;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .ticket-card {
      width: 100%;
      max-width: 680px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .ticket-banner {
      position: relative;
      height: 140px;
      width: 100%;
      background: #1e293b url('${booking.movieBackdrop}') center/cover no-repeat;
    }
    .banner-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, #0f172a 0%, rgba(15, 23, 42, 0.65) 50%, rgba(15, 23, 42, 0.3) 100%);
    }
    .banner-content {
      position: absolute;
      bottom: 14px;
      left: 24px;
      right: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .ticket-badge {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #fb7185;
      margin-bottom: 2px;
    }
    .movie-title {
      font-size: 20px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.2;
    }
    .format-pill {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.35);
      color: #38bdf8;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 8px;
      text-transform: uppercase;
    }
    .ticket-body {
      padding: 24px;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      align-items: center;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 14px;
      font-size: 12px;
    }
    .info-label {
      color: #64748b;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 3px;
    }
    .info-val {
      color: #f8fafc;
      font-weight: 700;
      font-size: 13px;
    }
    .hall-name {
      color: #fb7185;
    }
    .show-time {
      color: #fbbf24;
    }
    .seats-val {
      color: #34d399;
      font-size: 15px;
      font-weight: 900;
    }
    .snack-box {
      grid-column: span 2;
      padding-top: 10px;
      border-top: 1px solid #1e293b;
      font-size: 11px;
      color: #cbd5e1;
    }
    .footer-bar {
      grid-column: span 2;
      padding-top: 12px;
      border-top: 1px solid #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ref-code {
      font-family: monospace;
      font-weight: 800;
      color: #e2e8f0;
      font-size: 13px;
    }
    .amount-val {
      font-weight: 900;
      font-size: 15px;
      color: #ffffff;
    }
    .qr-side {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-left: 1px solid #1e293b;
      padding-left: 20px;
    }
    .qr-wrapper {
      background: #ffffff;
      padding: 10px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .qr-caption {
      font-size: 9px;
      color: #94a3b8;
      font-family: monospace;
      letter-spacing: 0.1em;
      margin-top: 8px;
      font-weight: 700;
      text-align: center;
    }
    .print-footer {
      padding: 12px 24px;
      background: #090d16;
      border-top: 1px solid #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="ticket-card">
    <div class="ticket-banner">
      <div class="banner-gradient"></div>
      <div class="banner-content">
        <div>
          <div class="ticket-badge">CineVerse E-Ticket</div>
          <div class="movie-title">${booking.movieTitle}</div>
        </div>
        <div class="format-pill">${booking.format}</div>
      </div>
    </div>

    <div class="ticket-body">
      <div class="info-grid">
        <div>
          <div class="info-label">Cinema Theater</div>
          <div class="info-val">${booking.theaterName}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">${booking.theaterAddress}</div>
        </div>
        <div>
          <div class="info-label">Auditorium / Hall</div>
          <div class="info-val hall-name">${booking.hallName}</div>
        </div>
        <div>
          <div class="info-label">Show Date & Time</div>
          <div class="info-val">${booking.showDate}</div>
          <div class="info-val show-time">${booking.showTime}</div>
        </div>
        <div>
          <div class="info-label">Reserved Seats</div>
          <div class="seats-val">${booking.seats.join(', ')}</div>
        </div>
        ${
          booking.concessions && booking.concessions.length > 0
            ? `<div class="snack-box">
                <div class="info-label">Snacks Ordered</div>
                <div>${snacksText}</div>
              </div>`
            : ''
        }
        <div class="footer-bar">
          <div>
            <div class="info-label">Booking Reference</div>
            <div class="ref-code">${booking.bookingCode}</div>
          </div>
          <div style="text-align: right;">
            <div class="info-label">Amount Paid</div>
            <div class="amount-val">${formatCurrency(booking.totalAmount)}</div>
          </div>
        </div>
      </div>

      <div class="qr-side">
        <div class="qr-wrapper">
          ${qrSvg}
        </div>
        <div class="qr-caption">SCAN AT ENTRANCE</div>
      </div>
    </div>

    <div class="print-footer">
      <span>Official Admission Pass • Non-Transferable</span>
      <span>Customer: ${booking.customer.name}</span>
    </div>
  </div>
</body>
</html>`;
}

export function printOrSaveTicket(booking: Booking): void {
  const html = buildTicketHtml(booking);

  try {
    // Hidden iframe print method (gold standard for printing clean tickets inside modals/web apps)
    const existingFrame = document.getElementById('cineverse-print-iframe');
    if (existingFrame) {
      existingFrame.remove();
    }

    const printIframe = document.createElement('iframe');
    printIframe.id = 'cineverse-print-iframe';
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    printIframe.style.zIndex = '-9999';
    printIframe.style.visibility = 'hidden';

    document.body.appendChild(printIframe);

    const frameDoc = printIframe.contentWindow?.document || printIframe.contentDocument;
    if (frameDoc && printIframe.contentWindow) {
      frameDoc.open();
      frameDoc.write(html);
      frameDoc.close();

      setTimeout(() => {
        try {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
        } catch (frameErr) {
          console.warn('Iframe print failed, falling back to window.print()', frameErr);
          window.print();
        }
      }, 350);

      // Clean up after print dialog finishes
      setTimeout(() => {
        if (printIframe.parentNode) {
          printIframe.parentNode.removeChild(printIframe);
        }
      }, 60000);
      return;
    }
  } catch (err) {
    console.warn('Direct iframe creation failed, using window.print fallback', err);
  }

  // Fallback to standard window.print()
  try {
    window.print();
  } catch (err) {
    console.error('window.print failed:', err);
  }
}
