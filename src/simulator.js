
function deepCopy(arr) { return arr.slice(); }

export function runAll(drivers, capacity) {
  return {
    FIFO: implementFIFO(drivers, capacity),
    LRU: implementLRU(drivers, capacity),
    OPTIMAL: implementOptimal(drivers, capacity),
    CLOCK: implementClock(drivers, capacity),
    LFU: implementLFU(drivers, capacity),
    MFU: implementMFU(drivers, capacity)
  }
}

function implementFIFO(drivers, capacity) {
  const cache = []
  const steps = []
  let hits = 0, misses = 0

  for (const d of drivers) {
    let status = 'HIT'
    let explanation = `Driver D${d} is in active zone`
    
    if (cache.includes(d)) {
      hits++
    } else {
      misses++
      status = 'MISS'
      if (cache.length === capacity) {
        const removed = cache.shift()
        explanation = `Zone full. Removed driver D${removed} (oldest active). Added driver D${d}`
      } else {
        explanation = `Driver D${d} not in zone. Added to active drivers`
      }
      cache.push(d)
    }
    steps.push({ driver: d, cache: deepCopy(cache), status, explanation })
  }
  
  const hitRate = drivers.length > 0 ? ((hits / drivers.length) * 100).toFixed(2) : 0
  return { steps, hits, misses: drivers.length - hits, hitRate }
}

function implementLRU(drivers, capacity) {
  const cache = []
  const steps = []
  let hits = 0, misses = 0

  for (const d of drivers) {
    let status = 'HIT'
    let explanation = `Driver D${d} is in active zone (refreshed)`
    
    if (cache.includes(d)) {
      hits++
      const idx = cache.indexOf(d)
      cache.splice(idx, 1)
      cache.push(d)
    } else {
      misses++
      status = 'MISS'
      if (cache.length === capacity) {
        const removed = cache.shift()
        explanation = `Zone full. Removed idle driver D${removed}. Added driver D${d}`
      } else {
        explanation = `Driver D${d} not in zone. Added to active drivers`
      }
      cache.push(d)
    }
    steps.push({ driver: d, cache: deepCopy(cache), status, explanation })
  }
  
  const hitRate = drivers.length > 0 ? ((hits / drivers.length) * 100).toFixed(2) : 0
  return { steps, hits, misses: drivers.length - hits, hitRate }
}

function implementOptimal(drivers, capacity) {
  const cache = []
  const steps = []
  let hits = 0, misses = 0

  for (let i = 0; i < drivers.length; i++) {
    const d = drivers[i]
    let status = 'HIT'
    let explanation = `Driver D${d} is in active zone`
    
    if (cache.includes(d)) {
      hits++
    } else {
      misses++
      status = 'MISS'
      if (cache.length < capacity) {
        explanation = `Driver D${d} not in zone. Added to active drivers`
        cache.push(d)
      } else {
        let farthestIndex = -1
        let victimIndex = -1
        
        for (let j = 0; j < cache.length; j++) {
          const driver = cache[j]
          let nextOccurrence = Infinity
          for (let k = i + 1; k < drivers.length; k++) {
            if (drivers[k] === driver) { nextOccurrence = k; break }
          }
          if (nextOccurrence > farthestIndex) { 
            farthestIndex = nextOccurrence
            victimIndex = j 
          }
        }
        
        const removed = cache[victimIndex]
        cache[victimIndex] = d
        explanation = `Zone full. Removed driver D${removed} (least needed). Added driver D${d}`
      }
    }
    steps.push({ driver: d, cache: deepCopy(cache), status, explanation })
  }
  
  const hitRate = drivers.length > 0 ? ((hits / drivers.length) * 100).toFixed(2) : 0
  return { steps, hits, misses: drivers.length - hits, hitRate }
}

function implementLFU(drivers, capacity) {
  const cache = []
  const freq = new Map()
  const steps = []
  let hits = 0, misses = 0

  for (const d of drivers) {
    let status = 'HIT'
    let explanation = `Driver D${d} is in active zone`
    
    if (cache.includes(d)) {
      hits++
      freq.set(d, (freq.get(d) || 0) + 1)
      explanation = `Driver D${d} found. Ride count: ${freq.get(d)}`
    } else {
      misses++
      status = 'MISS'
      if (cache.length < capacity) {
        explanation = `Driver D${d} not in zone. Added to active drivers`
        cache.push(d)
        freq.set(d, 1)
      } else {
        let minFreq = Infinity
        let victimIndex = -1
        
        for (let i = 0; i < cache.length; i++) {
          const f = cache[i]
          const fv = freq.get(f) || 0
          if (fv < minFreq) { minFreq = fv; victimIndex = i }
        }
        
        const removed = cache[victimIndex]
        cache.splice(victimIndex, 1)
        freq.delete(removed)
        cache.push(d)
        freq.set(d, 1)
        explanation = `Zone full. Removed least active driver D${removed} (${minFreq} rides). Added driver D${d}`
      }
    }
    steps.push({ driver: d, cache: deepCopy(cache), status, explanation })
  }
  
  const hitRate = drivers.length > 0 ? ((hits / drivers.length) * 100).toFixed(2) : 0
  return { steps, hits, misses: drivers.length - hits, hitRate }
}

function implementMFU(drivers, capacity) {
  const cache = []
  const freq = new Map()
  const steps = []
  let hits = 0, misses = 0

  for (const d of drivers) {
    let status = 'HIT'
    let explanation = `Driver D${d} is in active zone`
    
    if (cache.includes(d)) {
      hits++
      freq.set(d, (freq.get(d) || 0) + 1)
      explanation = `Driver D${d} found. Ride count: ${freq.get(d)}`
    } else {
      misses++
      status = 'MISS'
      if (cache.length < capacity) {
        explanation = `Driver D${d} not in zone. Added to active drivers`
        cache.push(d)
        freq.set(d, 1)
      } else {
        let maxFreq = -1
        let victimIndex = -1
        
        for (let i = 0; i < cache.length; i++) {
          const f = cache[i]
          const fv = freq.get(f) || 0
          if (fv > maxFreq) { maxFreq = fv; victimIndex = i }
        }
        
        const removed = cache[victimIndex]
        cache.splice(victimIndex, 1)
        freq.delete(removed)
        cache.push(d)
        freq.set(d, 1)
        explanation = `Zone full. Removed overworked driver D${removed} (too busy, ${maxFreq} rides). Added driver D${d}`
      }
    }
    steps.push({ driver: d, cache: deepCopy(cache), status, explanation })
  }
  
  const hitRate = drivers.length > 0 ? ((hits / drivers.length) * 100).toFixed(2) : 0
  return { steps, hits, misses: drivers.length - hits, hitRate }
}

function implementClock(drivers, capacity) {
  const cache = new Array(capacity).fill(-1)
  const referenceBit = new Array(capacity).fill(false)
  let pointer = 0
  let size = 0
  const steps = []
  let hits = 0, misses = 0

  for (const d of drivers) {
    let status = 'HIT'
    let explanation = `Driver D${d} is in active zone`
    let found = false
    
    for (let i = 0; i < capacity; i++) {
      if (cache[i] === d) { 
        found = true
        referenceBit[i] = true
        hits++
        explanation = `Driver D${d} found. Marked as active`
        break 
      }
    }
    
    if (!found) {
      misses++
      status = 'MISS'
      
      while (true) {
        if (size < capacity) {
          cache[size] = d
          referenceBit[size] = true
          size++
          explanation = `Driver D${d} added to active drivers`
          break
        }
        
        if (referenceBit[pointer]) {
          referenceBit[pointer] = false
          explanation = `Driver D${cache[pointer]} gets second chance. Rotating...`
          pointer = (pointer + 1) % capacity
        } else {
          const removed = cache[pointer]
          cache[pointer] = d
          referenceBit[pointer] = true
          explanation = `Zone full. Removed inactive driver D${removed}. Added driver D${d}`
          pointer = (pointer + 1) % capacity
          break
        }
      }
    }
    
    const printable = cache.filter(f => f !== -1)
    steps.push({ driver: d, cache: deepCopy(printable), status, explanation })
  }
  
  const hitRate = drivers.length > 0 ? ((hits / drivers.length) * 100).toFixed(2) : 0
  return { steps, hits, misses: drivers.length - hits, hitRate }
}

export const runFIFO = implementFIFO
export const runLRU = implementLRU
export const runOptimal = implementOptimal
export const runClock = implementClock
export const runLFU = implementLFU
export const runMFU = implementMFU

export default { runAll }
