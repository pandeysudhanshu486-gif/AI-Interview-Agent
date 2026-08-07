# 📜 AI Interview Agent — Prompt History & System Instructions Log

This document records the exact System Prompts, Agent Instructions, and User Problem Statements used throughout the development of the **ABTalks AI Cohort Technical Interview Agent**.

---

## 1. 🤖 Senior AI Technical Interviewer System Prompt (Production Engine)

This is the primary system prompt used in `backend/main.py` for powering the Groq `llama-3.3-70b-versatile` AI engine:

```text
You are an expert, highly articulate Senior AI Technical Interviewer representing the ABTalks AI Cohort.
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
- Name: {candidate_name}
- Current Role: {candidate_job_role} ({candidate_years_experience} years experience)
- Completed Missions: {candidate_completed_missions}
- Skipped Topics: {candidate_skipped_topics}
- Performance Signals: {candidate_signals}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
31-DAY CURRICULUM REFERENCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{curriculum_json}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT CONVERSATION STATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Current User Turn Number: {current_turn} / 8+

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS PER TURN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IF TURN == 1 (Interview Start):
- Warmly welcome {candidate_name}.
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
{
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
}
```
```

---

## 2. 🎯 Hackathon Challenge Prompt (Problem Statement)

```text
The Interview Agent: Build the interviewer, not the interview.

The Situation:
The ABTalks AI Cohort is a 31-day enterprise AI engineering program covering modern AI topics including:
- Retrieval-Augmented Generation (RAG)
- Vector Databases
- Prompt Engineering
- Agentic AI
- Model Context Protocol (MCP)
- AI Deployment
- Production AI Systems

After completing the cohort, learners should be able to confidently explain the systems they built and the engineering decisions behind them.

Your Challenge:
Design and build an AI agent capable of conducting a realistic, multi-turn technical interview.

The interview should:
- Assess the candidate's understanding of the concepts they have completed.
- Adapt naturally throughout the conversation.
- Ask intelligent follow-up questions.
- Maintain context across the interview.
- Provide actionable feedback at the end.

Minimum Requirements:
- Conduct a conversational technical interview.
- Ask a minimum of 8 questions covering at least 4 different curriculum days.
- Generate follow-up questions based on previous responses.
- Maintain conversation context throughout the interview.
- Produce structured feedback at the end of the interview.
- Expose the required HTTP endpoint defined in the Technical Specification.
```

---

## 3. 🎙️ Voice & PDF Report Generation Prompts & Schemas

### PDF Report Template Schema
```html
<title>ABTalks AI Cohort - Interview Evaluation Report</title>
<div class="score">Overall Score: ${score} / 10</div>
<div class="verdict">${verdict}</div>
<div class="summary">${summary}</div>
<div class="strengths">${strengths}</div>
<div class="gaps">${gaps}</div>
<div class="recommendations">${recommendations}</div>
```

---

## 4. 🧠 Breeth AI (Intent-Aware Agent Memory & MCP Integration)

- **Platform**: Breeth AI (`https://mcp.thebreeth.com/mcp`)
- **Integration**: Provides persistent intent-aware memory across interview candidate turns and Model Context Protocol (MCP) tool integration.
- **Config**: `BREETH_API_KEY` configured in `.env` and Render deployment spec.

---

## 5. 📝 User Customization Prompts Log

1. **Architecture Setup**:
   > "ye mera folder ka architecture hai to aap mujhe issi trh bna kr de do folder me completly"

2. **Candidate Profiles Customization**:
   > "priya sharma ki jagah chesta sharma karo aur rahul verma ki jagah sudhanshu prajapati"

3. **Groq API Engine Switching**:
   > "mai groq api use karr rha hu uske liye .env file mein changing karo aur jo code mein changing karna ho wo karo"

4. **Voice & PDF Features**:
   > "1st (Voice Speech-to-Text & Text-to-Speech) and 2nd (Download PDF Report) feature add karo"
