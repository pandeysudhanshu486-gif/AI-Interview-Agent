# ⚡ ABTalks AI Cohort — Senior AI Technical Interviewer Agent

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-Llama_3.3_70B-orange?style=for-the-badge)](https://groq.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

An autonomous, multi-turn **AI Technical Interviewer Agent** designed to conduct realistic, adaptive technical interviews for candidates who completed the **ABTalks 31-Day Enterprise AI Engineering Cohort**.

---

## 🏆 Hackathon Submission Metadata (Verification Links)

- **Public Repository URL**: [`https://github.com/pandeysudhanshu486-gif/AI-Interview-Agent.git`](https://github.com/pandeysudhanshu486-gif/AI-Interview-Agent.git)
- **Live Demo URL (Frontend)**: [`https://aiagent-12.netlify.app`](https://aiagent-12.netlify.app)
- **Live API URL (Backend)**: [`https://ai-interview-agent-e74h.onrender.com`](https://ai-interview-agent-e74h.onrender.com)
- **AI Usage Log & Prompt History**: [`PROMPTS.md`](file:///Users/sudhanshupandey/Desktop/AI-Interview-Agent/PROMPTS.md)

---

## 🎯 Problem Statement & Mission

The **ABTalks AI Cohort** is an intensive 31-day program covering modern AI engineering topics such as RAG, Vector Databases, Prompt Engineering, Agentic AI, MCP, Fine-Tuning, and MLOps.

This AI Agent simulates a real **FAANG/Top-Tech Senior AI Engineering Interviewer**:
- **Assesses completed concepts** dynamically based on individual candidate context (`completed_missions`, `skipped_topics`, `signals`).
- **Probes adaptively** with architectural follow-ups on strong answers and gentle hints on weak responses.
- **Enforces constraints**: Asks a minimum of 8 technical questions across at least 4 distinct curriculum days.
- **Outputs structured JSON feedback**: Generates an actionable evaluation scorecard with score (out of 10), final verdict, strengths, gaps, and recommendations.

---

## ✨ Key Features

- 🤖 **Groq Llama-3.3-70B AI Engine**: Powered by Groq's ultra-fast LLM API (`llama-3.3-70b-versatile`).
- 📊 **Dynamic Turn & Progress Tracking**: Visual header badge (`Question X / 8+`) and progress bar.
- 🎙️ **Speech-to-Text (Mic Input)**: Web Speech API microphone input (`🎙️`) for candidates to speak their answers.
- 🔊 **Text-to-Speech (AI Voice Reading)**: SpeechSynthesis engine (`🔊`) allowing candidates to hear AI questions.
- 📥 **Downloadable PDF Assessment Report**: One-click generation of branded, print-ready PDF evaluation reports.
- 🎨 **Glassmorphism Dark UI**: Built with modern HSL color palettes and smooth animations.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | Python 3.9+, FastAPI, Uvicorn, Pydantic, Requests, Python-Dotenv |
| **AI LLM Provider** | Groq API (`llama-3.3-70b-versatile`) |
| **Frontend UI** | React 18, Vite, Vanilla CSS Glassmorphism |
| **Browser Web APIs** | Web Speech Recognition & Speech Synthesis APIs |
| **Deployment Config** | Render (`render.yaml`, `Procfile`), Vercel ready |

---

## 📁 Repository Structure

```text
AI-Interview-Agent/
│
├── backend/
│   ├── data/
│   │   ├── candidates.json        # Candidates data (missions, skipped topics, signals)
│   │   └── curriculum.json        # 31-Day ABTalks Enterprise AI Cohort curriculum
│   ├── main.py                    # FastAPI server & Groq AI interview engine
│   └── requirements.txt           # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx     # Glassmorphic Chat UI + Voice controls & progress bar
│   │   │   └── FeedbackCard.jsx   # Evaluation Scorecard & PDF exporter
│   │   ├── App.jsx                # Main React container with candidate selector
│   │   └── main.jsx               # React DOM entry point
│   ├── index.html                 # HTML template with Google Inter font
│   ├── package.json               # Frontend dependencies & scripts
│   └── vite.config.js             # Vite configuration with API proxy
│
├── .env                           # Local environment variables (GROQ_API_KEY)
├── .gitignore                     # Excludes .env, venv, node_modules
├── Procfile                       # Render deployment process configuration
├── render.yaml                    # Render Web Service deployment infrastructure spec
├── PROMPTS.md                     # Comprehensive log of system prompts & instructions
└── README.md                      # Project documentation
```

---

## 🚀 Quickstart Guide (Local Execution)

### 1. Environment Setup
Create a `.env` file in the root directory:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

### 2. Start Backend Server
```bash
cd backend
source ../venv/bin/activate    # Linux/Mac
python main.py
```
*(Backend runs on `http://localhost:8000`)*

### 3. Start Frontend App
```bash
cd frontend
npm install
npm run dev
```
*(Frontend runs on `http://localhost:5173`)*

Open **`http://localhost:5173`** in your browser to interact with the agent!

---

## 📡 API Contract

### Endpoints Overview

#### `POST /api/interview`
Main interview conversation endpoint. Accepts candidate ID and conversation history; returns AI interviewer response, current turn number, completion status, and structured feedback JSON when complete.

**Request Format:**
```json
{
  "candidate_id": 1,
  "message": "I used HNSW indexing with Pinecone for my RAG pipeline.",
  "conversation_history": [
    { "role": "user", "content": "Hello, I am ready for the interview." },
    { "role": "assistant", "content": "Welcome! Let's start with your Day 7 RAG mission..." }
  ]
}
```

**Response Format (Turns 1 to 7):**
```json
{
  "reply": "That's a solid choice for nearest neighbor search! How do you handle vector re-indexing during high throughput updates?",
  "turn_number": 2,
  "is_complete": false,
  "feedback": null
}
```

**Response Format (Turn 8+ Final Evaluation):**
```json
{
  "reply": "Thank you for completing the technical interview!",
  "turn_number": 8,
  "is_complete": true,
  "feedback": {
    "overall_score": 8,
    "summary": "Demonstrated strong knowledge of RAG architecture and Vector DB indexing...",
    "strengths": ["Deep understanding of vector embeddings", "Clear architectural communication"],
    "gaps": ["Lacked familiarity with fine-tuning PEFT strategies"],
    "next": ["Explore LoRA & QLoRA fine-tuning workflows"],
    "verdict": "STRONG HIRE"
  }
}
```

#### `GET /api/candidates`
Returns candidate profiles.

#### `GET /api/curriculum`
Returns cohort curriculum modules and topics.

---

## ☁️ Deployment Instructions

### Render (Backend Deployment)
1. Push code to GitHub repository.
2. Sign in to [Render Dashboard](https://dashboard.render.com).
3. Create a **New Web Service** linked to your GitHub repo.
4. Set Build Command: `pip install -r backend/requirements.txt`.
5. Set Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
6. Add Environment Variable: `GROQ_API_KEY`.

---

## 📜 License & Credits

Built for the **ABTalks AI Cohort Hackathon Challenge**.