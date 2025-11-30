import React, { useState } from 'react'
import { runAll, runFIFO, runLRU, runOptimal, runClock, runLFU } from './simulator'

function randomPages(len, maxVal=9){
  const r = []
  for(let i=0;i<len;i++) r.push(Math.floor(Math.random()*(maxVal+1)))
  return r
}

function AlgorithmResult({ name, result }){
  if(!result) return null
  return (
    <div className="card alg-section">
      <h3>{name}</h3>
      <table>
        <thead>
          <tr>
            <th>Page</th>
            <th>Frames</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {result.steps.map((s, idx) => (
            <tr key={idx}>
              <td>{s.page}</td>
              <td>{s.frames.length ? s.frames.join(', ') : '-'}</td>
              <td className={s.status==='HIT'? 'status-hit':'status-miss'}>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="summary">Hits: {result.hits} | Faults: {result.faults}</div>
    </div>
  )
}

export default function App(){
  const [capacity, setCapacity] = useState(3)
  const [length, setLength] = useState(15)
  const [maxVal, setMaxVal] = useState(9)
  const [pages, setPages] = useState(randomPages(length, maxVal))
  const [results, setResults] = useState(null)

  function handleRandomize(){
    const p = randomPages(length, maxVal)
    setPages(p)
    setResults(null)
  }

  function handleRun(){
    const res = runAll(pages, Number(capacity))
    setResults(res)
  }

  function handleRunSingle(algo){
    let res = null
    const cap = Number(capacity)
    switch(algo){
      case 'FIFO': res = runFIFO(pages, cap); break
      case 'LRU': res = runLRU(pages, cap); break
      case 'OPTIMAL': res = runOptimal(pages, cap); break
      case 'CLOCK': res = runClock(pages, cap); break
      case 'LFU': res = runLFU(pages, cap); break
      default: return
    }
    // set results as object with single key so UI renders only that algorithm
    setResults({ [algo]: res })
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Paging Simulator</h2>
        <div className="controls">
          <label>Capacity: <input type="number" min="1" value={capacity} onChange={e=>setCapacity(e.target.value)} /></label>
          <label>Sequence Length: <input type="number" min="1" value={length} onChange={e=>{setLength(e.target.value);}} /></label>
          <label>Max Page Value: <input type="number" min="0" value={maxVal} onChange={e=>setMaxVal(e.target.value)} /></label>
          <button onClick={()=>{ setPages(randomPages(length, maxVal)); setResults(null); }}>Generate Random</button>
          <button onClick={handleRun}>Run All</button>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>handleRunSingle('FIFO')}>Run FIFO</button>
            <button onClick={()=>handleRunSingle('LRU')}>Run LRU</button>
            <button onClick={()=>handleRunSingle('OPTIMAL')}>Run OPTIMAL</button>
            <button onClick={()=>handleRunSingle('CLOCK')}>Run CLOCK</button>
            <button onClick={()=>handleRunSingle('LFU')}>Run LFU</button>
          </div>
        </div>
        <div style={{marginTop:8}}>
          <strong>Reference String:</strong>
          <div style={{marginTop:6}} className="card">{pages.join(', ')}</div>
        </div>
      </div>

      {results ? (
        <div>
          <AlgorithmResult name="FIFO" result={results.FIFO} />
          <AlgorithmResult name="LRU" result={results.LRU} />
          <AlgorithmResult name="OPTIMAL" result={results.OPTIMAL} />
          <AlgorithmResult name="CLOCK" result={results.CLOCK} />
          <AlgorithmResult name="LFU" result={results.LFU} />
        </div>
      ) : (
        <div style={{marginTop:12}} className="muted">Run a simulation to see per-step output.</div>
      )}
    </div>
  )
}
