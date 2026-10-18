import { SIZE, newGame, move } from './game.js';

const BEST_KEY = '2048-best';
const SWIPE_THRESHOLD = 30;

const els = {
  score: document.getElementById('score'),
  best: document.getElementById('best'),
  cells: document.getElementById('cells'),
  tiles: document.getElementById('tiles'),
  board: document.getElementById('board'),
  overlay: document.getElementById('overlay'),
  overlayTitle: document.getElementById('overlay-title'),
  overlayContinue: document.getElementById('overlay-continue'),
  overlayNew: document.getElementById('overlay-new'),
  newGame: document.getElementById('new-game'),
};

const tileEls = new Map();
let memoryBest = 0;
let state;

function loadBest() {
  try {
    const v = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(v) ? v : memoryBest;
  } catch (e) {
    return memoryBest;
  }
}

function saveBest(best) {
  memoryBest = best;
  try {
    localStorage.setItem(BEST_KEY, String(best));
  } catch (e) {
    // 저장소 접근 불가 시 메모리 값만 사용
  }
}

function buildCells() {
  for (let i = 0; i < SIZE * SIZE; i++) {
    els.cells.appendChild(document.createElement('div'));
  }
}

function tileClass(value) {
  return value > 2048 ? 'tile--super' : `tile--${value}`;
}

function renderTiles() {
  const alive = new Set();
  state.grid.forEach((row, r) => {
    row.forEach((tile, c) => {
      if (!tile) return;
      alive.add(tile.id);
      let el = tileEls.get(tile.id);
      if (!el) {
        el = document.createElement('div');
        el.appendChild(document.createElement('div')).className = 'tile__inner';
        els.tiles.appendChild(el);
        tileEls.set(tile.id, el);
      }
      el.className = `tile ${tileClass(tile.value)}`;
      if (tile.isNew) el.classList.add('tile--new');
      if (tile.merged) el.classList.add('tile--merged');
      el.style.setProperty('--r', r);
      el.style.setProperty('--c', c);
      el.firstChild.textContent = tile.value;
    });
  });
  for (const [id, el] of tileEls) {
    if (!alive.has(id)) {
      el.remove();
      tileEls.delete(id);
    }
  }
}

function showOverlay(title, canContinue) {
  els.overlayTitle.textContent = title;
  els.overlayContinue.hidden = !canContinue;
  els.overlay.hidden = false;
  (canContinue ? els.overlayContinue : els.overlayNew).focus();
}

function hideOverlay() {
  els.overlay.hidden = true;
}

function render() {
  renderTiles();
  els.score.textContent = state.score;
  els.best.textContent = state.best;
}

function startGame() {
  state = newGame(loadBest());
  hideOverlay();
  render();
}

function handleMove(direction) {
  if (!els.overlay.hidden) return;
  const res = move(state, direction);
  if (!res.moved) return;
  const prevBest = state.best;
  state = res.state;
  if (state.best > prevBest) saveBest(state.best);
  render();
  if (state.over) {
    showOverlay('게임 오버', false);
  } else if (state.won && !state.keepPlaying) {
    showOverlay('승리!', true);
  }
}

const KEY_MAP = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  a: 'left', d: 'right', w: 'up', s: 'down',
  A: 'left', D: 'right', W: 'up', S: 'down',
};

function bindKeyboard() {
  document.addEventListener('keydown', (e) => {
    const direction = KEY_MAP[e.key];
    if (!direction || e.ctrlKey || e.metaKey || e.altKey) return;
    // 방향키로 페이지가 스크롤되지 않도록 항상 막는다
    e.preventDefault();
    handleMove(direction);
  });
}

function bindTouch() {
  let startX = 0;
  let startY = 0;
  els.board.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  els.board.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;
    if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? 'right' : 'left');
    else handleMove(dy > 0 ? 'down' : 'up');
  }, { passive: true });
}

function bindButtons() {
  els.newGame.addEventListener('click', startGame);
  els.overlayNew.addEventListener('click', startGame);
  els.overlayContinue.addEventListener('click', () => {
    state.keepPlaying = true;
    hideOverlay();
  });
}

buildCells();
bindKeyboard();
bindTouch();
bindButtons();
startGame();
