# Mental Wellness Tracker — Implementation Plan

## Architecture

**Frontend:** React + TypeScript + Vite  
**Backend:** FastAPI (minimal — AI proxy only)  
**Database:** None (session-only state)  
**AI:** Anthropic Claude (user supplies own API key, never stored)

---

## Project Structure

```
PromptWarsMain/
├── backend/
│   ├── main.py              # FastAPI app — single /api/insight endpoint
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx          # Session state + screen routing
│   │   ├── types.ts         # Shared types
│   │   ├── screens/
│   │   │   ├── Setup.tsx    # API key + name + exam type
│   │   │   ├── CheckIn.tsx  # Mood slider + triggers + reflection
│   │   │   └── Insights.tsx # Chart + AI wellness message
│   │   ├── components/
│   │   │   ├── MoodSlider.tsx
│   │   │   ├── TriggerSelector.tsx
│   │   │   └── MoodChart.tsx
│   │   └── api.ts           # Backend call (POST /api/insight)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── implementation.md
```

---

## Data Flow

```
User enters API key → stored in React state only (never localStorage, never backend)
User logs check-in  → appended to session mood history (React state array)
User requests insight → POST /api/insight with {name, exam_type, mood_history, api_key as header}
FastAPI              → forwards to Anthropic Claude API → returns wellness message
Session ends         → all data gone
```

---

## Screens

### 1. Setup
- Name input
- Exam type selector: JEE / NEET / CAT / GATE / UPSC / CUET / Board Exams
- API key input (password field, note: never stored)
- CTA: "Start Tracking"

### 2. Daily Check-In
- Mood slider 1–10 (with emoji anchors: 😞 at 1, 😐 at 5, 😊 at 10)
- Stress trigger checkboxes (8 options: Syllabus Overload, Sleep Deprivation, Peer Pressure, Fear of Failure, Time Management, Family Expectations, Health Issues, Social Isolation)
- Optional free-text reflection
- CTAs: "Get Insights" (generates AI message) | "Log Only" (saves to session, no AI call)

### 3. Insights
- Mood history line chart (recharts) — shows all check-ins this session
- AI-generated wellness message (personalized to exam type + triggers + mood)
- CTA: "New Check-in"

---

## Backend: POST /api/insight

**Request headers:** `X-API-Key: <user key>`  
**Request body:**
```json
{
  "name": "Arjun",
  "exam_type": "JEE",
  "mood_history": [
    { "mood": 4, "triggers": ["Fear of Failure", "Sleep Deprivation"], "reflection": "feeling behind on syllabus", "timestamp": "10:30 AM" }
  ]
}
```
**Response:**
```json
{ "message": "..." }
```

---

## Packages

### Backend (pip)
- fastapi
- uvicorn[standard]
- anthropic

### Frontend (npm)
- react, react-dom
- typescript, @types/react, @types/react-dom
- vite, @vitejs/plugin-react
- recharts

---

## Execution Steps

1. Create backend/requirements.txt + backend/main.py  
2. Create frontend scaffold (Vite + React + TS)  
3. Build types.ts + api.ts  
4. Build Setup screen  
5. Build CheckIn screen (MoodSlider + TriggerSelector)  
6. Build Insights screen (MoodChart + AI message display)  
7. Wire App.tsx (session state + screen routing)  
8. Install deps + verify both servers start  

---

## Evaluation Criterion Coverage

| Criterion | How we hit it |
|---|---|
| Code Quality | TypeScript, small focused files, no dead code |
| Security | API key in React state only, never persisted, passed as header |
| Efficiency | No DB, minimal backend, single API call per insight request |
| Testing | Pure functions for prompt building, clean component boundaries |
| Accessibility | Semantic HTML, ARIA labels on slider/checkboxes, keyboard nav |
| Problem Alignment | Mood tracking + trigger identification + reflection + AI support — all 4 requirements |
