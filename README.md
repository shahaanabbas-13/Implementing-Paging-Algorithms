# 🚗 Driver Availability Cache Simulator

A React-based interactive visualization tool for simulating and comparing driver caching strategies in ride-sharing systems. This educational project applies classical Operating Systems paging algorithms to real-world scenarios like Uber's driver availability management.

## Overview

This project demonstrates the implementation of six cache replacement algorithms applied to a real-world ride-sharing context:

- **FIFO (First-In, First-Out)** — Removes the oldest driver from the cache. Simple but doesn't account for driver usage patterns.
- **LRU (Least Recently Used)** — Removes the driver who hasn't been assigned a ride recently. Prioritizes keeping active drivers accessible.
- **OPTIMAL (Look-Ahead)** — Removes the driver who will not be requested for the longest time in the future. Theoretically perfect but impossible to implement.
- **CLOCK (Second Chance)** — Uses a circular pointer with reference bits to give recently-used drivers a second chance before eviction. Efficient approximation of LRU.
- **LFU (Least Frequently Used)** — Removes the driver with the lowest ride frequency. Considers long-term usage patterns.
- **MFU (Most Frequently Used)** — Removes the busiest driver, assuming they don't need fast caching. Contrasts with LFU philosophy.

## Real-World Context

In a busy city service area, hundreds of drivers are available but the system can only keep a limited number in active cache for instant matching. When a ride request comes in:

- **Cache Hit** ✓ — Driver found in active cache → instant match (fast response)
- **Cache Miss** ✗ — Driver not in cache → search from secondary storage (slower)

Different eviction strategies significantly impact response times and user experience. This simulator helps visualize the trade-offs.

## Features

- **Interactive Configuration** — Customize max active drivers, number of ride requests, and available driver pool size.
- **Compare All Strategies** — Execute all six algorithms on the same request sequence to compare performance side-by-side.
- **Run Individual Algorithms** — Click buttons to analyze a specific caching strategy in detail.
- **Performance Summary** — View performance metrics for all algorithms with best-performing algorithm highlighted.
- **Step-by-Step Traces** — See detailed tables showing each request, active drivers, hit/miss status, and eviction decisions.
- **Cache Animation** — Interactive slider to visualize cache state changes through each step of the simulation.
- **Eviction Statistics** — View which drivers get evicted most frequently and cache utilization metrics.
- **Real-World Analogies** — Each algorithm explained in ride-sharing context, not abstract OS terminology.

## Tech Stack

- **React 18** — UI framework for interactive components.
- **Vite 5.4** — Fast build tool and dev server.
- **JavaScript (ES6+)** — Algorithm implementations.
- **SVG** — Graph visualizations and cache state rendering.
- **CSS3** — Modern responsive styling with CSS Grid and Flexbox.

## Project Structure

```
.
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── README.md               # This file
├── src/
│   ├── main.jsx            # React application root
│   ├── App.jsx             # Main UI component with simulation controls and analytics
│   ├── simulator.js        # Six algorithm implementations (FIFO, LRU, OPTIMAL, CLOCK, LFU, MFU)
│   └── index.css           # Comprehensive styling with responsive design
└── .gitignore              # Git ignore rules
```

## How to Use

### 1. Configure Simulation Parameters

Set up your simulation with three key parameters:

- **Max Active Drivers in Area** — Number of drivers that fit in cache (like frame capacity). Typical range: 3–10.
- **Ride Request Count** — Total ride requests to simulate in this session. Typical range: 10–50.
- **Driver ID Range (0 to N)** — Total unique drivers available in the system. Determines how many different drivers appear.

### 2. Generate Ride Requests

Click **Generate Ride Requests** to create a random sequence of incoming ride requests. Each request is assigned a random driver ID from the configured range.

### 3. Run Simulations

**Option A: Compare All Strategies**
- Click **Compare All Strategies** to run all six algorithms simultaneously on the same request sequence.
- View performance summary showing hit rates, drivers found, and drivers not found for each algorithm.
- Best-performing algorithm is highlighted with 🏆 badge.

**Option B: Analyze Individual Algorithm**
- Click one of the individual algorithm buttons (FIFO, LRU, OPTIMAL, CLOCK, LFU, MFU) to focus on that strategy.
- See detailed explanation of how the algorithm works.

### 4. Review Results

Each algorithm displays:

- **Performance Metrics:**
  - Drivers Found (Cache Hits) ✓
  - Drivers Not Found (Cache Misses) ✗
  - Success Rate (%)

- **Detailed Step-by-Step Table:**
  - Step number
  - Driver ID being requested
  - Current active drivers in cache
  - Hit/Miss status
  - Eviction explanation (e.g., "Oldest driver D5 removed")

- **Cache Animation:**
  - Interactive slider to visualize cache state at each step
  - See which drivers are in cache and which are empty slots
  - Real-time cache utilization percentage

- **Eviction Statistics:**
  - Average cache utilization across all steps
  - Most frequently evicted driver(s)
  - Bar chart of top 10 evicted drivers

### 5. Compare Algorithms

Use the performance summary grid to quickly compare all algorithms:
- Highest hit rate = best strategy for this workload
- Lowest hit rate = least effective for this workload
- Different workloads may favor different algorithms

## Steps to Run

### Prerequisites
- **Node.js** (v14 or higher) and **npm** installed on your system.

### Installation & Startup

1. **Navigate to the project directory:**
   ```bash
   cd "/home/shahaan/Documents/Shahaan's Docs/Paging Simulator"
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
   - The terminal will display a URL (typically `http://localhost:5173` or similar).
   - Open this URL in your web browser to start using the simulator.

## Learning Outcomes

This simulator helps students understand:

1. **How caching works in real systems** — Not just theoretical, but applied to actual ride-sharing challenges.
2. **Trade-offs between algorithms** — Simplicity vs. performance, memory usage vs. complexity.
3. **Impact of workload patterns** — Same algorithm performs differently on different request sequences.
4. **Hit rate importance** — Small improvements in hit rate translate to significant real-world impact.
5. **Design decisions in production systems** — Why companies choose specific strategies for specific use cases.

## Algorithm Explanations

### FIFO - Queue-Based Eviction
Treats the cache like a queue: first driver in is first driver out. Simple to implement and understand, but doesn't consider how frequently or recently drivers are being used.

**Real-world analogy:** Like a rotating roster where the oldest driver on the list is automatically removed when a new driver joins.

### LRU - Recency-Based Eviction
Tracks the last time each driver was used and evicts the one with the oldest "last used" timestamp. Good balance between performance and complexity.

**Real-world analogy:** Keep drivers who've been active recently; remove those who haven't gotten a ride in a while.

### OPTIMAL - Perfect Future Knowledge
Knowing the entire future sequence of requests, removes the driver that won't be needed for the longest time. Perfect performance but impossible in practice.

**Real-world analogy:** If we could predict all future ride requests perfectly, this would be the ideal strategy.

### CLOCK - Circular Buffer with Second Chance
Uses a circular pointer and reference bits to give recently-used drivers a second chance before eviction. Efficient approximation of LRU without maintaining exact timestamps.

**Real-world analogy:** A "clock hand" rotates through the driver list. Active drivers get marked and get another chance; inactive ones are evicted.

### LFU - Frequency-Based Eviction
Tracks how many rides each driver has been assigned and evicts the driver with the lowest frequency count.

**Real-world analogy:** Remove drivers who rarely get matched with rides; keep the frequently-requested ones.

### MFU - Busy Driver Eviction
Removes the driver with the highest ride frequency. Based on the theory that very busy drivers don't need to be cached (they'll keep getting matches anyway).

**Real-world analogy:** If a driver is getting matched constantly, they don't need to stay in cache.


