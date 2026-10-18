// DOM과 무관한 순수 로직: 격자 상태, 칠하기, 선 보간, PNG용 데이터 생성
export const SIZE = 16;
export const PNG_CELL = 16;

export const PALETTE = [
  { name: "검정", value: "#000000" },
  { name: "짙은 회색", value: "#555555" },
  { name: "회색", value: "#9e9e9e" },
  { name: "흰색", value: "#ffffff" },
  { name: "빨강", value: "#e53935" },
  { name: "주황", value: "#fb8c00" },
  { name: "노랑", value: "#fdd835" },
  { name: "연두", value: "#9ccc65" },
  { name: "초록", value: "#2e7d32" },
  { name: "청록", value: "#00acc1" },
  { name: "하늘", value: "#64b5f6" },
  { name: "파랑", value: "#1e40af" },
  { name: "보라", value: "#8e24aa" },
  { name: "분홍", value: "#f48fb1" },
  { name: "갈색", value: "#6d4c41" },
  { name: "살색", value: "#ffcc99" },
];

export function createGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

export function inBounds(x, y) {
  return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < SIZE && y < SIZE;
}

// 값이 바뀌었을 때만 true를 반환해 불필요한 재렌더링을 피한다
export function setCell(grid, x, y, color) {
  if (!inBounds(x, y) || grid[y][x] === color) return false;
  grid[y][x] = color;
  return true;
}

export function clearGrid(grid) {
  for (const row of grid) row.fill(null);
}

// Bresenham 직선: 시작·끝 셀을 포함한 좌표 목록
export function line(x0, y0, x1, y1) {
  const points = [];
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  for (;;) {
    points.push({ x, y });
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
  return points;
}

export function drawLine(grid, x0, y0, x1, y1, color) {
  const changed = [];
  for (const { x, y } of line(x0, y0, x1, y1)) {
    if (setCell(grid, x, y, color)) changed.push({ x, y });
  }
  return changed;
}

// 칠해진 셀만 PNG 사각형으로 변환 (빈 셀은 투명 유지)
export function toPngRects(grid) {
  const rects = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const color = grid[y][x];
      if (color) rects.push({ x: x * PNG_CELL, y: y * PNG_CELL, w: PNG_CELL, h: PNG_CELL, color });
    }
  }
  return rects;
}

export function pngFileName(date = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  const day = `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}`;
  const time = `${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`;
  return `pixel-art-${day}-${time}.png`;
}
