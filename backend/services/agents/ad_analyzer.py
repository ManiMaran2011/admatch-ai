"""
Agent 1 — Ad Analyzer
Reads the ad image and extracts every messaging signal.
Input:  image bytes or URL
Output: AdAnalysis
"""
import base64, json, re, logging
from openai import AsyncOpenAI
from models.schemas import AdAnalysis
from utils.config import settings

logger = logging.getLogger(__name__)
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM = "You are an expert ad creative analyst. Extract messaging signals precisely. Return ONLY valid JSON."

PROMPT = """Analyze this ad creative and extract ALL messaging signals.
Return ONLY this JSON, no markdown, no extra text:
{
  "headline": "exact headline text from ad",
  "value_proposition": "core promise in 1-2 sentences",
  "offer": "specific offer (discount, trial, feature) if present",
  "target_audience": "precise audience description",
  "intent": "awareness|consideration|conversion",
  "tone": "tone descriptor",
  "cta_copy": "exact CTA text",
  "emotional_hook": "emotional trigger used",
  "urgency_signals": "urgency/scarcity present or empty string",
  "product_category": "product/service category",
  "key_benefits": ["benefit1","benefit2","benefit3"],
  "keywords": ["kw1","kw2","kw3"],
  "brand_colors": ["#hex1","#hex2"],
  "confidence": 0.9
}"""

FALLBACK = AdAnalysis(
    headline="Your Solution",
    value_proposition="A compelling solution for your needs",
    offer="",
    target_audience="General audience",
    intent="conversion",
    tone="professional",
    cta_copy="Get Started",
    emotional_hook="value",
    urgency_signals="",
    product_category="product",
    key_benefits=["Benefit 1","Benefit 2","Benefit 3"],
    keywords=["solution","value","results"],
    brand_colors=[],
    confidence=0.4,
)

def _parse(text: str) -> dict:
    cleaned = re.sub(r"```json|```", "", text).strip()
    try:
        return json.loads(cleaned)
    except Exception:
        m = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if m:
            try: return json.loads(m.group())
            except Exception: pass
    return {}

async def analyze_ad_from_url(image_url: str) -> AdAnalysis:
    try:
        r = await client.chat.completions.create(
            model=settings.OPENAI_MODEL_VISION,
            max_tokens=800,
            messages=[{"role":"user","content":[
                {"type":"image_url","image_url":{"url":image_url,"detail":"high"}},
                {"type":"text","text":PROMPT},
            ]}],
        )
        d = _parse(r.choices[0].message.content or "")
        if not d: return FALLBACK
        return AdAnalysis(**{k: d.get(k, getattr(FALLBACK, k)) for k in FALLBACK.model_fields})
    except Exception as e:
        logger.error(f"ad_analyzer error: {e}")
        return FALLBACK

async def analyze_ad_from_bytes(data: bytes, mime: str) -> AdAnalysis:
    try:
        url = f"data:{mime};base64,{base64.b64encode(data).decode()}"
        r = await client.chat.completions.create(
            model=settings.OPENAI_MODEL_VISION,
            max_tokens=800,
            messages=[{"role":"user","content":[
                {"type":"image_url","image_url":{"url":url,"detail":"high"}},
                {"type":"text","text":PROMPT},
            ]}],
        )
        d = _parse(r.choices[0].message.content or "")
        if not d: return FALLBACK
        return AdAnalysis(**{k: d.get(k, getattr(FALLBACK, k)) for k in FALLBACK.model_fields})
    except Exception as e:
        logger.error(f"ad_analyzer bytes error: {e}")
        return FALLBACK