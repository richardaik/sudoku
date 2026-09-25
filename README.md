# Sudoku

A local, single-player Sudoku game that runs entirely in the browser (Node/Vite just serves the static files — no backend, no network calls).

## Requirements

- Node.js 18+ and npm (tested on Ubuntu 24)

## Setup

```bash
npm install
```

## Run

### Development server

```bash
npm run dev
```

Then open the URL it prints (default: `http://127.0.0.1:5173`) in your browser.

To make it reachable from other devices on your local network (e.g. testing on your phone), pass `--host`:

```bash
npm run dev -- --host
```

Vite will print both the local URL and a `Network` URL (e.g. `http://192.168.1.23:5173`) — open that from another device on the same Wi-Fi/LAN.

### Production build + static server

For a hosted, non-dev build:

```bash
npm run build     # bundles the app into dist/
npm run preview   # serves dist/ locally, same flags as `dev`
```

`dist/` is a plain set of static files (HTML/CSS/JS), so once built you can also serve it with any static file server instead of `vite preview`, for example:

```bash
npx serve dist          # https://www.npmjs.com/package/serve
# or
python3 -m http.server 8000 --directory dist
```

Then open `http://localhost:<port>` in your browser.

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
