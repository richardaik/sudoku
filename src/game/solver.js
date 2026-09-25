const SIZE = 9;
const BOX = 3;

function boxIndex(row, col) {
  return Math.floor(row / BOX) * BOX + Math.floor(col / BOX);
}

export function canPlace(grid, row, col, value) {
  for (let i = 0; i < SIZE; i++) {
    if (grid[row][i] === value) return false;
    if (grid[i][col] === value) return false;
  }
  const boxRow = Math.floor(row / BOX) * BOX;
  const boxCol = Math.floor(col / BOX) * BOX;
  for (let r = boxRow; r < boxRow + BOX; r++) {
    for (let c = boxCol; c < boxCol + BOX; c++) {
      if (grid[r][c] === value) return false;
    }
  }
  return true;
}

function findEmptyCell(grid) {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (grid[row][col] === 0) return [row, col];
    }
  }
  return null;
}

/**
 * Solves the grid in place via backtracking. `order` optionally supplies the
 * candidate order per cell (used by the generator to produce randomized solutions).
 */
export function solve(grid, order = null) {
  const empty = findEmptyCell(grid);
  if (!empty) return true;
  const [row, col] = empty;
  const candidates = order ? order() : [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (const value of candidates) {
    if (canPlace(grid, row, col, value)) {
      grid[row][col] = value;
      if (solve(grid, order)) return true;
      grid[row][col] = 0;
    }
  }
  return false;
}

/**
 * Counts solutions up to `limit` (stops early once reached) — used to verify
 * a puzzle has exactly one solution during generation.
 */
export function countSolutions(grid, limit = 2) {
  let count = 0;

  function backtrack() {
    if (count >= limit) return;
    const empty = findEmptyCell(grid);
    if (!empty) {
      count++;
      return;
    }
    const [row, col] = empty;
    for (let value = 1; value <= 9; value++) {
      if (count >= limit) return;
      if (canPlace(grid, row, col, value)) {
        grid[row][col] = value;
        backtrack();
        grid[row][col] = 0;
      }
    }
  }

  backtrack();
  return count;
}

export function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

export function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

export { boxIndex, SIZE, BOX };
