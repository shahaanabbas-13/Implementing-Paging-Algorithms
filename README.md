# OS Paging Simulator (React UI)

This small project provides a React-based UI to visualize page replacement algorithms (FIFO, LRU, Optimal, Clock, LFU). The simulator logic is a translation of an existing Java implementation into JavaScript.

Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the address shown by Vite (usually `http://localhost:5173`).

Files of interest

- `src/simulator.js` — implementations of the algorithms and the `runAll` helper.
- `src/App.jsx` — the React UI and controls.

Next steps (optional)

- Add step-by-step animation.
- Allow custom reference string input.
- Export simulation traces as CSV.
