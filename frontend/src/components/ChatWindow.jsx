import React, { useState, useRef, useEffect } from 'react';

const STYLES = {
  container: {
    background: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  header: {
    padding: '1.25rem 1.75rem',
    background: 'rgba(30, 41, 59, 0.6)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#f8fafc',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    margin: '2px 0 0 0',
  },
  controlsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  audioToggleBtn: (active) => ({
    background: active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${active ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
    color: active ? '#34d399' : '#94a3b8',
    padding: '0.4rem 0.8rem',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s ease',
  }),
  badge: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: 700,
    padding: '0.35rem 0.85rem',
    borderRadius: '9999px',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
  },
  progressBarContainer: {
    width: '100%',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  progressBar: (pct) => ({
    height: '100%',
    width: `${Math.min(pct, 100)}%`,
    background: 'linear-gradient(90deg, #6366f1, #10b981)',
    transition: 'width 0.4s ease',
  }),
  messagesArea: {
    height: '460px',
    overflowY: 'auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  messageBubble: (isUser) => ({
    maxWidth: '82%',
    padding: '1rem 1.35rem',
    borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
    background: isUser
      ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
      : 'rgba(30, 41, 59, 0.8)',
    border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
    color: isUser ? '#ffffff' : '#e2e8f0',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    boxShadow: isUser ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none',
  }),
  inputArea: {
    padding: '1.25rem 1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    gap: '0.75rem',
    background: 'rgba(15, 23, 42, 0.9)',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '0.9rem 1.25rem',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    background: 'rgba(30, 41, 59, 0.5)',
    color: '#f8fafc',
    fontSize: '0.95rem',
    outline: 'none',
  },
  micBtn: (isListening) => ({
    padding: '0.9rem',
    borderRadius: '14px',
    border: `1px solid ${isListening ? '#ef4444' : 'rgba(255, 255, 255, 0.15)'}`,
    background: isListening ? 'rgba(239, 68, 68, 0.25)' : 'rgba(30, 41, 59, 0.5)',
    color: isListening ? '#f87171' : '#cbd5e1',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    transition: 'all 0.2s ease',
    boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none',
  }),
  sendBtn: (disabled) => ({
    padding: '0.9rem 1.75rem',
    borderRadius: '14px',
    border: 'none',
    background: disabled
      ? 'rgba(99, 102, 241, 0.3)'
      : 'linear-gradient(135deg, #6366f1, #10b981)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.3)',
  }),
  typingIndicator: {
    alignSelf: 'flex-start',
    padding: '0.75rem 1.25rem',
    borderRadius: '20px 20px 20px 4px',
    background: 'rgba(30, 41, 59, 0.5)',
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontStyle: 'italic',
  },
};

function ChatWindow({ candidate, onComplete }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnNumber, setTurnNumber] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Text to Speech Helper
  const speakAIResponse = (text) => {
    if (!isAudioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // cancel previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    sendMessage("Hello, I am ready to start the technical interview.");
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your current browser. Try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const API_BASE = import.meta.env.VITE_API_URL || 'https://ai-interview-agent-e74h.onrender.com';
      const response = await fetch(`${API_BASE}/api/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidate.id,
          message: text,
          conversation_history: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = { role: 'assistant', content: data.reply };
      setMessages((prev) => [...prev, aiMessage]);

      // Trigger Text-to-Speech for AI response
      speakAIResponse(data.reply);

      if (data.turn_number) {
        setTurnNumber(data.turn_number);
      }

      if (data.is_complete && data.feedback) {
        onComplete(data.feedback);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ Connection Error: ${error.message}. Please try again.` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const progressPct = (turnNumber / 8) * 100;

  return (
    <div style={STYLES.container}>
      <div style={STYLES.header}>
        <div>
          <h3 style={STYLES.headerTitle}>{candidate.name}</h3>
          <p style={STYLES.headerSubtitle}>{candidate.role} • ABTalks AI Cohort</p>
        </div>
        <div style={STYLES.controlsGroup}>
          <button
            type="button"
            style={STYLES.audioToggleBtn(isAudioEnabled)}
            onClick={() => {
              if (isAudioEnabled) window.speechSynthesis?.cancel();
              setIsAudioEnabled(!isAudioEnabled);
            }}
            title="Toggle AI Audio Speech Voice"
          >
            {isAudioEnabled ? '🔊 AI Voice On' : '🔇 Muted'}
          </button>
          <div style={STYLES.badge}>
            Question {Math.min(turnNumber, 8)} / 8+
          </div>
        </div>
      </div>

      <div style={STYLES.progressBarContainer}>
        <div style={STYLES.progressBar(progressPct)} />
      </div>

      <div style={STYLES.messagesArea}>
        {messages.map((msg, idx) => (
          <div key={idx} style={STYLES.messageBubble(msg.role === 'user')}>
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div style={STYLES.typingIndicator}>Senior Interviewer is evaluating...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={STYLES.inputArea}>
        <button
          type="button"
          onClick={toggleMic}
          style={STYLES.micBtn(isListening)}
          title={isListening ? "Listening... Click to stop" : "Click to speak your answer"}
        >
          {isListening ? '🛑' : '🎙️'}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening to your voice..." : "Type or click 🎙️ to speak..."}
          style={STYLES.input}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={STYLES.sendBtn(isLoading || !input.trim())}
        >
          Submit Answer
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
