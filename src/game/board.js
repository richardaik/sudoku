import { boxIndex, SIZE } from './solver.js';

export class Board {
  constructor(puzzle, solution) {
    this.solution = solution;
    this.cells = [];
    for (let row = 0; row < SIZE; row++) {
      const rowCells = [];
      for (let col = 0; col < SIZE; col++) {
        const given = puzzle[row][col];
        rowCells.push({
          value: given || 0,
          isGiven: given !== 0,
          notes: new Set(),
        });
      }
      this.cells.push(rowCells);
    }
  }

  get(row, col) {
    return this.cells[row][col];
  }

  setValue(row, col, value) {
    const cell = this.cells[row][col];
    if (cell.isGiven) return;
    cell.value = value;
    if (value !== 0) cell.notes.clear();
  }

  clearCell(row, col) {
    this.setValue(row, col, 0);
  }

  toggleNote(row, col, num) {
    const cell = this.cells[row][col];
    if (cell.isGiven || cell.value !== 0) return;
    if (cell.notes.has(num)) {
      cell.notes.delete(num);
    } else {
      cell.notes.add(num);
    }
  }

  isCorrect(row, col) {
    const cell = this.cells[row][col];
    if (cell.value === 0) return true;
    return cell.value === this.solution[row][col];
  }

  isFilled(row, col) {
    return this.cells[row][col].value !== 0;
  }

  isSolved() {
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (this.cells[row][col].value !== this.solution[row][col]) return false;
      }
    }
    return true;
  }

  highlightSet(row, col) {
    const set = new Set();
    const selectedBox = boxIndex(row, col);

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const sameRow = r === row;
        const sameCol = c === col;
        const sameBox = boxIndex(r, c) === selectedBox;
        if (sameRow || sameCol || sameBox) {
          set.add(`${r},${c}`);
        }
      }
    }
    return set;
  }

  /** Set of unit keys ("row-N", "col-N", "box-N") that are fully and correctly filled. */
  completedUnits() {
    const units = new Set();

    for (let row = 0; row < SIZE; row++) {
      let complete = true;
      for (let col = 0; col < SIZE; col++) {
        if (!this.isFilled(row, col) || !this.isCorrect(row, col)) { complete = false; break; }
      }
      if (complete) units.add(`row-${row}`);
    }

    for (let col = 0; col < SIZE; col++) {
      let complete = true;
      for (let row = 0; row < SIZE; row++) {
        if (!this.isFilled(row, col) || !this.isCorrect(row, col)) { complete = false; break; }
      }
      if (complete) units.add(`col-${col}`);
    }

    const boxComplete = Array(9).fill(true);
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (!this.isFilled(row, col) || !this.isCorrect(row, col)) {
          boxComplete[boxIndex(row, col)] = false;
        }
      }
    }
    boxComplete.forEach((complete, box) => {
      if (complete) units.add(`box-${box}`);
    });

    return units;
  }

  sameValueSet(row, col) {
    const set = new Set();
    const selectedValue = this.cells[row][col].value;
    if (selectedValue === 0) return set;

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (this.cells[r][c].value === selectedValue) {
          set.add(`${r},${c}`);
        }
      }
    }
    return set;
  }

  toJSON() {
    return this.cells.map((row) =>
      row.map((cell) => ({
        value: cell.value,
        isGiven: cell.isGiven,
        notes: [...cell.notes],
      })),
    );
  }

  static fromJSON(cellsJson, solution) {
    const board = Object.create(Board.prototype);
    board.solution = solution;
    board.cells = cellsJson.map((row) =>
      row.map((cell) => ({
        value: cell.value,
        isGiven: cell.isGiven,
        notes: new Set(cell.notes),
      })),
    );
    return board;
  }
}
