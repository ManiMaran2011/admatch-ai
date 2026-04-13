"""
Agent 5 — Rewriter
Applies the CROPlan surgically to the original HTML.
Uses DOM-level edits — never rewrites the whole page.
Input:  original HTML + CROPlan + AdAnalysis
Output: RewriteResult
"""
import re, logging
from bs4 import BeautifulSoup, Tag
from models.schemas import CROPlan, AdAnalysis, RewriteResult

logger = logging.getLogger(__name__)

def apply_plan(html: str, plan: CROPlan, ad: AdAnalysis) -> RewriteResult:
    soup    = BeautifulSoup(html, "html.parser")
    applied = []
    skipped = []

    # ── Apply each CRO suggestion ─────────────────────────────────────────────
    for s in plan.suggestions:
        el = s.element.lower()
        rep = s.replacement.strip()
        if not rep:
            skipped.append(f"{el}: empty replacement")
            continue

        try:
            if el == "h1":
                tag = soup.find("h1")
                if tag:
                    tag.string = rep
                    applied.append(f"H1 → '{rep[:60]}'")
                else:
                    skipped.append("h1: not found in page")

            elif el in ("h2","subheadline"):
                tag = soup.find("h2")
                if tag:
                    tag.string = rep
                    applied.append(f"H2 → '{rep[:60]}'")
                else:
                    skipped.append("h2: not found in page")

            elif el == "cta":
                updated = _update_cta(soup, rep)
                if updated:
                    applied.append(f"CTA → '{rep[:60]}'")
                else:
                    skipped.append("cta: no CTA element found")

            elif el in ("hero_copy","hero"):
                updated = _update_hero_copy(soup, rep)
                if updated:
                    applied.append(f"Hero copy updated")
                else:
                    skipped.append("hero_copy: no hero element found")

            elif el == "meta_description":
                tag = soup.find("meta", attrs={"name": re.compile(r"description", re.I)})
                if tag and isinstance(tag, Tag):
                    tag["content"] = rep[:160]
                    applied.append("Meta description updated")

        except Exception as e:
            logger.warning(f"rewriter: failed to apply {el}: {e}")
            skipped.append(f"{el}: error during apply")

    # ── Title ─────────────────────────────────────────────────────────────────
    if plan.seo_title:
        title_tag = soup.find("title")
        if title_tag:
            title_tag.string = plan.seo_title
            applied.append(f"Title → '{plan.seo_title}'")

    # ── Inject banners at top of <body> ───────────────────────────────────────
    body = soup.find("body")
    if body:
        if plan.urgency_banner:
            urgency = BeautifulSoup(
                f'<div id="__admatch_urgency__" style="background:#c53030;color:#fff;'
                f'text-align:center;padding:9px 20px;font-size:13px;font-weight:700;'
                f'font-family:-apple-system,sans-serif;">⚡ {plan.urgency_banner}</div>',
                "html.parser"
            )
            body.insert(0, urgency)
            applied.append("Urgency banner injected")

        banner_text = plan.personalization_banner or "This page was personalized for you."
        banner = BeautifulSoup(
            f'<div id="__admatch_banner__" style="background:linear-gradient(90deg,#7c3aed,#4f46e5);'
            f'color:#fff;text-align:center;padding:10px 20px;font-size:13px;font-weight:600;'
            f'font-family:-apple-system,sans-serif;letter-spacing:.03em;">✦ {banner_text} ✦</div>',
            "html.parser"
        )
        body.insert(0, banner)
        applied.append("Personalization banner injected")

    # ── Metadata tags ─────────────────────────────────────────────────────────
    head = soup.find("head")
    if head:
        meta_html = (
            f'<meta name="x-personalized-by" content="AdMatch AI v2">'
            f'<meta name="x-ad-product" content="{ad.product_category}">'
            f'<meta name="x-confidence" content="{plan.confidence_score}">'
            f'<meta name="x-changes" content="{len(applied)}">'
        )
        head.append(BeautifulSoup(meta_html, "html.parser"))

    return RewriteResult(
        personalized_html=str(soup),
        changes_applied=applied,
        changes_skipped=skipped,
    )


# ── DOM Helpers ───────────────────────────────────────────────────────────────

def _update_cta(soup: BeautifulSoup, text: str) -> bool:
    """Find and update the primary CTA. Returns True if updated."""
    # Priority order: classes → first button → first link
    for cls in ["cta","btn-primary","button-primary","btn-cta","hero-cta"]:
        els = soup.find_all(attrs={"class": re.compile(cls, re.I)})
        for el in els[:2]:
            el.string = text
            return True

    btn = soup.find("button")
    if btn:
        btn.string = text
        return True

    return False

def _update_hero_copy(soup: BeautifulSoup, text: str) -> bool:
    """Find and update the hero paragraph/subtext."""
    # Try hero section paragraphs
    for sel in ["[class*='hero'] p","[class*='banner'] p","[class*='jumbotron'] p","section p"]:
        el = soup.select_one(sel)
        if el and len(el.get_text(strip=True)) > 20:
            el.string = text
            return True
    return False