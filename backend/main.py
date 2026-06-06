import os
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import errors as genai_errors

app = FastAPI(title="Mental Wellness Tracker API")

_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = [o.strip() for o in _origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class CheckIn(BaseModel):
    mood: int
    triggers: list[str]
    reflection: str
    timestamp: str  # ISO 8601


class InsightRequest(BaseModel):
    name: str
    exam_type: str
    model: str
    mood_history: list[CheckIn]


def build_prompt(req: InsightRequest) -> str:
    latest = req.mood_history[-1]

    history_lines = []
    for c in req.mood_history:
        date_part = c.timestamp[:10]
        triggers_part = ", ".join(c.triggers) if c.triggers else "none"
        history_lines.append(f"  {date_part}: mood {c.mood}/10, triggers: {triggers_part}")
    history_str = "\n".join(history_lines)

    triggers_str = ", ".join(latest.triggers) if latest.triggers else "none reported"
    reflection_str = f'"{latest.reflection}"' if latest.reflection else "no reflection provided"

    return (
        f"You are a compassionate mental wellness coach for Indian students. "
        f"{req.name} is preparing for {req.exam_type}. "
        f"Their recent check-in history (up to last 7 entries):\n{history_str}\n\n"
        f"Latest check-in — mood: {latest.mood}/10, stress triggers: {triggers_str}, "
        f"reflection: {reflection_str}. "
        f"Write a warm, encouraging, and specific 3-4 sentence wellness message. "
        f"If you notice a recurring pattern in their history (e.g. the same triggers appearing "
        f"multiple times, or a declining mood trend), address it directly. "
        f"Offer one concrete, actionable tip. Do not be generic. Do not use bullet points."
    )


@app.get("/api/models")
async def list_models(x_api_key: str = Header(...)):
    try:
        client = genai.Client(api_key=x_api_key)
        models = []
        for m in client.models.list():
            actions = getattr(m, "supported_actions", []) or []
            if "generateContent" not in actions:
                continue
            model_id = m.name.removeprefix("models/")
            models.append({"id": model_id, "label": m.display_name or model_id})
        return {"models": models}
    except genai_errors.ClientError as e:
        status_code = getattr(e, "status_code", 400)
        if status_code in (401, 403):
            raise HTTPException(status_code=401, detail="Invalid API key.")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")


@app.post("/api/insight")
async def get_insight(req: InsightRequest, x_api_key: str = Header(...)):
    try:
        client = genai.Client(api_key=x_api_key)
        response = client.models.generate_content(
            model=req.model,
            contents=build_prompt(req),
        )
        return {"message": response.text}
    except genai_errors.ClientError as e:
        status_code = getattr(e, "status_code", 400)
        if status_code in (401, 403):
            raise HTTPException(status_code=401, detail="Invalid API key.")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")
