import os
import base64
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic

app = FastAPI(title="AgriDome Lite API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

NIGERIAN_FARMING_CONTEXT = """
You are AgriDome Advisor, an expert agricultural assistant specializing in greenhouse farming
for Nigerian smallholder farmers. You have deep knowledge of:

- West African climate zones (Sudan Savanna, Guinea Savanna, Forest zones, Sahel)
- Crops popular in Nigeria: tomatoes, peppers, cucumber, lettuce, spinach, okra, waterleaf,
  ugwu (fluted pumpkin), bitter leaf, eggplant, and others
- Nigerian market prices and value chains (mentioning Naira when relevant)
- Local pest pressures: tomato leaf miner, cotton stainer, aphids, whitefly, pod borer
- Common diseases: early/late blight, bacterial wilt, fusarium, cercospora
- Nigerian growing seasons and the harmattan season
- Affordable inputs available in Nigerian agro-input stores
- State-specific advice for Kano, Lagos, Abuja, Enugu, Ibadan, Port Harcourt, Plateau State, etc.
- Both traditional and modern greenhouse techniques appropriate for smallholder budgets

Always be practical, specific to Nigerian conditions, and considerate of limited budgets.
Mention specific Nigerian brands, markets, or extension services when helpful.
When asked to respond in Igbo, Hausa, or Yoruba, do your best to use that language naturally,
mixing with English technical terms where the local equivalent is unclear.
"""


class ChatRequest(BaseModel):
    message: str
    language_instruction: str = "Please respond in English."
    history: list[dict] = []


class PestScanRequest(BaseModel):
    image_base64: str
    crop_context: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok", "service": "agridome-lite"}


@app.post("/api/chat")
def chat(req: ChatRequest):
    system = NIGERIAN_FARMING_CONTEXT + "\n\n" + req.language_instruction

    messages = []
    for h in req.history[-10:]:
        if h.get("role") in ("user", "assistant") and h.get("content"):
            messages.append({"role": h["role"], "content": h["content"]})

    # Ensure last message is the current user input
    if not messages or messages[-1]["role"] != "user" or messages[-1]["content"] != req.message:
        messages.append({"role": "user", "content": req.message})

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=system,
            messages=messages,
        )
        return {"response": response.content[0].text}
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.post("/api/pest-scan")
def pest_scan(req: PestScanRequest):
    crop_ctx = f" The crop is {req.crop_context}." if req.crop_context else ""
    prompt = (
        f"Analyse this greenhouse crop photo taken by a Nigerian smallholder farmer.{crop_ctx}\n\n"
        "Please:\n"
        "1. Identify any pests, diseases, or nutrient deficiencies visible\n"
        "2. Assess severity (healthy / mild / moderate / severe)\n"
        "3. Suggest 2-3 specific, affordable treatment or management actions\n"
        "4. Mention any preventive steps for the future\n\n"
        "Keep the response practical, concise (under 250 words), and relevant to Nigerian farming conditions."
    )

    try:
        # Validate base64
        base64.b64decode(req.image_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image data")

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=512,
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
        return {"result": response.content[0].text}
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=str(e))
