// 렌더링, 입력(Pointer Events), 팔레트/버튼, PNG 저장
import {
  SIZE, PALETTE, createGrid, inBounds, setCell, clearGrid, drawLine, toPngRects, pngFileName,
} from "./editor.js";

const state = {
  grid: createGrid(),
  color: PALETTE[0].value,
  erasing: false,
  drawing: false,
  last: null,
};

const gridEl = document.getElementById("grid");
const paletteEl = document.getElementById("palette");
const currentEl = document.getElementById("current");
const currentNameEl = document.getElementById("current-name");
const eraserEl = document.getElementById("eraser");
const cells = [];

function buildGrid() {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < SIZE * SIZE; i++) {
    const cell = document.createElement("div");
    cell.className = "canvas__cell";
    cells.push(cell);
    frag.append(cell);
  }
  gridEl.append(frag);
}

function renderCell(x, y) {
  const color = state.grid[y][x];
  const cell = cells[y * SIZE + x];
  cell.style.backgroundColor = color || "";
  cell.classList.toggle("canvas__cell--filled", Boolean(color));
}

function renderAll() {
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) renderCell(x, y);
}

function renderCurrent() {
  const item = PALETTE.find((p) => p.value === state.color);
  const name = state.erasing ? "지우개" : item.name;
  currentEl.style.backgroundColor = state.erasing ? "" : state.color;
  currentEl.classList.toggle("current__preview--filled", !state.erasing);
  currentEl.setAttribute("aria-label", `현재 색: ${name}`);
  currentNameEl.textContent = name;
  eraserEl.setAttribute("aria-pressed", String(state.erasing));
  for (const btn of paletteEl.children) {
    btn.setAttribute("aria-pressed", String(!state.erasing && btn.dataset.color === state.color));
  }
}

function buildPalette() {
  for (const { name, value } of PALETTE) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "swatch";
    btn.style.backgroundColor = value;
    btn.dataset.color = value;
    btn.setAttribute("aria-label", name);
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => {
      state.color = value;
      state.erasing = false;
      renderCurrent();
    });
    paletteEl.append(btn);
  }
}

// 격자 영역 좌표로 셀 인덱스를 계산한다 (격자 밖이면 null)
function cellAt(event) {
  const rect = gridEl.getBoundingClientRect();
  const x = Math.floor(((event.clientX - rect.left) / rect.width) * SIZE);
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * SIZE);
  return inBounds(x, y) ? { x, y } : null;
}

function paintTo(pos) {
  if (!pos) {
    // 밖으로 나갔다 돌아올 때 엉뚱한 선이 그어지지 않도록 기준점을 버린다
    state.last = null;
    return;
  }
  const value = state.erasing ? null : state.color;
  const from = state.last || pos;
  const changed = from === pos
    ? (setCell(state.grid, pos.x, pos.y, value) ? [pos] : [])
    : drawLine(state.grid, from.x, from.y, pos.x, pos.y, value);
  for (const { x, y } of changed) renderCell(x, y);
  state.last = pos;
}

function endDraw(event) {
  state.drawing = false;
  state.last = null;
  if (gridEl.hasPointerCapture(event.pointerId)) gridEl.releasePointerCapture(event.pointerId);
}

function bindGrid() {
  gridEl.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    gridEl.setPointerCapture(event.pointerId);
    state.drawing = true;
    state.last = null;
    paintTo(cellAt(event));
  });
  gridEl.addEventListener("pointermove", (event) => {
    if (state.drawing) paintTo(cellAt(event));
  });
  gridEl.addEventListener("pointerup", endDraw);
  gridEl.addEventListener("pointercancel", endDraw);
  gridEl.addEventListener("contextmenu", (event) => event.preventDefault());
}

function savePng() {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE * 16;
  canvas.height = SIZE * 16;
  const ctx = canvas.getContext("2d");
  for (const { x, y, w, h, color } of toPngRects(state.grid)) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pngFileName();
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function bindTools() {
  eraserEl.addEventListener("click", () => {
    state.erasing = !state.erasing;
    renderCurrent();
  });
  document.getElementById("clear").addEventListener("click", () => {
    if (!confirm("모든 칸을 지울까요?")) return;
    clearGrid(state.grid);
    renderAll();
  });
  document.getElementById("save").addEventListener("click", savePng);
}

function init() {
  buildGrid();
  buildPalette();
  bindGrid();
  bindTools();
  renderCurrent();
}

init();
