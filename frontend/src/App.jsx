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
    padding: '2rem 1.5rem',
    width: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
    maxWidth: '1000px',
  },
  title: {
    fontSize: '3.25rem',
    fontWeight: 800,
    background: 'linear-gradient(90deg, #818cf8, #38bdf8, #34d399)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.2rem',
    marginTop: '0.8rem',
    fontWeight: 500,
  },
  candidateSelect: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '1300px',
  },
  candidateBtn: (isSelected) => ({
    padding: '1.25rem 2rem',
    borderRadius: '20px',
    border: isSelected
      ? '2px solid #818cf8'
      : '1px solid rgba(255, 255, 255, 0.12)',
    background: isSelected
      ? 'rgba(129, 140, 248, 0.22)'
      : 'rgba(30, 41, 59, 0.65)',
    color: isSelected ? '#818cf8' : '#cbd5e1',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1.05rem',
    backdropFilter: 'blur(16px)',
    textAlign: 'left',
    minWidth: '280px',
    flex: '1 1 280px',
    maxWidth: '400px',
    boxShadow: isSelected
      ? '0 10px 30px rgba(129, 140, 248, 0.25)'
      : '0 8px 24px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.25s ease',
  }),
  mainContent: {
    width: '100%',
    maxWidth: '1350px',
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
          { id: 1, name: 'Sudhanshu Pandey', role: 'Backend / Systems Engineer' },
          { id: 2, name: 'Chesta Sharma', role: 'Frontend / AI Engineer' },
          { id: 3, name: 'Sudhanshu Prajapati', role: 'AI Engineering Candidate' },
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

      {!selectedCandidate ? (
        <div style={{ width: '100%', maxWidth: '1350px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Select Candidate Profile to Begin Technical Interview
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.5rem' }}>
              Each candidate has a unique 31-day cohort trajectory, completed missions, and performance signals.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem',
            width: '100%',
          }}>
            {candidates.map((c) => {
              const isSudhanshuP = c.name === 'Sudhanshu Pandey';
              const isChesta = c.name === 'Chesta Sharma';
              const pct = isSudhanshuP ? 100 : isChesta ? 65 : 75;
              const exp = isSudhanshuP ? '3 Yrs Exp' : isChesta ? '1 Yr Exp' : '2 Yrs Exp';
              const missions = isSudhanshuP ? '16 / 16 Missions' : isChesta ? '8 / 16 Missions' : '12 / 16 Missions';
              const tags = isSudhanshuP 
                ? ['Backend Eng', 'System Design', 'Fine-Tuning', 'Docker MLOps']
                : isChesta 
                ? ['Prompt Eng', 'React UI', 'MCP SDK', 'FastAPI']
                : ['RAG Pipelines', 'Vector DBs', 'LangGraph Agents', 'MCP'];

              const initials = c.name.split(' ').map(n => n[0]).join('');

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCandidate(c)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.65)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '24px',
                    padding: '2rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = '#818cf8';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(129, 140, 248, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.3)';
                  }}
                >
                  <div>
                    {/* Header with Avatar & Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #6366f1, #10b981)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        color: '#ffffff',
                        boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
                      }}>
                        {initials}
                      </div>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#34d399',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        padding: '0.4rem 0.9rem',
                        borderRadius: '9999px',
                      }}>
                        {exp}
                      </span>
                    </div>

                    {/* Candidate Name & Role */}
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                      {c.name}
                    </h3>
                    <p style={{ color: '#818cf8', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.3rem', marginBottom: '1.25rem' }}>
                      {isSudhanshuP ? 'Backend / Systems Engineer' : isChesta ? 'Frontend / AI Engineer' : 'AI Engineering Candidate'}
                    </p>

                    {/* Completion Progress Bar */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>
                        <span>Cohort Progress</span>
                        <span style={{ color: '#38bdf8' }}>{pct}% ({missions})</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #38bdf8, #34d399)', borderRadius: '9999px' }} />
                      </div>
                    </div>

                    {/* Tech Skill Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
                      {tags.map((t, i) => (
                        <span key={i} style={{
                          background: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#cbd5e1',
                          fontSize: '0.8rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          fontWeight: 500,
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Start Interview Action Button */}
                  <button style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '14px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}>
                    🚀 Start Technical Interview
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={APP_STYLES.mainContent}>
          {!interviewComplete ? (
            <ChatWindow
              candidate={selectedCandidate}
              onInterviewComplete={handleInterviewComplete}
              onReset={handleReset}
            />
          ) : (
            <FeedbackCard
              candidate={selectedCandidate}
              feedback={feedback}
              onReset={handleReset}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
