import { GameState } from './game/state.js';
import { initGrid, renderGrid, flashUnits, flashSolved } from './ui/grid.js';
import { initNumberpad, renderNumberpad } from './ui/numberpad.js';
import { renderControls } from './ui/controls.js';

const state = new GameState();
state.loadOrNew('medium');

const difficultyEl = document.getElementById('difficulty');
const notesToggleEl = document.getElementById('notes-toggle');
const eraseEl = document.getElementById('erase');
const undoEl = document.getElementById('undo');
const redoEl = document.getElementById('redo');
const hintEl = document.getElementById('hint');
const newGameEl = document.getElementById('new-game');
const winNewGameEl = document.getElementById('win-new-game');
const loseNewGameEl = document.getElementById('lose-new-game');

difficultyEl.value = state.difficulty;

function render() {
  renderGrid(state);
  renderNumberpad(state);
  renderControls(state);
  state.save();

  if (state.pendingFlashUnits.length) {
    flashUnits(state.pendingFlashUnits);
    state.pendingFlashUnits = [];
  }
  if (state.pendingSolvedFlash) {
    flashSolved();
    state.pendingSolvedFlash = false;
  }
}

function handleCellClick(row, col) {
  state.select(row, col);
  render();
}

function handleNumberClick(n) {
  if (!state.selected) return;
  const [row, col] = state.selected;
  if (state.notesMode) {
    state.toggleNote(row, col, n);
  } else {
    state.applyValue(row, col, n);
  }
  render();
}

initGrid(handleCellClick);
initNumberpad(handleNumberClick);

notesToggleEl.addEventListener('click', () => {
  state.notesMode = !state.notesMode;
  render();
});

eraseEl.addEventListener('click', () => {
  if (!state.selected) return;
  const [row, col] = state.selected;
  state.applyValue(row, col, 0);
  render();
});

undoEl.addEventListener('click', () => {
  state.undo();
  render();
});

redoEl.addEventListener('click', () => {
  state.redo();
  render();
});

hintEl.addEventListener('click', () => {
  if (!state.selected) return;
  const [row, col] = state.selected;
  state.hint(row, col);
  render();
});

function startNewGame() {
  state.newGame(difficultyEl.value);
  render();
}

newGameEl.addEventListener('click', startNewGame);
winNewGameEl.addEventListener('click', startNewGame);
loseNewGameEl.addEventListener('click', startNewGame);

difficultyEl.addEventListener('change', startNewGame);

document.addEventListener('keydown', (event) => {
  if (event.key >= '1' && event.key <= '9') {
    handleNumberClick(Number(event.key));
  } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
    eraseEl.click();
  } else if (state.selected) {
    const [row, col] = state.selected;
    const moves = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    if (moves[event.key]) {
      const [dr, dc] = moves[event.key];
      const newRow = Math.min(8, Math.max(0, row + dr));
      const newCol = Math.min(8, Math.max(0, col + dc));
      handleCellClick(newRow, newCol);
    }
  }
});

setInterval(() => {
  if (!state.isSolved && !state.isGameOver) {
    state.elapsedSeconds++;
    render();
  }
}, 1000);

render();
