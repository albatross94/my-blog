// DOM과 무관한 순수 게임 로직
export const SIZE = 4;

let nextId = 1;

const makeTile = (value, isNew = false) => ({ id: nextId++, value, isNew, merged: false });

// 한 줄을 왼쪽으로 밀고 합친다. 타일 객체 배열(또는 null)을 받는다.
function slideTiles(line) {
  const tiles = line.filter((t) => t !== null);
  const result = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i++) {
    const cur = tiles[i];
    const next = tiles[i + 1];
    if (next && next.value === cur.value) {
      // 병합된 칸은 건너뛰어 한 이동에 한 번만 합쳐지게 한다
      const value = cur.value * 2;
      result.push({ id: cur.id, value, isNew: false, merged: true });
      gained += value;
      i++;
    } else {
      result.push({ id: cur.id, value: cur.value, isNew: false, merged: false });
    }
  }
  while (result.length < SIZE) result.push(null);
  return { line: result, gained };
}

// 숫자 배열용 순수 함수 (검증·테스트 편의)
export function slideLine(line) {
  const res = slideTiles(line.map((v) => (v === 0 ? null : { id: 0, value: v })));
  return { line: res.line.map((t) => (t ? t.value : 0)), gained: res.gained };
}

const transpose = (grid) => grid[0].map((_, c) => grid.map((row) => row[c]));

export function getBoard(state) {
  return state.grid.map((row) => row.map((t) => (t ? t.value : 0)));
}

export function canMove(board) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return true;
      if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return true;
      if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

function addRandomTile(grid) {
  const empty = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c]) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = makeTile(Math.random() < 0.9 ? 2 : 4, true);
}

export function newGame(best = 0) {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  addRandomTile(grid);
  addRandomTile(grid);
  return { grid, score: 0, best, won: false, over: false, keepPlaying: false };
}

// direction: 'left' | 'right' | 'up' | 'down'
// 반환: { state, moved } — 보드가 변하지 않으면 원래 state를 그대로 돌려준다.
export function move(state, direction) {
  const vertical = direction === 'up' || direction === 'down';
  const reverse = direction === 'right' || direction === 'down';

  let rows = vertical ? transpose(state.grid) : state.grid.map((row) => row.slice());
  let gained = 0;
  rows = rows.map((row) => {
    const input = reverse ? row.slice().reverse() : row;
    const res = slideTiles(input);
    gained += res.gained;
    return reverse ? res.line.reverse() : res.line;
  });
  const grid = vertical ? transpose(rows) : rows;

  const before = getBoard(state);
  const after = grid.map((row) => row.map((t) => (t ? t.value : 0)));
  const moved = before.some((row, r) => row.some((v, c) => v !== after[r][c]));
  if (!moved) return { state, moved: false };

  addRandomTile(grid);
  const score = state.score + gained;
  const next = {
    grid,
    score,
    best: Math.max(state.best, score),
    won: state.won,
    over: false,
    keepPlaying: state.keepPlaying,
  };
  const hasWinTile = grid.some((row) => row.some((t) => t && t.value >= 2048));
  if (hasWinTile && !state.won) next.won = true;
  next.over = !canMove(getBoard(next));
  return { state: next, moved: true };
}
