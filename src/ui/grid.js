import { boxIndex } from '../game/solver.js';

const BOARD_EL = document.getElementById('board');

let onCellClick = () => {};

export function initGrid(handleCellClick) {
  onCellClick = handleCellClick;
  BOARD_EL.innerHTML = '';

  for (let box = 0; box < 9; box++) {
    const boxEl = document.createElement('div');
    boxEl.className = 'box';
    boxEl.dataset.box = String(box);
    BOARD_EL.appendChild(boxEl);
  }

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
      const boxEl = BOARD_EL.querySelector(`.box[data-box="${box}"]`);

      const cellEl = document.createElement('button');
      cellEl.type = 'button';
      cellEl.className = 'cell';
      cellEl.dataset.row = String(row);
      cellEl.dataset.col = String(col);

      const valueEl = document.createElement('span');
      valueEl.className = 'cell-value';
      cellEl.appendChild(valueEl);

      const notesEl = document.createElement('div');
      notesEl.className = 'cell-notes';
      for (let n = 1; n <= 9; n++) {
        const noteEl = document.createElement('span');
        noteEl.className = 'note';
        noteEl.dataset.note = String(n);
        noteEl.textContent = String(n);
        notesEl.appendChild(noteEl);
      }
      cellEl.appendChild(notesEl);

      cellEl.addEventListener('click', () => onCellClick(row, col));
      cellEl.addEventListener('animationend', (event) => {
        if (event.animationName === 'cell-flash') cellEl.classList.remove('flash');
      });
      boxEl.appendChild(cellEl);
    }
  }

  BOARD_EL.addEventListener('animationend', (event) => {
    if (event.animationName === 'board-flash') BOARD_EL.classList.remove('solved-flash');
  });
}

/** Briefly flashes every cell belonging to the given completed units ("row-3", "col-5", "box-8"). */
export function flashUnits(units) {
  if (!units || units.length === 0) return;

  const cellsToFlash = new Set();
  units.forEach((unit) => {
    const [type, idxStr] = unit.split('-');
    const idx = Number(idxStr);
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const matches =
          (type === 'row' && row === idx) ||
          (type === 'col' && col === idx) ||
          (type === 'box' && boxIndex(row, col) === idx);
        if (matches) cellsToFlash.add(`${row},${col}`);
      }
    }
  });

  cellsToFlash.forEach((key) => {
    const [row, col] = key.split(',');
    const cellEl = BOARD_EL.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cellEl.classList.remove('flash');
    void cellEl.offsetWidth;
    cellEl.classList.add('flash');
  });
}

/** Briefly flashes the whole board when the puzzle is fully solved. */
export function flashSolved() {
  BOARD_EL.classList.remove('solved-flash');
  void BOARD_EL.offsetWidth;
  BOARD_EL.classList.add('solved-flash');
}

export function renderGrid(state) {
  const { board, selected, isGameOver, isSolved } = state;
  const highlight = selected ? board.highlightSet(selected[0], selected[1]) : new Set();
  const sameValue = selected ? board.sameValueSet(selected[0], selected[1]) : new Set();
  const locked = isGameOver || isSolved;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cellEl = BOARD_EL.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
      const cell = board.get(row, col);
      const valueEl = cellEl.querySelector('.cell-value');
      const notesEl = cellEl.querySelector('.cell-notes');

      cellEl.classList.toggle('given', cell.isGiven);
      cellEl.classList.toggle(
        'selected',
        !!selected && selected[0] === row && selected[1] === col,
      );
      cellEl.classList.toggle('highlighted', highlight.has(`${row},${col}`));
      cellEl.classList.toggle(
        'same-value',
        !!selected && !(selected[0] === row && selected[1] === col) && sameValue.has(`${row},${col}`),
      );
      cellEl.classList.toggle('locked', locked);
      cellEl.disabled = locked;

      const isError = cell.value !== 0 && !board.isCorrect(row, col);
      cellEl.classList.toggle('error', isError);

      if (cell.value !== 0) {
        valueEl.textContent = String(cell.value);
        notesEl.classList.add('hidden');
      } else {
        valueEl.textContent = '';
        notesEl.classList.remove('hidden');
        notesEl.querySelectorAll('.note').forEach((noteEl) => {
          const n = Number(noteEl.dataset.note);
          noteEl.classList.toggle('active', cell.notes.has(n));
        });
      }
    }
  }
}
