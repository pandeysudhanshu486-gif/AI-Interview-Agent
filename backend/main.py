from __future__ import annotations
import os
import json
import re
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import requests

# Load environment variables from root .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# Configure Groq API
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Configure Breeth AI (Intent-Aware Agent Memory & MCP Integration)
BREETH_API_KEY = os.getenv("BREETH_API_KEY")
BREETH_MCP_URL = os.getenv("BREETH_MCP_URL", "https://mcp.thebreeth.com/mcp")

if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
    print("⚠️ WARNING: GROQ_API_KEY is not set or using placeholder in .env file")

if BREETH_API_KEY:
    print("🧠 Breeth AI Intent-Aware Agent Memory & MCP Server is ACTIVE")

# Load data files
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def load_candidates():
    with open(os.path.join(DATA_DIR, "candidates.json"), "r") as f:
        return json.load(f)

def load_curriculum():
    with open(os.path.join(DATA_DIR, "curriculum.json"), "r") as f:
        return json.load(f)

candidates = load_candidates()
curriculum = load_curriculum()

# FastAPI app with Swagger UI metadata & tags
tags_metadata = [
    {
        "name": "System & Dashboard",
        "description": "System status, health checks, and interactive engine dashboards."
    },
    {
        "name": "Candidate Profiles",
        "description": "Access candidate profiles, completed missions, skipped topics, and evaluation signals."
    },
    {
        "name": "31-Day Curriculum",
        "description": "Explore the 31-day enterprise AI cohort syllabus, daily topics, learning objectives, and tools."
    },
    {
        "name": "AI Interview Engine",
        "description": "Execute multi-turn adaptive technical interviews powered by Groq Llama-3.3-70B & Breeth Memory."
    }
]

app = FastAPI(
    title="⚡ ABTalks AI Technical Interviewer Engine",
    description="""
## 🤖 Enterprise AI Cohort Technical Interviewer API
Powered by **Groq Llama-3.3-70B** & **Breeth AI Intent-Aware Memory Layer** (`mcp.thebreeth.com/mcp`).

- 👥 **Candidates API**: Retrieve student profiles, completed missions, and attempts.
- 📚 **Curriculum API**: Access 31-day syllabus, learning objectives, and tools.
- 💬 **Interview Engine**: Conduct realistic multi-turn technical interviews & generate JSON scorecards.
""",
    version="3.5.0",
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InterviewRequest(BaseModel):
    candidate_id: int
    message: str
    conversation_history: list[dict] = []

class InterviewResponse(BaseModel):
    reply: str
    turn_number: int
    is_complete: bool = False
    feedback: Optional[dict] = None

def _get_candidate(candidate_id: int) -> dict:
    for c in candidates:
        if c["id"] == candidate_id:
            return c
    raise HTTPException(status_code=404, detail=f"Candidate {candidate_id} not found")

def _build_system_prompt(candidate: dict, current_turn: int) -> str:
    completed = ", ".join(candidate.get("completed_missions", [])) or "None specified"
    skipped = ", ".join(candidate.get("skipped_topics", [])) or "None"
    signals = candidate.get("signals", "No additional signals")
    curriculum_str = json.dumps(curriculum, indent=2)

    return f"""You are an expert, highly articulate Senior AI Technical Interviewer representing the ABTalks AI Cohort.
Your task is to conduct a realistic, multi-turn technical interview for a candidate who has completed a 31-day enterprise AI engineering program.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE OBJECTIVES & CONSTRAINTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. QUESTION COUNT: You MUST ask a total of at least 8 technical questions across the interview before wrapping up.
2. CURRICULUM COVERAGE: The interview MUST cover at least 4 distinct days/topics from the 31-day curriculum (e.g., Embeddings, RAG Pipelines, Vector Databases, Prompt Engineering, Agents, MCP, Deployment, Fine-tuning).
3. ADAPTIVE & DYNAMIC PROBING:
   - Tailor questions specifically to the candidate's background, completed missions, skipped topics, and attempt count.
   - Adapt to previous answers. If the candidate gives a strong answer, ask a deeper architectural or edge-case follow-up. If the answer is weak or vague, gently push for clarification or transition gracefully.
4. TONE & STYLE: Maintain a professional, encouraging, yet rigorous technical tone resembling a real-world FAANG/Top Tech engineering interview. Avoid scripted questionnaires—make it feel like a live technical dialog.
5. CONCISENESS: Keep your non-question conversational text concise (under 150 words) so the candidate stays focused on the question.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CANDIDATE CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Name: {candidate['name']}
- Current Role: {candidate['role']} ({candidate['experience_years']} years experience)
- Completed Missions: {completed}
- Skipped Topics: {skipped}
- Performance Signals: {signals}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
31-DAY CURRICULUM REFERENCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{curriculum_str}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT CONVERSATION STATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Current User Turn Number: {current_turn} / 8+

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS PER TURN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IF TURN == 1 (Interview Start):
- Warmly welcome {candidate['name']}.
- Set expectations: Mention that you'll be discussing their journey through the 31-day cohort and testing their architectural and implementation choices.
- Ask Question 1 targeting an early completed mission (e.g., Day 3, Day 5, Day 7, or Day 8).

IF TURN > 1 AND TURN < 8:
- Briefly acknowledge or validate the candidate's previous response in 1 concise sentence.
- Generate Question {current_turn}. Ensure it either probes deeper into their last response OR transitions to a new curriculum area to satisfy the "minimum 4 distinct days" requirement.

IF TURN >= 8 (Final Evaluation Stage):
- Do NOT ask another technical question.
- Conclude the interview politely.
- Output the keyword INTERVIEW_COMPLETE on a new line, followed by the final evaluation feedback strictly formatted as valid JSON matching the schema below:

INTERVIEW_COMPLETE
```json
{{
  "overall_score": 8,
  "summary": "<Overall candidate performance summary based on depth, correctness, and communication>",
  "strengths": [
    "<Actionable, specific technical strength 1>",
    "<Actionable, specific technical strength 2>"
  ],
  "gaps": [
    "<Technical gap or area where candidate lacked depth 1>",
    "<Technical gap 2>"
  ],
  "next": [
    "<Concrete recommendation for future learning 1>",
    "<Concrete recommendation 2>"
  ],
  "verdict": "<STRONG HIRE | HIRE | LEAN HIRE | NO HIRE>"
}}
```
"""

def _parse_feedback(reply: str) -> tuple[str, Optional[dict]]:
    if "INTERVIEW_COMPLETE" not in reply:
        return reply, None

    parts = reply.split("INTERVIEW_COMPLETE")
    display_text = parts[0].strip()
    json_part = parts[1].strip()

    # Extract json block using regex if present
    match = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", json_part)
    raw_json = match.group(1) if match else json_part

    try:
        feedback_data = json.loads(raw_json)
        return display_text, feedback_data
    except Exception:
        return display_text, {
            "summary": json_part,
            "strengths": [],
            "gaps": [],
            "next": [],
            "verdict": "COMPLETED"
        }

@app.get("/", response_class=HTMLResponse, tags=["System & Dashboard"], summary="Engine Dashboard & Health Overview")
async def root():
    breeth_status = "ACTIVE 🧠" if BREETH_API_KEY else "CONFIGURED 🧠"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ABTalks AI Cohort - Interviewer Engine Backend</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      font-family: 'Inter', sans-serif;
      background: radial-gradient(circle at top, #1e1b4b 0%, #0f172a 60%, #020617 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1.5rem;
    }}
    .container {{ max-width: 900px; width: 100%; }}
    .header {{ text-align: center; margin-bottom: 2.5rem; }}
    .title {{
      font-size: 2.5rem; font-weight: 800;
      background: linear-gradient(90deg, #818cf8, #38bdf8, #34d399);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }}
    .subtitle {{ color: #94a3b8; font-size: 1.05rem; }}
    .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }}
    .card {{
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px; padding: 1.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }}
    .card-title {{ font-size: 0.85rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 0.5rem; }}
    .card-value {{ font-size: 1.2rem; font-weight: 800; color: #34d399; }}
    .btn-group {{ display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1.5rem; justify-content: center; }}
    .btn {{
      padding: 0.85rem 1.75rem; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 0.95rem; transition: all 0.2s ease;
      display: inline-flex; align-items: center; gap: 0.5rem;
    }}
    .btn-primary {{ background: linear-gradient(135deg, #6366f1, #10b981); color: #fff; box-shadow: 0 4px 14px rgba(16,185,129,0.3); }}
    .btn-secondary {{ background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15); }}
    .btn:hover {{ transform: translateY(-2px); opacity: 0.95; }}
    .footer {{ margin-top: 3rem; text-align: center; color: #64748b; font-size: 0.85rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.5rem; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">⚡ ABTalks AI Technical Interviewer API</div>
      <div class="subtitle">Enterprise Backend Engine • Groq Llama-3.3-70B • Breeth AI Memory</div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Engine Status</div>
        <div class="card-value">🟢 200 OK (ACTIVE)</div>
      </div>
      <div class="card">
        <div class="card-title">LLM Provider</div>
        <div class="card-value" style="color: #60a5fa;">Groq Llama-3.3-70B</div>
      </div>
      <div class="card">
        <div class="card-title">Agent Memory</div>
        <div class="card-value" style="color: #a78bfa;">{breeth_status}</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 2rem;">
      <div class="card-title">Interactive API Documentation & Controls</div>
      <p style="color: #cbd5e1; line-height: 1.7; margin-top: 0.5rem; font-size: 0.95rem;">
        This server powers the multi-turn adaptive technical interviewer for candidates of the 31-day ABTalks Enterprise AI Cohort. Click below to test Swagger UI docs & data APIs.
      </p>
      <div class="btn-group">
        <a href="/docs" class="btn btn-primary" target="_blank">📘 Open Swagger API Docs</a>
        <a href="/redoc" class="btn btn-secondary" target="_blank">📙 Open ReDoc Documentation</a>
        <a href="/api/candidates" class="btn btn-secondary" target="_blank">👥 View Candidates API</a>
        <a href="/api/curriculum" class="btn btn-secondary" target="_blank">📚 View Curriculum API</a>
        <a href="https://aiagent-12.netlify.app" class="btn btn-secondary" target="_blank" style="border-color: #34d399; color: #34d399;">🌐 Open Frontend App</a>
      </div>
    </div>

    <div class="footer">
      ABTalks AI Cohort Hackathon • Render Cloud Hosted Engine
    </div>
  </div>
</body>
</html>"""

@app.get("/api/candidates", tags=["Candidate Profiles"], summary="Get All Candidate Profiles")
async def get_candidates():
    return load_candidates()

@app.get("/api/candidates/{candidate_id}", tags=["Candidate Profiles"], summary="Get Candidate Profile by ID")
async def get_candidate_by_id(candidate_id: int):
    candidates_list = load_candidates()
    for c in candidates_list:
        if c["id"] == candidate_id:
            return c
    raise HTTPException(status_code=404, detail=f"Candidate with ID {candidate_id} not found")

@app.get("/api/curriculum", tags=["31-Day Curriculum"], summary="Get Full 31-Day Syllabus")
async def get_curriculum():
    return load_curriculum()

@app.get("/api/curriculum/day/{day_number}", tags=["31-Day Curriculum"], summary="Get Specific Curriculum Day Details")
async def get_curriculum_by_day(day_number: int):
    data = load_curriculum()
    for m in data.get("modules", []):
        for t in m.get("topics", []):
            if t.get("day") == day_number:
                return {
                    "module": m.get("name"),
                    "day": t.get("day"),
                    "topic": t.get("topic"),
                    "objectives": t.get("objectives"),
                    "tools": t.get("tools")
                }
    raise HTTPException(status_code=404, detail=f"Curriculum Day {day_number} topic not found")

@app.post("/api/interview", response_model=InterviewResponse, tags=["AI Interview Engine"], summary="Process AI Interview Turn & Generate Scorecard")
async def conduct_interview(request: InterviewRequest):
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is missing or not configured in .env file. Please set your valid Groq API key."
        )

    candidate = _get_candidate(request.candidate_id)

    # Calculate current turn
    user_turns = [m for m in request.conversation_history if m.get("role") == "user"]
    current_turn = len(user_turns) + 1

    system_prompt = _build_system_prompt(candidate, current_turn)

    # Format messages array for Groq OpenAI-compatible API
    messages = [{"role": "system", "content": system_prompt}]

    for msg in request.conversation_history:
        role = "user" if msg.get("role") == "user" else "assistant"
        messages.append({"role": role, "content": msg.get("content", "")})

    messages.append({"role": "user", "content": request.message})

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1024,
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=45)

        if response.status_code != 200:
            error_msg = response.json().get("error", {}).get("message", response.text)
            raise HTTPException(status_code=response.status_code, detail=f"Groq API Error: {error_msg}")

        res_json = response.json()
        reply = res_json["choices"][0]["message"]["content"]

        clean_reply, feedback = _parse_feedback(reply)
        is_complete = feedback is not None

        return InterviewResponse(
            reply=clean_reply,
            turn_number=current_turn,
            is_complete=is_complete,
            feedback=feedback,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq Integration Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
