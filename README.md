# OS Paging Simulator

A React-based interactive visualization tool for simulating and comparing page replacement algorithms used in operating systems memory management.

## Overview

This project demonstrates the implementation of five classic page replacement algorithms commonly studied in Operating Systems courses:

- **FIFO (First-In, First-Out)** — Replaces the oldest page in memory. Simple but can cause page faults unnecessarily (Bélády's anomaly).
- **LRU (Least Recently Used)** — Replaces the page that hasn't been used for the longest time. Balances performance with reasonable overhead.
- **OPTIMAL (Look-Ahead)** — Replaces the page that will not be used for the longest time in the future. Optimal but requires future knowledge.
- **CLOCK (Second Chance)** — Uses a circular pointer and reference bits to give recently-used pages a second chance. Efficient approximation of LRU.
- **LFU (Least Frequently Used)** — Replaces the page with the lowest usage frequency. Considers long-term usage patterns.

## Features

- **Interactive UI** — Set frame capacity, sequence length, and max page value to customize simulations.
- **Run All Algorithms** — Execute all five algorithms at once and compare results side-by-side.
- **Run Individual Algorithms** — Click buttons to run a specific algorithm and see detailed per-step traces.
- **Detailed Traces** — View each step showing the current page reference, frames in memory, and hit/miss status.
- **Summary Statistics** — See total hits and page faults for each algorithm to compare efficiency.
- **Random Generation** — Generate random page reference strings or specify your own.

## Tech Stack

- **React 18** — UI framework for interactive components.
- **Vite** — Fast build tool and dev server.
- **JavaScript** — Algorithm implementations.

## Project Structure

```
.
├── index.html              # Entry point
├── package.json            # Dependencies and scripts
├── README.md               # This file
├── src/
│   ├── main.jsx            # React root render
│   ├── App.jsx             # Main UI component with controls and results display
│   ├── simulator.js        # Algorithm implementations (FIFO, LRU, OPT, CLOCK, LFU)
│   └── index.css           # Styling
└── .gitignore
```

## How to Use

1. **Set Parameters:**
   - Adjust **Capacity** (number of frames in memory, e.g., 3–5).
   - Set **Sequence Length** (number of page references, e.g., 15–20).
   - Specify **Max Page Value** (highest page number that can appear, e.g., 0–9).

2. **Generate Reference String:**
   - Click **Generate Random** to create a random sequence of page references.

3. **Run Simulations:**
   - Click **Run All** to execute all five algorithms on the same reference string.
   - Click **Run FIFO**, **Run LRU**, **Run OPTIMAL**, **Run CLOCK**, or **Run LFU** to run a specific algorithm.

4. **Review Results:**
   - Each algorithm displays a table with step-by-step traces:
     - **Page:** the current page reference.
     - **Frames:** the contents of memory after processing that page.
     - **Status:** whether it was a HIT (page already in memory) or MISS (page fault).
   - At the bottom of each algorithm's section, see **Total Hits** and **Total Faults**.

5. **Compare:**
   - Run different algorithms on the same reference string to see which performs best (fewer faults = better).

## Steps to Run

### Prerequisites
- **Node.js** (v14 or higher) and **npm** installed on your system.

### Installation & Startup

1. **Clone or navigate to the project directory:**
   ```bash
   cd /path/to/OS\ Project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - The terminal will display a URL (typically `http://localhost:5173`). Click on it.


