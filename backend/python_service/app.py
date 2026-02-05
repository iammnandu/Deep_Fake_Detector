from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
from PIL import Image
import io

MODEL_ID = "Ateeqq/ai-vs-human-image-detector"

app = FastAPI(title="AI Image Detector")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = pipeline("image-classification", model=MODEL_ID)

@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_ID}

@app.post("/detect")
async def detect(image: UploadFile = File(...)):
    content = await image.read()
    img = Image.open(io.BytesIO(content)).convert("RGB")

    scores = classifier(img)
    top = max(scores, key=lambda x: x["score"])
    label_lower = top["label"].lower()

    if "fake" in label_lower or "ai" in label_lower or "generated" in label_lower:
        verdict = "AI-Generated"
    elif "real" in label_lower or "authentic" in label_lower:
        verdict = "Real"
    else:
        verdict = top["label"]

    confidence = round(top["score"] * 100)

    return {
        "verdict": verdict,
        "confidence": confidence,
        "raw": scores
    }
