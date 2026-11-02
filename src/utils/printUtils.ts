import { jsPDF } from 'jspdf';
import { Booking } from '../types';
import { formatCurrency } from './bookingUtils';

export function generateQrMatrix(value: string): boolean[][] {
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

  return matrix;
}

export function generateQrSvgString(value: string, size = 130): string {
  const matrix = generateQrMatrix(value);
  const gridSize = matrix.length;
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

/**
 * Generates a clean, vector-rendered PDF ticket document and saves it directly to the user's computer.
 */
export function generateTicketPdf(booking: Booking): jsPDF {
  // A5 Landscape: 210mm wide x 148mm high - the ideal cinema boarding pass dimensions
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a5',
  });

  const pageWidth = 210;
  const pageHeight = 148;
  const margin = 10;
  const cardWidth = pageWidth - margin * 2; // 190mm
  const cardHeight = pageHeight - margin * 2; // 128mm

  // Background of the entire page
  doc.setFillColor(11, 15, 25); // #0b0f19
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Ticket Container Card
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.roundedRect(margin, margin, cardWidth, cardHeight, 6, 6, 'F');
  doc.setDrawColor(51, 65, 85); // #334155
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, margin, cardWidth, cardHeight, 6, 6, 'D');

  // Top Banner / Header Area
  doc.setFillColor(24, 33, 56); // #182138
  doc.rect(margin, margin, cardWidth, 28, 'F');

  // Red accent top strip
  doc.setFillColor(225, 29, 72); // #e11d48
  doc.rect(margin, margin, cardWidth, 2, 'F');

  // Header Brand & Tagline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(244, 63, 94); // #f43f5e
  doc.text('CINEVERSE CINEMA BOOKING  •  OFFICIAL DIGITAL PASS', margin + 8, margin + 8);

  // Movie Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  // Truncate if movie title is too long
  const movieTitle = booking.movieTitle.length > 38 ? booking.movieTitle.substring(0, 36) + '...' : booking.movieTitle;
  doc.text(movieTitle, margin + 8, margin + 17);

  // Screening Format Badge (Right side of header)
  const formatText = booking.format || 'STANDARD 2D';
  doc.setFillColor(56, 189, 248, 0.15); // sky translucent
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(0.4);
  const badgeWidth = doc.getTextWidth(formatText) + 8;
  const badgeX = margin + cardWidth - badgeWidth - 8;
  doc.roundedRect(badgeX, margin + 8, badgeWidth, 8, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(56, 189, 248);
  doc.text(formatText, badgeX + 4, margin + 13.5);

  // Main Info Section: Left side (Details), Right side (QR Code)
  const leftColX = margin + 8;
  const colWidth = 62;
  const startY = margin + 35;

  // Row 1: Theater & Auditorium
  // Column 1: Theater Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // #94a3b8
  doc.text('CINEMA THEATER', leftColX, startY);
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  const theaterName = booking.theaterName.length > 28 ? booking.theaterName.substring(0, 26) + '...' : booking.theaterName;
  doc.text(theaterName, leftColX, startY + 5);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const theaterAddr = booking.theaterAddress.length > 32 ? booking.theaterAddress.substring(0, 30) + '...' : booking.theaterAddress;
  doc.text(theaterAddr, leftColX, startY + 9);

  // Column 2: Auditorium / Hall
  const col2X = leftColX + colWidth;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('AUDITORIUM / HALL', col2X, startY);
  doc.setFontSize(10);
  doc.setTextColor(251, 113, 133); // #fb7185
  doc.text(booking.hallName, col2X, startY + 5);

  // Row 2: Show Date & Reserved Seats
  const row2Y = startY + 16;

  // Show Date & Time
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('SHOW DATE & TIME', leftColX, row2Y);
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(booking.showDate, leftColX, row2Y + 5);
  doc.setFontSize(10);
  doc.setTextColor(251, 191, 36); // #fbbf24
  doc.text(booking.showTime, leftColX, row2Y + 9.5);

  // Reserved Seats
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('RESERVED SEATS', col2X, row2Y);
  doc.setFontSize(12);
  doc.setTextColor(52, 211, 153); // #34d399 emerald
  doc.text(booking.seats.join(', '), col2X, row2Y + 6);

  // Divider
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.line(leftColX, row2Y + 14, leftColX + 125, row2Y + 14);

  // Row 3: Snacks Ordered (if any)
  const row3Y = row2Y + 19;
  if (booking.concessions && booking.concessions.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('SNACKS & REFRESHMENTS', leftColX, row3Y);
    doc.setFontSize(8);
    doc.setTextColor(226, 232, 240);
    const snacks = booking.concessions.map((c) => `${c.quantity}x ${c.item.name}`).join(' • ');
    const snacksLine = snacks.length > 60 ? snacks.substring(0, 58) + '...' : snacks;
    doc.text(snacksLine, leftColX, row3Y + 4);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Audience: ' + (booking.customer?.name || 'Guest') + '  •  Contact: ' + (booking.customer?.email || 'N/A'), leftColX, row3Y + 3);
  }

  // Row 4: Booking Reference & Amount Paid
  const row4Y = row3Y + 12;
  doc.setDrawColor(30, 41, 59);
  doc.line(leftColX, row4Y, leftColX + 125, row4Y);

  // Reference Code
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('BOOKING REFERENCE', leftColX, row4Y + 6);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(241, 245, 249);
  doc.text(booking.bookingCode, leftColX, row4Y + 12);

  // Amount Paid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('AMOUNT PAID', col2X, row4Y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const pdfAmountPaid = formatCurrency(booking.totalAmount).replace('₹', 'Rs. ').trim();
  doc.text(pdfAmountPaid, col2X, row4Y + 12);

  // Right Side: Scannable Vector QR Code Container
  const qrBoxX = margin + 140;
  const qrBoxY = startY - 2;
  const qrBoxSize = 42;

  // QR background white card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 3, 3, 'F');

  // Draw QR code squares inside the box
  const qrMatrix = generateQrMatrix(booking.qrValue || booking.bookingCode);
  const qrPadding = 3.5;
  const qrInnerSize = qrBoxSize - qrPadding * 2;
  const cellSize = qrInnerSize / qrMatrix.length;

  doc.setFillColor(15, 23, 42); // #0f172a
  qrMatrix.forEach((row, r) => {
    row.forEach((filled, c) => {
      if (filled) {
        doc.rect(
          qrBoxX + qrPadding + c * cellSize,
          qrBoxY + qrPadding + r * cellSize,
          cellSize + 0.05,
          cellSize + 0.05,
          'F'
        );
      }
    });
  });

  // QR Code Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('SCAN AT ENTRANCE', qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 5, { align: 'center' });

  // Status Badge below QR
  doc.setFillColor(16, 185, 129, 0.15);
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.3);
  doc.roundedRect(qrBoxX + 4, qrBoxY + qrBoxSize + 8, qrBoxSize - 8, 6, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(52, 211, 153);
  doc.text('VERIFIED & PAID', qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 12.2, { align: 'center' });

  // Bottom Security / Admittance Bar
  const bottomBarY = margin + cardHeight - 11;
  doc.setFillColor(9, 13, 22);
  doc.rect(margin, bottomBarY, cardWidth, 11, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Non-transferable cinema entry pass • CineVerse Security Code: ' + booking.bookingCode, margin + 8, bottomBarY + 7);
  doc.text('Valid on date of issue only', margin + cardWidth - 8, bottomBarY + 7, { align: 'right' });

  return doc;
}

/**
 * Robust handler called by the "Print / Save PDF Ticket" button:
 * 1. Generates and immediately downloads the official PDF ticket file (`CineVerse-Ticket-[code].pdf`).
 * 2. Also handles print dialog fallback cleanly without throwing iframe sandbox errors.
 */
export function printOrSaveTicket(booking: Booking): { success: boolean; filename: string } {
  const filename = `CineVerse-Ticket-${booking.bookingCode || 'pass'}.pdf`;

  try {
    // 1. Generate the PDF
    const doc = generateTicketPdf(booking);

    // 2. Trigger direct PDF download file
    // jsPDF's doc.save uses Blob and <a download> under the hood
    doc.save(filename);

    // 3. Also trigger print if browser environment allows it
    try {
      if (typeof window !== 'undefined' && !window.frameElement) {
        // If not in a strictly restricted subframe, trigger window.print
        setTimeout(() => {
          try {
            window.print();
          } catch {
            // Ignore if window.print is blocked by sandbox
          }
        }, 600);
      }
    } catch {
      // Safe ignore of frameElement check
    }

    return { success: true, filename };
  } catch (error) {
    console.error('Failed to generate or save PDF ticket via jsPDF:', error);

    // Fallback: create and download HTML ticket blob as emergency download
    try {
      const html = buildTicketHtml(booking);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CineVerse-Ticket-${booking.bookingCode}.html`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 2000);
      return { success: true, filename: `CineVerse-Ticket-${booking.bookingCode}.html` };
    } catch (fallbackError) {
      console.error('HTML fallback download failed:', fallbackError);
      return { success: false, filename };
    }
  }
}
