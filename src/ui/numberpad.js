const PAD_EL = document.getElementById('numberpad');

let onNumberClick = () => {};

export function initNumberpad(handleNumberClick) {
  onNumberClick = handleNumberClick;
  PAD_EL.innerHTML = '';

  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pad-btn';
    btn.textContent = String(n);
    btn.dataset.number = String(n);
    btn.addEventListener('click', () => onNumberClick(n));
    PAD_EL.appendChild(btn);
  }
}

export function renderNumberpad(state) {
  const { board } = state;
  const counts = Array(10).fill(0);
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = board.get(row, col).value;
      if (value !== 0) counts[value]++;
    }
  }

  PAD_EL.querySelectorAll('.pad-btn').forEach((btn) => {
    const n = Number(btn.dataset.number);
    btn.classList.toggle('complete', counts[n] >= 9);
  });
}
