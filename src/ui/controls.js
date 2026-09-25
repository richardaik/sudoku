const timerEl = document.getElementById('timer');
const mistakesEl = document.getElementById('mistakes');
const notesToggleEl = document.getElementById('notes-toggle');
const undoEl = document.getElementById('undo');
const redoEl = document.getElementById('redo');
const winBannerEl = document.getElementById('win-banner');
const winTimeEl = document.getElementById('win-time');
const loseBannerEl = document.getElementById('lose-banner');

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function renderControls(state) {
  timerEl.textContent = formatTime(state.elapsedSeconds);
  mistakesEl.textContent = `${state.mistakes}/${state.mistakeLimit}`;

  notesToggleEl.textContent = state.notesMode ? 'Notes: On' : 'Notes: Off';
  notesToggleEl.setAttribute('aria-pressed', String(state.notesMode));
  notesToggleEl.classList.toggle('active', state.notesMode);

  undoEl.disabled = state.undoStack.length === 0;
  redoEl.disabled = state.redoStack.length === 0;

  winBannerEl.classList.toggle('hidden', !state.isSolved);
  if (state.isSolved) {
    winTimeEl.textContent = `Time: ${formatTime(state.elapsedSeconds)}`;
  }

  loseBannerEl.classList.toggle('hidden', !state.isGameOver);
}
