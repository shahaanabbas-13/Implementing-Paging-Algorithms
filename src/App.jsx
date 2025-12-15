import React, { useState } from 'react'
import { runAll, runFIFO, runLRU, runOptimal, runClock, runLFU, runMFU } from './simulator'

function randomDrivers(len, maxVal=99){
  const r = []
  for(let i=0;i<len;i++) r.push(Math.floor(Math.random()*(maxVal+1)))
  return r
}

// Calculate analytics from results
function calculateAnalytics(results) {
  const analytics = {}
  
  for (const [algo, result] of Object.entries(results)) {
    const evictions = {}
    let cacheUtilization = 0
    let cumulativeHitRate = []
    let hits = 0
    
    result.steps.forEach((step, idx) => {
      // Calculate cumulative hit rate
      if (step.status === 'HIT') hits++
      cumulativeHitRate.push((hits / (idx + 1) * 100).toFixed(2))
      
      // Cache utilization
      cacheUtilization += step.cache.length
      
      // Track evictions
      if (step.status === 'MISS' && step.cache.length > 0) {
        const prevCache = idx > 0 ? result.steps[idx - 1].cache : []
        prevCache.forEach(d => {
          if (!step.cache.includes(d)) {
            evictions[d] = (evictions[d] || 0) + 1
          }
        })
      }
    })
    
    analytics[algo] = {
      cumulativeHitRate,
      avgCacheUtilization: (cacheUtilization / result.steps.length).toFixed(2),
      evictions,
      mostEvictedDriver: Object.entries(evictions).sort((a, b) => b[1] - a[1])[0] || null
    }
  }
  
  return analytics
}

// Performance graph component
function PerformanceGraph({ analytics, algorithms }) {
  const maxSteps = Math.max(...algorithms.filter(algo => analytics[algo]).map(a => analytics[a].cumulativeHitRate.length))
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  
  return (
    <div className="performance-graph">
      <h3>📊 Hit Rate Progression Over Time</h3>
      <svg viewBox={`0 0 1000 400`} className="graph-svg">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line key={`hline-${y}`} x1="80" x2="950" y1={380 - y * 3} y2={380 - y * 3} stroke="#e0e0e0" strokeWidth="1" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`vline-${i}`} x1={80 + i * 87} y1="20" y2="380" stroke="#e0e0e0" strokeWidth="1" />
        ))}
        
        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map(y => (
          <text key={`ylabel-${y}`} x="60" y={385 - y * 3} textAnchor="end" fontSize="12" fill="#666">{y}%</text>
        ))}
        
        {/* X-axis label */}
        <text x="500" y="395" textAnchor="middle" fontSize="12" fill="#666">Request Number</text>
        
        {/* Y-axis label */}
        <text x="20" y="200" textAnchor="middle" fontSize="12" fill="#666" transform="rotate(-90 20 200)">Hit Rate %</text>
        
        {/* Lines for each algorithm */}
        {algorithms.map((algo, colorIdx) => {
          if (!analytics[algo]) return null
          
          const data = analytics[algo].cumulativeHitRate
          const color = colors[colorIdx % colors.length]
          
          if (data.length === 0) return null
          
          let path = ''
          data.forEach((rate, idx) => {
            const x = 80 + (idx / (maxSteps - 1 || 1)) * 870
            const y = 380 - (parseFloat(rate) / 100) * 360
            path += (idx === 0 ? 'M' : 'L') + ` ${x} ${y}`
          })
          
          const endX = 80 + ((data.length - 1) / (maxSteps - 1 || 1)) * 870
          const endY = 380 - (parseFloat(data[data.length - 1]) / 100) * 360
          
          return (
            <g key={`line-${algo}`}>
              <path d={path} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
              <circle cx={endX} cy={endY} r="5" fill={color} stroke="white" strokeWidth="2" />
            </g>
          )
        })}
      </svg>
      
      <div className="graph-legend">
        {algorithms.map((algo, idx) => {
          if (!analytics[algo]) return null
          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
          const color = colors[idx % colors.length]
          const finalRate = analytics[algo].cumulativeHitRate[analytics[algo].cumulativeHitRate.length - 1]
          return (
            <div key={algo} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: color }}></span>
              <span>{algo} - Final: {finalRate}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Cache visualization component
function CacheVisualization({ result, cacheSize }) {
  const [currentStep, setCurrentStep] = useState(result.steps.length - 1)
  const step = result.steps[currentStep]
  
  return (
    <div className="cache-viz">
      <div className="viz-header">
        <h4>🎬 Cache Animation - Step {currentStep + 1}/{result.steps.length}</h4>
        <input 
          type="range" 
          min="0" 
          max={result.steps.length - 1} 
          value={currentStep}
          onChange={(e) => setCurrentStep(Number(e.target.value))}
          className="viz-slider"
        />
      </div>
      
      <div className="cache-visualization">
        <div className="cache-slots">
          {Array.from({ length: cacheSize }).map((_, i) => (
            <div 
              key={i}
              className={`cache-slot ${i < step.cache.length ? 'filled' : 'empty'}`}
              title={i < step.cache.length ? `Driver D${step.cache[i]}` : 'Empty'}
            >
              {i < step.cache.length ? `D${step.cache[i]}` : '—'}
            </div>
          ))}
        </div>
        <div className="viz-info">
          <p><strong>Request:</strong> Driver D{step.driver}</p>
          <p><strong>Status:</strong> <span className={step.status === 'HIT' ? 'status-found' : 'status-not-found'}>
            {step.status === 'HIT' ? '✓ FOUND' : '✗ NOT FOUND'}
          </span></p>
          <p><strong>Cache Usage:</strong> {step.cache.length}/{cacheSize} ({((step.cache.length/cacheSize)*100).toFixed(0)}%)</p>
          <p><strong>Action:</strong> {step.explanation}</p>
        </div>
      </div>
    </div>
  )
}

// Eviction statistics component
function EvictionStats({ analytics, algo }) {
  const data = analytics[algo]
  const sortedEvictions = Object.entries(data.evictions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  
  return (
    <div className="eviction-stats">
      <h4>🚫 Eviction Statistics</h4>
      <div className="stats-content">
        <div className="stat-item">
          <span className="stat-label">Avg Cache Utilization:</span>
          <span className="stat-value">{data.avgCacheUtilization}%</span>
        </div>
        {data.mostEvictedDriver && (
          <div className="stat-item">
            <span className="stat-label">Most Evicted Driver:</span>
            <span className="stat-value">D{data.mostEvictedDriver[0]} ({data.mostEvictedDriver[1]}x)</span>
          </div>
        )}
        
        <div className="eviction-chart">
          <h5>Top Evicted Drivers:</h5>
          {sortedEvictions.length > 0 ? (
            <div className="bar-chart">
              {sortedEvictions.map(([driver, count]) => {
                const maxCount = Math.max(...sortedEvictions.map(e => e[1]))
                const width = (count / maxCount) * 100
                return (
                  <div key={driver} className="bar-item">
                    <span className="bar-label">D{driver}</span>
                    <div className="bar" style={{ width: `${width}%` }}>
                      <span className="bar-value">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="no-data">No drivers evicted</p>
          )}
        </div>
      </div>
    </div>
  )
}

function AlgorithmResult({ name, result, allResults, cacheSize, analytics }){
  if(!result) return null
  
  const bestHitRate = allResults ? Math.max(...Object.values(allResults).map(r => parseFloat(r.hitRate))) : 0
  const isBest = parseFloat(result.hitRate) === bestHitRate && bestHitRate > 0
  
  return (
    <div className={`card alg-section ${isBest ? 'best-algorithm' : ''}`}>
      <div className="alg-header">
        <h3>{name}</h3>
        {isBest && <span className="best-badge">🏆 Best Performance</span>}
      </div>
      
      <div className="metrics">
        <div className="metric">
          <span className="metric-label">Drivers Found:</span>
          <span className="metric-value hits">{result.hits}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Drivers Not Found:</span>
          <span className="metric-value misses">{result.misses}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Success Rate:</span>
          <span className="metric-value rate">{result.hitRate}%</span>
        </div>
      </div>

      {cacheSize && <CacheVisualization result={result} cacheSize={cacheSize} />}
      {analytics && <EvictionStats analytics={analytics} algo={name} />}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Step</th>
              <th>Driver</th>
              <th>Available Drivers</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {result.steps.map((s, idx) => (
              <tr key={idx} className={`step-${s.status.toLowerCase()}`}>
                <td className="step-number">{idx + 1}</td>
                <td className="driver-id">D{s.driver}</td>
                <td className="cache-state">[{s.cache.length ? s.cache.map(d => `D${d}`).join(', ') : 'empty'}]</td>
                <td className={s.status==='HIT'? 'status-hit':'status-miss'}>{s.status === 'HIT' ? 'FOUND' : 'NOT FOUND'}</td>
                <td className="explanation">{s.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function App(){
  const [cacheSize, setCacheSize] = useState(4)
  const [numDrivers, setNumDrivers] = useState(10)
  const [driverCount, setDriverCount] = useState(9)
  const [drivers, setDrivers] = useState(randomDrivers(10, 9))
  const [results, setResults] = useState(null)
  const [expandedAlgo, setExpandedAlgo] = useState(null)

  function handleGenerateDrivers(){
    const d = randomDrivers(Number(numDrivers), Number(driverCount))
    setDrivers(d)
    setResults(null)
  }

  function handleRunAll(){
    const res = runAll(drivers, Number(cacheSize))
    setResults(res)
  }

  function handleRunSingle(algo){
    let res = null
    const cap = Number(cacheSize)
    switch(algo){
      case 'FIFO': res = runFIFO(drivers, cap); break
      case 'LRU': res = runLRU(drivers, cap); break
      case 'OPTIMAL': res = runOptimal(drivers, cap); break
      case 'CLOCK': res = runClock(drivers, cap); break
      case 'LFU': res = runLFU(drivers, cap); break
      case 'MFU': res = runMFU(drivers, cap); break
      default: return
    }
    setResults({ [algo]: res })
  }

  const algorithmInfo = {
    FIFO: {
      title: 'FIFO - Queue-Based Eviction',
      description: 'Removes the oldest driver entry, regardless of usage patterns.',
      realWorld: 'Treats driver cache like a queue. First driver added is first to be removed when space is needed.'
    },
    LRU: {
      title: 'LRU - Recency-Based Eviction',
      description: 'Removes the driver who hasn\'t been assigned a ride recently.',
      realWorld: 'Prioritizes keeping recently active drivers. Tracks last ride timestamp and evicts the oldest.'
    },
    OPTIMAL: {
      title: 'OPTIMAL - Perfect Future Knowledge',
      description: 'Removes the driver who will not get a ride for the longest time in the future.',
      realWorld: 'Theoretically optimal but impossible - would require predicting future ride patterns perfectly.'
    },
    CLOCK: {
      title: 'CLOCK - Circular Buffer with Chances',
      description: 'Gives drivers a second chance using a circular clock pointer and reference bits.',
      realWorld: 'Uses a "clock hand" to cycle through cache. Drivers get one more chance if recently used, then evicted.'
    },
    LFU: {
      title: 'LFU - Frequency-Based Eviction',
      description: 'Removes the driver who has gotten the fewest rides.',
      realWorld: 'Tracks ride frequency. Removes the driver with the lowest ride count when cache is full.'
    },
    MFU: {
      title: 'MFU - Busy Driver Eviction',
      description: 'Removes the driver who gets too many rides.',
      realWorld: 'Assumes very busy drivers don\'t need fast caching. Removes the most frequently used driver.'
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🚗 Driver Availability Cache Simulator</h1>
          <p>Real-world implementation of caching strategies in ride-sharing systems</p>
        </div>
      </header>

      <div className="container">
        <section className="control-section card">
          <h2>Configure Driver Cache Simulation</h2>
          <div className="controls-grid">
            <div className="control-group">
              <label htmlFor="cache-size">Max Active Drivers in Area:</label>
              <input 
                id="cache-size"
                type="number" 
                min="1" 
                max="20"
                value={cacheSize} 
                onChange={e=>setCacheSize(Number(e.target.value))} 
              />
              <small>Maximum active drivers that can be cached at one time in a service area</small>
            </div>
            
            <div className="control-group">
              <label htmlFor="num-drivers">Ride Request Count:</label>
              <input 
                id="num-drivers"
                type="number" 
                min="1" 
                max="50"
                value={numDrivers} 
                onChange={e=>setNumDrivers(Number(e.target.value))} 
              />
              <small>Total ride requests to simulate in this session</small>
            </div>

            <div className="control-group">
              <label htmlFor="driver-count">Driver ID Range (0 to N):</label>
              <input 
                id="driver-count"
                type="number" 
                min="1" 
                max="200"
                value={driverCount} 
                onChange={e=>setDriverCount(Number(e.target.value))} 
              />
              <small>Total unique drivers available in the system</small>
            </div>
          </div>

          <div className="button-group">
            <button className="btn btn-primary" onClick={handleGenerateDrivers}>Generate Ride Requests</button>
            <button className="btn btn-success" onClick={handleRunAll}>Compare All Strategies</button>
          </div>

          <div className="sequence-display">
            <h3>Incoming Ride Requests (Driver IDs):</h3>
            <div className="sequence-box">
              {drivers.map((d, idx) => (
                <span key={idx} className="driver-request">D{d}</span>
              ))}
            </div>
          </div>
        </section>

        {results ? (
          <section className="results-section">
            <h2>Strategy Performance Analysis</h2>
            
            {(() => {
              const analytics = calculateAnalytics(results)
              return (
                <>
                  <div className="performance-summary card">
                    <h3>🏆 Performance Comparison Summary</h3>
                    <div className="summary-grid">
                      {['FIFO', 'LRU', 'OPTIMAL', 'CLOCK', 'LFU', 'MFU'].map(algo => {
                        const result = results[algo]
                        const bestHitRate = Math.max(...Object.values(results).map(r => parseFloat(r.hitRate)))
                        const isBest = parseFloat(result.hitRate) === bestHitRate && bestHitRate > 0
                        
                        return (
                          <div key={algo} className={`summary-card ${isBest ? 'best-summary' : ''}`}>
                            <div className="summary-algo-name">{algo}</div>
                            <div className={`summary-hitrate ${isBest ? 'best-rate' : ''}`}>
                              {result.hitRate}% Hit Rate
                            </div>
                            <div className="summary-stats">
                              <div>✓ {result.hits} Found</div>
                              <div>✗ {result.misses} Not Found</div>
                            </div>
                            {isBest && <div className="best-label">BEST</div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div className="algorithms-grid">
                    {['FIFO', 'LRU', 'OPTIMAL', 'CLOCK', 'LFU', 'MFU'].map(algo => (
                      <div key={algo} className="algorithm-card">
                        <button 
                          className="algo-toggle"
                          onClick={() => setExpandedAlgo(expandedAlgo === algo ? null : algo)}
                        >
                          <span className="algo-name">{algo}</span>
                          <span className="algo-stats">
                            {results[algo] && (
                              <>
                                <span className="stat hits">✓ {results[algo].hits} Found</span>
                                <span className="stat misses">✗ {results[algo].misses} Not Found</span>
                                <span className="stat rate">{results[algo].hitRate}%</span>
                              </>
                            )}
                          </span>
                        </button>
                        
                        {expandedAlgo === algo && (
                          <div className="algo-details">
                            <div className="algo-info">
                              <h4>{algorithmInfo[algo].title}</h4>
                              <p><strong>Algorithm:</strong> {algorithmInfo[algo].description}</p>
                              <p><strong>Real-World Context:</strong> {algorithmInfo[algo].realWorld}</p>
                            </div>
                            <AlgorithmResult name={algo} result={results[algo]} allResults={results} cacheSize={cacheSize} analytics={analytics} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}
            
            <div className="individual-algorithms">
              <h3>Run Individual Algorithms</h3>
              <div className="button-row">
                <button className="btn btn-outline" onClick={()=>handleRunSingle('FIFO')}>View FIFO</button>
                <button className="btn btn-outline" onClick={()=>handleRunSingle('LRU')}>View LRU</button>
                <button className="btn btn-outline" onClick={()=>handleRunSingle('OPTIMAL')}>View OPTIMAL</button>
                <button className="btn btn-outline" onClick={()=>handleRunSingle('CLOCK')}>View CLOCK</button>
                <button className="btn btn-outline" onClick={()=>handleRunSingle('LFU')}>View LFU</button>
                <button className="btn btn-outline" onClick={()=>handleRunSingle('MFU')}>View MFU</button>
              </div>
            </div>
          </section>
        ) : (
          <section className="empty-state card">
            <div className="empty-icon">📊</div>
            <p>Generate a driver sequence and run a simulation to see results</p>
          </section>
        )}

        <section className="info-section card">
          <h2>About This Simulator</h2>
          <div className="info-grid">
            <div className="info-item">
              <h4>📍 Service Area Challenge</h4>
              <p>In a busy city area, hundreds of drivers are available. Uber can only keep a limited number in active cache. The system must strategically decide which drivers to keep readily accessible.</p>
            </div>
            <div className="info-item">
              <h4>⚙️ Driver Lookup Performance</h4>
              <p>When a user requests a ride, the system checks if the driver is in active cache (HIT = instant match). If not (MISS), it must search from slower secondary storage. Different strategies affect response times.</p>
            </div>
            <div className="info-item">
              <h4>📈 Impact of Cache Hit Rate</h4>
              <p>A 90% hit rate means 9 out of 10 ride requests are served instantly. A 50% hit rate means half the users experience delays. Even small improvements in hit rate significantly reduce wait times.</p>
            </div>
            <div className="info-item">
              <h4>🎯 Strategy Trade-offs</h4>
              <p>Queue-based (FIFO) is fast but dumb. Recency-based (LRU) is smarter. Frequency-based (LFU) learns patterns. Clock buffers are efficient. Each has real-world trade-offs in performance and complexity.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
