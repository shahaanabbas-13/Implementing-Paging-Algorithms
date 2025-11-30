
function deepCopy(arr) { return arr.slice(); }

export function runAll(pages, capacity) {
  return {
    FIFO: implementFIFO(pages, capacity),
    LRU: implementLRU(pages, capacity),
    OPTIMAL: implementOptimal(pages, capacity),
    CLOCK: implementClock(pages, capacity),
    LFU: implementLFU(pages, capacity)
  }
}

function implementFIFO(pages, capacity) {
  const frames = []
  const steps = []
  let faults = 0, hits = 0

  for (const p of pages) {
    let status = 'MISS'
    if (frames.includes(p)) {
      hits++
      status = 'HIT'
    } else {
      faults++
      if (frames.length === capacity) frames.shift()
      frames.push(p)
    }
    steps.push({ page: p, frames: deepCopy(frames), status })
  }
  return { steps, hits, faults }
}

function implementLRU(pages, capacity) {
  const frames = []
  const steps = []
  let faults = 0, hits = 0

  for (const p of pages) {
    let status = 'MISS'
    if (frames.includes(p)) {
      hits++
      status = 'HIT'
      // move to most recent
      const idx = frames.indexOf(p)
      frames.splice(idx, 1)
      frames.push(p)
    } else {
      faults++
      if (frames.length === capacity) frames.shift()
      frames.push(p)
    }
    steps.push({ page: p, frames: deepCopy(frames), status })
  }
  return { steps, hits, faults }
}

function implementOptimal(pages, capacity) {
  const frames = []
  const steps = []
  let faults = 0, hits = 0

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i]
    let status = 'MISS'
    if (frames.includes(p)) {
      hits++
      status = 'HIT'
    } else {
      faults++
      if (frames.length < capacity) {
        frames.push(p)
      } else {
        let farthestIndex = -1
        let victimIndex = -1
        for (let j = 0; j < frames.length; j++) {
          const value = frames[j]
          let nextOccurrence = Infinity
          for (let k = i + 1; k < pages.length; k++) {
            if (pages[k] === value) { nextOccurrence = k; break }
          }
          if (nextOccurrence > farthestIndex) { farthestIndex = nextOccurrence; victimIndex = j }
        }
        frames[victimIndex] = p
      }
    }
    steps.push({ page: p, frames: deepCopy(frames), status })
  }
  return { steps, hits, faults }
}

function implementClock(pages, capacity) {
  const frames = new Array(capacity).fill(-1)
  const secondChance = new Array(capacity).fill(false)
  let pointer = 0
  let size = 0
  const steps = []
  let faults = 0, hits = 0

  for (const p of pages) {
    let status = 'MISS'
    let found = false
    for (let i = 0; i < capacity; i++) {
      if (frames[i] === p) { found = true; secondChance[i] = true; hits++; status = 'HIT'; break }
    }
    if (!found) {
      faults++
      while (true) {
        if (size < capacity) {
          frames[size] = p
          size++
          break
        }
        if (secondChance[pointer]) {
          secondChance[pointer] = false
          pointer = (pointer + 1) % capacity
        } else {
          frames[pointer] = p
          secondChance[pointer] = false
          pointer = (pointer + 1) % capacity
          break
        }
      }
    }
    const printable = frames.filter(f => f !== -1)
    steps.push({ page: p, frames: deepCopy(printable), status })
  }
  return { steps, hits, faults }
}

function implementLFU(pages, capacity) {
  const frames = []
  const freq = new Map()
  const steps = []
  let faults = 0, hits = 0

  for (const p of pages) {
    let status = 'MISS'
    if (frames.includes(p)) {
      hits++
      status = 'HIT'
      freq.set(p, (freq.get(p) || 0) + 1)
    } else {
      faults++
      if (frames.length < capacity) {
        frames.push(p)
        freq.set(p, 1)
      } else {
        let minFreq = Infinity
        let victimIndex = -1
        for (let i = 0; i < frames.length; i++) {
          const f = frames[i]
          const fv = freq.get(f) || 0
          if (fv < minFreq) { minFreq = fv; victimIndex = i }
        }
        const victimVal = frames[victimIndex]
        frames.splice(victimIndex, 1)
        freq.delete(victimVal)
        frames.push(p)
        freq.set(p, 1)
      }
    }
    steps.push({ page: p, frames: deepCopy(frames), status })
  }
  return { steps, hits, faults }
}

// Export individual algorithm runners so the UI can call them separately.
export const runFIFO = implementFIFO
export const runLRU = implementLRU
export const runOptimal = implementOptimal
export const runClock = implementClock
export const runLFU = implementLFU

export default { runAll }
