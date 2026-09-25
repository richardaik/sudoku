# Sudoku

A local, single-player Sudoku game that runs entirely in the browser (Node/Vite just serves the static files — no backend, no network calls).

## Requirements

- Node.js 18+ and npm (tested on Ubuntu 24)

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Then open the URL it prints (default: `http://127.0.0.1:5173`) in your browser.

Other scripts:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Features

- Difficulty levels (Easy / Medium / Hard / Expert) via unique-solution puzzle generation
- Click a cell to highlight its row, column, 3x3 box, and all cells sharing the same number
- Wrong entries show in **red bold**; a mistake counter tracks attempts (game over at 3/3)
- Pencil-mark notes mode for jotting candidate numbers
- Timer, undo/redo, and a hint button
- Game state (puzzle, entries, notes, timer, mistakes) persists in the browser's `localStorage`, so refreshing resumes your current game — use "New Game" to start over
- Keyboard support: number keys to enter values, arrow keys to move selection, Backspace/Delete to erase

## Project structure

```
src/
  main.js          # app bootstrap, wires UI to game state
  style.css         # grid, cell, number pad, highlight, error styles
  game/
    generator.js    # puzzle generator (full solution + clue removal by difficulty)
    solver.js        # backtracking solver / uniqueness checker
    board.js         # board cell state (values, givens, notes)
    state.js         # game state, undo/redo, localStorage persistence
  ui/
    grid.js          # 9x9 grid rendering and click/highlight logic
    numberpad.js      # number pad 1-9
    controls.js       # timer, mistake counter, buttons, win/lose banners
```
