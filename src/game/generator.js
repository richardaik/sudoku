import { canPlace, cloneGrid, countSolutions, emptyGrid, solve } from './solver.js';

const DIFFICULTY_CLUES = {
  easy: 40,
  medium: 32,
  hard: 28,
  expert: 24,
};

function shuffled(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomOrder() {
  return shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9]);
}

function generateFullSolution() {
  const grid = emptyGrid();
  solve(grid, randomOrder);
  return grid;
}

function allCellCoords() {
  const coords = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      coords.push([row, col]);
    }
  }
  return coords;
}

/**
 * Removes cells from a full solution one at a time (randomized order),
 * keeping a removal only if the puzzle still has exactly one solution.
 * Stops once the target clue count is reached or no more cells can be
 * safely removed.
 */
function carvePuzzle(solution, targetClues) {
  const puzzle = cloneGrid(solution);
  const coords = shuffled(allCellCoords());
  let clues = 81;

  for (const [row, col] of coords) {
    if (clues <= targetClues) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    const check = cloneGrid(puzzle);
    const solutions = countSolutions(check, 2);

    if (solutions === 1) {
      clues--;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return puzzle;
}

export function generatePuzzle(difficulty = 'medium') {
  const targetClues = DIFFICULTY_CLUES[difficulty] ?? DIFFICULTY_CLUES.medium;
  const solution = generateFullSolution();
  const puzzle = carvePuzzle(solution, targetClues);
  return { puzzle, solution };
}

export { DIFFICULTY_CLUES, canPlace };
