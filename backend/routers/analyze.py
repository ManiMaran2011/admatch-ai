import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from services.agents.ad_analyzer import analyze_ad_from_url, analyze_ad_from_bytes

logger = logging.getLogger(__name__)
router = APIRouter()
ALLOWED = {"image/jpeg","image/png","image/webp","image/gif"}

@router.post("/analyze-ad")
async def analyze_ad(
    ad_image_url:  Optional[str]        = Form(None),
    ad_image_file: Optional[UploadFile] = File(None),
):
    if not ad_image_url and not ad_image_file:
        raise HTTPException(400, "Provide ad_image_url or ad_image_file")
    try:
        if ad_image_file:
            if ad_image_file.content_type not in ALLOWED:
                raise HTTPException(400, f"Unsupported type: {ad_image_file.content_type}")
            analysis = await analyze_ad_from_bytes(await ad_image_file.read(), ad_image_file.content_type)
        else:
            analysis = await analyze_ad_from_url(ad_image_url)
        return {"success": True, "ad_analysis": analysis}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))