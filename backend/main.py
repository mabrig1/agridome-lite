import base64
import binascii
import os
from typing import Optional

import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="AgriDome Lite API", version="1.1.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]
allow_credentials = "*" not in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

AI_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
MAX_IMAGE_BYTES = int(os.getenv("MAX_IMAGE_BYTES", "6000000"))

NIGERIAN_FARMING_CONTEXT = """
You are AgriDome Advisor, an agricultural decision-support assistant for Nigerian smallholder
greenhouse and intensive vegetable farmers.

You should provide practical guidance on:
- West African climate zones, heat, humidity, rainfall and harmattan conditions
- Nigerian vegetable and greenhouse crops, crop stages, irrigation and low-cost production
- Common pests, diseases and nutrient problems
- Integrated pest management (IPM), sanitation, scouting and prevention
- Farm economics, record keeping and post-harvest handling

Decision-support rules:
- Separate observations, likely explanations and recommended next actions.
- Do not pretend that a photo or chat message proves a diagnosis.
- If information is incomplete, say what the farmer should inspect or measure next.
- Prefer non-chemical and IPM measures first where appropriate.
- For pesticide choices, never invent a product, dose, pre-harvest interval or legal approval.
  Tell the farmer to follow the registered product label and local extension guidance.
- Do not invent current market prices, brands, weather, outbreaks or government programmes.
  If the user asks for live information that you do not have, clearly say it needs verification.
- Escalate severe, fast-spreading, unknown or high-loss crop problems to a qualified extension
  officer, agronomist or plant-health professional.
- Keep recommendations affordable and realistic for smallholder conditions.

When asked to respond in Igbo, Hausa or Yoruba, use that language naturally while retaining
English technical terms where translation would reduce clarity.
"""


def get_client() -> anthropic.Anthropic:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="AI service is not configured")
    return anthropic.Anthropic(api_key=api_key)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    language_instruction: str = Field(
        default="Please respond in English.",
        max_length=300,
    )
    history: list[dict] = Field(default_factory=list, max_length=20)


class PestScanRequest(BaseModel):
    image_base64: str = Field(min_length=16)
    crop_context: Optional[str] = Field(default=None, max_length=120)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "agridome-lite",
        "version": "1.1.0",
        "ai_configured": bool(os.getenv("ANTHROPIC_API_KEY")),
        "model": AI_MODEL,
    }


@app.post("/api/chat")
def chat(req: ChatRequest):
    system = NIGERIAN_FARMING_CONTEXT + "\n\n" + req.language_instruction

    messages = []
    for item in req.history[-10:]:
        role = item.get("role")
        content = item.get("content")
        if role in ("user", "assistant") and isinstance(content, str) and content.strip():
            messages.append({"role": role, "content": content[:4000]})

    if (
        not messages
        or messages[-1]["role"] != "user"
        or messages[-1]["content"] != req.message
    ):
        messages.append({"role": "user", "content": req.message})

    try:
        response = get_client().messages.create(
            model=AI_MODEL,
            max_tokens=1024,
            system=system,
            messages=messages,
        )
        return {"response": response.content[0].text}
    except HTTPException:
        raise
    except anthropic.APIError:
        raise HTTPException(status_code=502, detail="AI advisor is temporarily unavailable")


@app.post("/api/pest-scan")
def pest_scan(req: PestScanRequest):
    crop_ctx = f" Crop context supplied by the farmer: {req.crop_context}." if req.crop_context else ""
    prompt = (
        f"Analyse this crop photo from a Nigerian smallholder farmer.{crop_ctx}\n\n"
        "Return a concise field triage note with these headings:\n"
        "OBSERVATION: visible symptoms only.\n"
        "LIKELY CAUSES: up to 3 possibilities; do not claim certainty from the photo alone.\n"
        "SEVERITY: healthy / mild / moderate / severe / unclear.\n"
        "NEXT ACTIONS: 3 practical actions, prioritising scouting, sanitation and IPM.\n"
        "ESCALATE IF: signs that require an extension officer or plant-health professional.\n\n"
        "Do not invent pesticide labels, dosages, market availability or legal approvals."
    )

    try:
        decoded = base64.b64decode(req.image_base64, validate=True)
    except (binascii.Error, ValueError):
        raise HTTPException(status_code=400, detail="Invalid image data")

    if len(decoded) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image is too large")

    try:
        response = get_client().messages.create(
            model=AI_MODEL,
            max_tokens=650,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": req.image_base64,
                            },
                        },
                        {"type": "text", "text": prompt},
                    ],
                }
            ],
        )
        return {
            "result": response.content[0].text,
            "disclaimer": "Photo analysis is decision support, not a laboratory diagnosis.",
        }
    except HTTPException:
        raise
    except anthropic.APIError:
        raise HTTPException(status_code=502, detail="Crop-health analysis is temporarily unavailable")
