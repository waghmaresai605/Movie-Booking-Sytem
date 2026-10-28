import React from 'react';

interface TicketQRCodeProps {
  value: string;
  size?: number;
}

export const TicketQRCode: React.FC<TicketQRCodeProps> = ({ value, size = 160 }) => {
  // Generate a deterministic pseudo-QR code matrix based on the string hash
  const gridSize = 25;
  const matrix: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

  // Corner position detection patterns (7x7 with 1 border)
  const drawCorner = (startR: number, startC: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[startR + r][startC + c] = true;
        }
      }
    }
  };

  drawCorner(0, 0); // Top-left
  drawCorner(0, gridSize - 7); // Top-right
  drawCorner(gridSize - 7, 0); // Bottom-left

  // Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Hash the value to fill interior blocks
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 1; r < gridSize - 1; r++) {
    for (let c = 1; c < gridSize - 1; c++) {
      // Skip corner finder patterns
      if ((r < 8 && c < 8) || (r < 8 && c >= gridSize - 8) || (r >= gridSize - 8 && c < 8)) {
        continue;
      }
      const cellHash = Math.sin((r * 31 + c * 17) ^ hash) * 10000;
      matrix[r][c] = cellHash - Math.floor(cellHash) > 0.45;
    }
  }

  const cellSize = size / gridSize;

  return (
    <div 
      className="bg-white p-3 rounded-xl shadow-lg border border-slate-200 inline-block flex-shrink-0"
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {matrix.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};
