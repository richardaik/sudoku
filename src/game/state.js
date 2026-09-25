import { Board } from './board.js';
import { generatePuzzle } from './generator.js';

const STORAGE_KEY = 'sudoku.game.v1';
const MISTAKE_LIMIT = 3;

export class GameState {
  constructor() {
    this.board = null;
    this.difficulty = 'medium';
    this.elapsedSeconds = 0;
    this.mistakes = 0;
    this.mistakeLimit = MISTAKE_LIMIT;
    this.undoStack = [];
    this.redoStack = [];
    this.selected = null;
    this.notesMode = false;
    this.isGameOver = false;
    this.isSolved = false;
    this.completedUnits = new Set();
    this.pendingFlashUnits = [];
    this.pendingSolvedFlash = false;
  }

  newGame(difficulty = this.difficulty) {
    const { puzzle, solution } = generatePuzzle(difficulty);
    this.board = new Board(puzzle, solution);
    this.difficulty = difficulty;
    this.elapsedSeconds = 0;
    this.mistakes = 0;
    this.undoStack = [];
    this.redoStack = [];
    this.selected = null;
    this.notesMode = false;
    this.isGameOver = false;
    this.isSolved = false;
    this.completedUnits = this.board.completedUnits();
    this.pendingFlashUnits = [];
    this.pendingSolvedFlash = false;
    this.save();
  }

  loadOrNew(defaultDifficulty = 'medium') {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.newGame(defaultDifficulty);
      return;
    }
    try {
      const data = JSON.parse(raw);
      this.board = Board.fromJSON(data.cells, data.solution);
      this.difficulty = data.difficulty;
      this.elapsedSeconds = data.elapsedSeconds;
      this.mistakes = data.mistakes;
      this.mistakeLimit = data.mistakeLimit ?? MISTAKE_LIMIT;
      this.undoStack = data.undoStack ?? [];
      this.redoStack = data.redoStack ?? [];
      this.selected = data.selected ?? null;
      this.notesMode = data.notesMode ?? false;
      this.isGameOver = data.isGameOver ?? false;
      this.isSolved = data.isSolved ?? false;
      this.completedUnits = this.board.completedUnits();
      this.pendingFlashUnits = [];
      this.pendingSolvedFlash = false;
    } catch {
      this.newGame(defaultDifficulty);
    }
  }

  /** Diffs completed units against the last known set, queuing newly-completed ones to flash. */
  refreshCompletedUnits() {
    const nextCompleted = this.board.completedUnits();
    const newlyCompleted = [...nextCompleted].filter((unit) => !this.completedUnits.has(unit));
    this.completedUnits = nextCompleted;
    this.pendingFlashUnits.push(...newlyCompleted);
  }

  save() {
    const data = {
      cells: this.board.toJSON(),
      solution: this.board.solution,
      difficulty: this.difficulty,
      elapsedSeconds: this.elapsedSeconds,
      mistakes: this.mistakes,
      mistakeLimit: this.mistakeLimit,
      undoStack: this.undoStack,
      redoStack: this.redoStack,
      selected: this.selected,
      notesMode: this.notesMode,
      isGameOver: this.isGameOver,
      isSolved: this.isSolved,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  select(row, col) {
    this.selected = [row, col];
  }

  /** Records a move for undo, applies it, checks for mistakes/completion. */
  applyValue(row, col, value) {
    if (this.isGameOver || this.isSolved) return;
    const cell = this.board.get(row, col);
    if (cell.isGiven) return;

    const prevValue = cell.value;
    const prevNotes = [...cell.notes];
    if (prevValue === value) return;

    this.board.setValue(row, col, value);

    const wasWrong = value !== 0 && value !== this.board.solution[row][col];
    if (wasWrong) {
      this.mistakes++;
    }

    this.undoStack.push({ row, col, prevValue, prevNotes, newValue: value, causedMistake: wasWrong });
    this.redoStack = [];

    this.refreshCompletedUnits();

    if (this.mistakes >= this.mistakeLimit) {
      this.isGameOver = true;
    } else if (this.board.isSolved()) {
      this.isSolved = true;
      this.pendingSolvedFlash = true;
    }
  }

  toggleNote(row, col, num) {
    if (this.isGameOver || this.isSolved) return;
    const cell = this.board.get(row, col);
    if (cell.isGiven || cell.value !== 0) return;
    this.board.toggleNote(row, col, num);
  }

  hint(row, col) {
    if (this.isGameOver || this.isSolved) return;
    const cell = this.board.get(row, col);
    if (cell.isGiven) return;
    const correct = this.board.solution[row][col];
    const prevValue = cell.value;
    const prevNotes = [...cell.notes];
    this.board.setValue(row, col, correct);
    this.undoStack.push({ row, col, prevValue, prevNotes, newValue: correct, causedMistake: false });
    this.redoStack = [];
    this.refreshCompletedUnits();
    if (this.board.isSolved()) {
      this.isSolved = true;
      this.pendingSolvedFlash = true;
    }
  }

  undo() {
    const move = this.undoStack.pop();
    if (!move) return;
    const cell = this.board.get(move.row, move.col);
    cell.value = move.prevValue;
    cell.notes = new Set(move.prevNotes);
    if (move.causedMistake) this.mistakes--;
    this.isGameOver = false;
    this.isSolved = this.board.isSolved();
    this.completedUnits = this.board.completedUnits();
    this.redoStack.push(move);
  }

  redo() {
    const move = this.redoStack.pop();
    if (!move) return;
    const cell = this.board.get(move.row, move.col);
    cell.value = move.newValue;
    cell.notes = new Set();
    if (move.causedMistake) this.mistakes++;
    if (this.mistakes >= this.mistakeLimit) {
      this.isGameOver = true;
    } else if (this.board.isSolved()) {
      this.isSolved = true;
    }
    this.completedUnits = this.board.completedUnits();
    this.undoStack.push(move);
  }
}
