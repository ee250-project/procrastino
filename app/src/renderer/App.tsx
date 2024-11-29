import { useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import StopWatch from './StopWatch';

function Hello() {
  const [input, setInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  const handleStart = () => {
    setIsStarted(true);
  };

  return (
    <div id="container">
      <div id="navbar">
        <div>ProcrastiNO</div>
        <div>API Key</div>
      </div>
      <div id="main">
        <h1>What are you working on today?</h1>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {!isStarted && (
          <div className="Hello">
            <button type="button" onClick={handleStart}>
              Start!
            </button>
          </div>
        )}
        {isStarted && <StopWatch />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
