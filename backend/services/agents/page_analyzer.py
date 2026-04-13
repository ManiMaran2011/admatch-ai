"""
Agent 2 — Page Analyzer
Fetches the landing page, parses its DOM structure,
and extracts every messaging element we can personalize.
Input:  URL string
Output: PageAnalysis + raw HTML
"""
import re, logging
import httpx
from bs4 import BeautifulSoup, Tag
from models.schemas import PageAnalysis
from utils.config import settings

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
}

async def fetch_and_analyze(url: str) -> tuple[PageAnalysis, str]:
    """Returns (PageAnalysis, raw_html)"""
    # 1. Fetch
    async with httpx.AsyncClient(
        follow_redirects=True, timeout=settings.SCRAPE_TIMEOUT_SECONDS,
        headers=HEADERS, verify=False,
    ) as c:
        r = await c.get(url)
        r.raise_for_status()
        html = r.text
        if len(html.encode()) > settings.MAX_HTML_SIZE_BYTES:
            html = html[:settings.MAX_HTML_SIZE_BYTES]

    # 2. Parse
    soup = BeautifulSoup(html, "html.parser")

    # Remove noise
    for tag in soup(["script","style","noscript","svg","path","head > meta[name='robots']"]):
        tag.decompose()

    def txt(el) -> str:
        return el.get_text(" ", strip=True) if el else ""

    # Title & meta
    title     = txt(soup.find("title"))
    meta_el   = soup.find("meta", attrs={"name": re.compile(r"description", re.I)})
    meta_desc = (meta_el.get("content","") if isinstance(meta_el, Tag) else "") or ""

    # Headings
    h1  = txt(soup.find("h1"))
    h2s = [txt(h) for h in soup.find_all("h2")[:8] if txt(h)]

    # Hero section — try common hero selectors
    hero_copy = ""
    for sel in ["[class*='hero']","[class*='banner']","[id*='hero']","section:first-of-type"]:
        el = soup.select_one(sel)
        if el:
            hero_copy = txt(el)[:400]
            break

    # CTA buttons
    cta_texts = []
    for el in soup.find_all(["button","a"]):
        t    = txt(el).strip()
        href = el.get("href","") if el.name == "a" else ""
        kws  = ["signup","sign-up","register","start","buy","get","try","demo","free","now"]
        is_cta = (
            any(k in str(href).lower() for k in kws) or
            any(k in " ".join(el.get("class",[])).lower() for k in ["cta","btn-primary","primary"]) or
            el.name == "button"
        )
        if t and len(t) < 60 and is_cta:
            cta_texts.append(t)
    cta_texts = list(dict.fromkeys(cta_texts))[:6]

    # Value props — look for feature/benefit lists
    value_props = []
    for el in soup.select("[class*='feature'],[class*='benefit'],[class*='value']"):
        t = txt(el).strip()[:120]
        if t and len(t) > 20:
            value_props.append(t)
    value_props = value_props[:5]

    # Body snippet for tone detection
    body_text   = re.sub(r"\s+", " ", soup.get_text(" ", strip=True))
    body_snippet = body_text[:2500]

    # Guess audience from body text
    audience_clues = []
    for word in ["developer","marketer","founder","startup","enterprise","small business","student","designer"]:
        if word in body_text.lower():
            audience_clues.append(word)
    detected_audience = ", ".join(audience_clues[:3]) if audience_clues else "general"

    page = PageAnalysis(
        title=title,
        meta_description=str(meta_desc),
        h1=h1,
        h2s=h2s,
        hero_copy=hero_copy,
        cta_texts=cta_texts,
        value_props=value_props,
        tone="professional",      # set by gap_detector later
        body_snippet=body_snippet,
        detected_audience=detected_audience,
    )
    return page, html