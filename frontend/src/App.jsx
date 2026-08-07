import React, { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow.jsx';
import FeedbackCard from './components/FeedbackCard.jsx';

const APP_STYLES = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
    fontFamily: "'Inter', sans-serif",
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2.5rem 1rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  title: {
    fontSize: '2.75rem',
    fontWeight: 800,
    background: 'linear-gradient(90deg, #818cf8, #38bdf8, #34d399)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.05rem',
    marginTop: '0.6rem',
  },
  candidateSelect: {
    display: 'flex',
    gap: '1.25rem',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  candidateBtn: (isSelected) => ({
    padding: '1rem 1.75rem',
    borderRadius: '16px',
    border: isSelected
      ? '2px solid #818cf8'
      : '1px solid rgba(255, 255, 255, 0.1)',
    background: isSelected
      ? 'rgba(129, 140, 248, 0.2)'
      : 'rgba(30, 41, 59, 0.5)',
    color: isSelected ? '#818cf8' : '#cbd5e1',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.95rem',
    backdropFilter: 'blur(10px)',
    textAlign: 'left',
    minWidth: '220px',
  }),
  mainContent: {
    width: '100%',
    maxWidth: '850px',
  },
};

function App() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || 'https://ai-interview-agent-e74h.onrender.com';
    fetch(`${API_BASE}/api/candidates`)
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data);
      })
      .catch(() => {
        // Fallback default candidates if API fails initial call
        setCandidates([
          { id: 1, name: 'Sudhanshu Pandey', role: 'AI Engineering Candidate' },
          { id: 2, name: 'Chesta Sharma', role: 'Frontend / AI Engineer' },
          { id: 3, name: 'Sudhanshu Prajapati', role: 'Backend / Systems Engineer' },
        ]);
      });
  }, []);

  const handleInterviewComplete = (feedbackData) => {
    setFeedback(feedbackData);
    setInterviewComplete(true);
  };

  const handleReset = () => {
    setSelectedCandidate(null);
    setFeedback(null);
    setInterviewComplete(false);
  };

  return (
    <div style={APP_STYLES.container}>
      <header style={APP_STYLES.header}>
        <h1 style={APP_STYLES.title}>⚡ ABTalks AI Cohort Interviewer</h1>
        <p style={APP_STYLES.subtitle}>
          Senior Technical AI Assessment Engine • 31-Day Enterprise AI Engineering
        </p>
      </header>

      {!selectedCandidate && (
        <div>
          <h3 style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Select Candidate Profile to Begin Interview:
          </h3>
          <div style={APP_STYLES.candidateSelect}>
            {candidates.map((c) => (
              <button
                key={c.id}
                style={APP_STYLES.candidateBtn(false)}
                onClick={() => setSelectedCandidate(c)}
              >
                <div style={{ fontWeight: 700, color: '#f8fafc' }}>{c.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                  {c.role}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={APP_STYLES.mainContent}>
        {selectedCandidate && !interviewComplete && (
          <ChatWindow
            candidate={selectedCandidate}
            onComplete={handleInterviewComplete}
          />
        )}

        {interviewComplete && feedback && (
          <FeedbackCard feedback={feedback} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}

export default App;
