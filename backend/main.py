from __future__ import annotations
import os
import json
import re
from typing import Optional
from fastapi import FastAPI, HTTPException
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

# FastAPI app
app = FastAPI(
    title="AI Technical Interviewer - ABTalks AI Cohort (Groq & Breeth AI Powered)",
    description="Multi-turn technical interviewer using Groq Llama-3.3-70B with Breeth Intent-Aware Agent Memory.",
    version="3.0.0",
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

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "ABTalks AI Cohort Interviewer API (Groq Engine) is active",
        "model": GROQ_MODEL
    }

@app.get("/api/candidates")
async def get_candidates():
    return load_candidates()

@app.get("/api/curriculum")
async def get_curriculum():
    return load_curriculum()

@app.post("/api/interview", response_model=InterviewResponse)
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
