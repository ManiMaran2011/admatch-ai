import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from services.pipeline import run_pipeline
from utils.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()
ALLOWED = {"image/jpeg","image/png","image/webp","image/gif"}

@router.post("/personalize")
async def personalize(
    landing_page_url: str                     = Form(...),
    ad_image_url:     Optional[str]           = Form(None),
    ad_image_file:    Optional[UploadFile]    = File(None),
):
    if not landing_page_url.startswith("http"):
        raise HTTPException(400, "landing_page_url must start with http")
    if not ad_image_url and not ad_image_file:
        raise HTTPException(400, "Provide ad_image_url or ad_image_file")

    # Resolve image
    img_bytes, img_mime = None, "image/jpeg"
    if ad_image_file:
        if ad_image_file.content_type not in ALLOWED:
            raise HTTPException(400, f"Unsupported image type: {ad_image_file.content_type}")
        img_bytes = await ad_image_file.read()
        if len(img_bytes) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise HTTPException(400, "File too large")
        img_mime = ad_image_file.content_type

    try:
        result = await run_pipeline(
            landing_page_url=landing_page_url,
            ad_image_url=ad_image_url if not img_bytes else None,
            ad_image_bytes=img_bytes,
            ad_image_mime=img_mime,
        )
        return result
    except Exception as e:
        logger.error(f"Pipeline error: {e}", exc_info=True)
        raise HTTPException(500, f"Pipeline failed: {str(e)}")